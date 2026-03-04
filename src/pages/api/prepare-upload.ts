// src/pages/api/prepare-upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
const BUCKET = "screenshots";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  throw new Error("Missing SUPABASE env vars");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

function rateLimit(ip: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitStore.set(ip, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count < limit) {
    entry.count++;
    return true;
  }
  return false;
}

type Data =
  | { ok: true; id: string; signedUrl: string; url: string }
  | { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    if (!rateLimit(ip)) {
      return res.status(429).json({
        ok: false,
        error: "Too many requests. Please wait a minute.",
      });
    }

    const { fileName, fileSize, expirySeconds = 3600, maxViews = 1 } = req.body as {
      fileName?: string;
      fileSize?: number;
      expirySeconds?: number;
      maxViews?: number;
    };

    if (!fileName || !fileSize) {
      return res.status(400).json({ ok: false, error: "Missing metadata parameters" });
    }

    const maxBytes = parseInt(process.env.MAX_UPLOAD_SIZE ?? "8", 10) * 1024 * 1024;
    
    if (fileSize > maxBytes) {
      return res.status(400).json({
        ok: false,
        error: `Payload exceeds configured limit of ${process.env.MAX_UPLOAD_SIZE ?? 8}MB`,
      });
    }

    const id = randomUUID();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${id}/${safeFileName}.enc`;

    const expiryAt = new Date(Date.now() + expirySeconds * 1000).toISOString();
    
    const { error: dbError } = await supabaseAdmin
      .from("screenshots")
      .insert([
        {
          id,
          file_path: path,
          expiry_at: expiryAt,
          max_views: maxViews,
        },
      ]);

    if (dbError) {
      console.error("Database initialization error:", dbError);
      return res.status(500).json({ ok: false, error: dbError.message });
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (uploadError || !uploadData) {
      console.error("Storage signature error:", uploadError);
      await supabaseAdmin.from("screenshots").delete().eq("id", id);
      return res.status(500).json({ ok: false, error: uploadError?.message || "Failed to generate upload signature" });
    }

    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const requestBaseUrl = `${protocol}://${host}`;
    
    const finalBaseUrl = BASE_URL || requestBaseUrl;
    const shareUrl = `${finalBaseUrl}/view/${id}`;

    return res.status(200).json({ ok: true, id, signedUrl: uploadData.signedUrl, url: shareUrl });
  } catch (err: any) {
    console.error("Prepare upload API error:", err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
}