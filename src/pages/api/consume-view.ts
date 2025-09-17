// pages/api/consume-view.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
const BUCKET = "screenshots";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  throw new Error("Missing SUPABASE env vars");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

type RespError =
  | { ok: false; reason: "not_found" | "expired" | "error"; message?: string };
type RespOk = {
  ok: true;
  fileUrl: string; // signed url
  remainingViews: number | null;
  expiry_at?: string | null;
  secondsLeft?: number | null;
};
type Resp = RespError | RespOk;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, reason: "error", message: "Method not allowed" });
  }

  try {
    const { id } = req.body as { id?: string };
    if (!id) return res.status(400).json({ ok: false, reason: "error", message: "Missing id" });

    // === CALL RPC that atomically checks and increments ===
    const { data: rpcRows, error: rpcError } = await supabaseAdmin.rpc("consume_screenshot", { p_id: id });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return res.status(500).json({ ok: false, reason: "error", message: "DB error" });
    }

    if (!rpcRows || !Array.isArray(rpcRows) || rpcRows.length === 0) {
      return res.status(404).json({ ok: false, reason: "not_found" });
    }

    const row = rpcRows[0] as {
      status: string;
      file_path: string | null;
      expiry_at: string | null;
      remaining_views: number | null;
      will_deactivate: boolean | null;
    };

    if (row.status === "not_found") return res.status(404).json({ ok: false, reason: "not_found" });
    if (row.status === "expired") return res.status(410).json({ ok: false, reason: "expired" });

    // now status === 'ok'
    if (!row.file_path) {
      // weird: DB says ok but no file path
      console.error("consume-view: ok but no file_path", id);
      return res.status(500).json({ ok: false, reason: "error", message: "Missing file path" });
    }

    // compute time left until expiry (if any)
    let secondsLeft: number | null = null;
    if (row.expiry_at) {
      const expiryTs = new Date(row.expiry_at).getTime();
      secondsLeft = Math.max(0, Math.ceil((expiryTs - Date.now()) / 1000));
    }

    // sign url duration: keep short, at most 300s and not longer than expiry
    const signDuration = Math.max(1, Math.min(300, secondsLeft ?? 300));

    const { data: signedData, error: signedErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(row.file_path, signDuration);

    if (signedErr || !signedData?.signedUrl) {
      console.error("Signed URL error:", signedErr);
      return res.status(500).json({ ok: false, reason: "error", message: "Failed to generate signed URL" });
    }

    // respond with signed URL but property name preserved as `fileUrl` for your frontend
    res.status(200).json({
      ok: true,
      fileUrl: signedData.signedUrl,
      remainingViews: row.remaining_views,
      expiry_at: row.expiry_at ?? null,
      secondsLeft: secondsLeft ?? null,
    });

    // async cleanup: if this consumption deactivated the row, delete file & mark DB
    const willDeactivate = !!row.will_deactivate;
    if (willDeactivate) {
      (async () => {
        try {
          const { error: removeErr } = await supabaseAdmin.storage.from(BUCKET).remove([row.file_path as string]);
          if (removeErr) {
            console.error("Failed to remove file after last view:", removeErr);
          } else {
            // mark file_path null + is_removed true + ensure is_active false
            await supabaseAdmin
              .from("screenshots")
              .update({ file_path: null, is_removed: true, is_active: false })
              .eq("id", id)
              .catch((e) => console.error("Failed to mark DB removed:", e));
          }
        } catch (e) {
          console.error("Async cleanup error:", e);
        }
      })();
    }
  } catch (err: any) {
    console.error("consume-view error:", err);
    return res.status(500).json({ ok: false, reason: "error", message: err?.message ?? String(err) });
  }
}