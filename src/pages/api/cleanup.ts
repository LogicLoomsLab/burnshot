// src/pages/api/cleanup.ts
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
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Only GET is allowed" });

  const incomingSecret = req.headers["x-cleanup-secret"];
  if (!CLEANUP_SECRET || incomingSecret !== CLEANUP_SECRET) {
    return res.status(401).json({ ok: false, error: "Unauthorized: Invalid or missing x-cleanup-secret" });
  }

  try {
    // 1. Fetch candidates
    const { data: rows, error } = await supabaseAdmin
      .from("screenshots")
      .select("id, file_path, expiry_at, max_views, views, is_active")
      .limit(1000);

    if (error) {
      console.error("Cleanup: DB fetch error:", error);
      return res.status(500).json({ ok: false, error: "Database fetch failed", details: error });
    }

    const now = new Date();
    
    // 2. Filter out rows that require deletion
    const toDelete = (rows || []).filter((r: any) => {
      if (!r.file_path) return false;
      if (r.is_active === false) return true;
      if (r.expiry_at && new Date(r.expiry_at) <= now) return true;
      if (r.max_views !== null && r.max_views !== undefined && r.views >= r.max_views) return true;
      
      return false;
    });

    if (toDelete.length === 0) {
      return res.status(200).json({ ok: true, message: "No expired files found", deleted: 0 });
    }

    // 3. Process in parallel with strict error catching
    const results = await Promise.allSettled(
      toDelete.map(async (r: any) => {
        try {
          // Remove from Storage
          const { error: rmErr } = await supabaseAdmin.storage
            .from(BUCKET)
            .remove([r.file_path]);

          if (rmErr) throw new Error(`Storage remove error: ${rmErr.message}`);

          // Soft-delete the database record
          const { error: updErr } = await supabaseAdmin
            .from("screenshots")
            .update({ file_path: null, is_removed: true, is_active: false })
            .eq("id", r.id);

          if (updErr) throw new Error(`DB update error: ${updErr.message}`);

          return { id: r.id, removed: true };
        } catch (e: any) {
          console.error(`Failed to clean up ID ${r.id}:`, e);
          return { id: r.id, removed: false, error: String(e) };
        }
      })
    );

    const deletedCount = results.filter(
      (r) => r.status === "fulfilled" && (r as any).value?.removed === true
    ).length;

    return res.status(200).json({
      ok: true,
      examined: rows?.length || 0,
      flagged_for_deletion: toDelete.length,
      successfully_deleted: deletedCount,
      details: results,
    });
  } catch (err: any) {
    console.error("Fatal cleanup error:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}