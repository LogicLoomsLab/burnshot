// pages/api/cleanup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
const BUCKET = "screenshots";
const CLEANUP_SECRET = process.env.CLEANUP_SECRET || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  throw new Error("Missing SUPABASE env vars");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Only GET");

  const incomingSecret = req.headers["x-cleanup-secret"];
  if (!CLEANUP_SECRET || incomingSecret !== CLEANUP_SECRET) {
    return res.status(401).end("Unauthorized");
  }

  try {
    // fetch candidates
    const { data: rows, error } = await supabaseAdmin
      .from("screenshots")
      .select("id, file_path, expiry_at, max_views, views, is_active")
      .limit(1000);

    if (error) {
      console.error("Cleanup: DB fetch error:", error);
      return res.status(500).json({ ok: false, message: "DB error" });
    }

    const now = new Date();
    const toDelete = (rows || []).filter((r: any) => {
      if (!r.file_path) return false;
      if (!r.is_active) return true;
      if (r.expiry_at && new Date(r.expiry_at) <= now) return true;
      if (
        r.max_views !== null &&
        r.max_views !== undefined &&
        r.views >= r.max_views
      )
        return true;
      return false;
    });

    if (toDelete.length === 0) {
      return res.status(200).json({ ok: true, deleted: 0 });
    }

    // process in parallel
    const results = await Promise.allSettled(
      toDelete.map(async (r: any) => {
        try {
          const filePath = r.file_path;
          const { error: rmErr } = await supabaseAdmin.storage
            .from(BUCKET)
            .remove([filePath]);

          const { error: updErr } = await supabaseAdmin
            .from("screenshots")
            .update({ file_path: null, is_removed: true, is_active: false })
            .eq("id", r.id);

          return { id: r.id, removed: !rmErr, rmErr, updErr };
        } catch (e) {
          return { id: r.id, removed: false, error: String(e) };
        }
      })
    );

    const deletedCount = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        (r as any).value &&
        (r as any).value.removed
    ).length;

    return res.status(200).json({
      ok: true,
      examined: toDelete.length,
      deleted: deletedCount,
      details: results,
    });
  } catch (err: any) {
    console.error("cleanup error:", err);
    return res.status(500).json({ ok: false, message: String(err) });
  }
}