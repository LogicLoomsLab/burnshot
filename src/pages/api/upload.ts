// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
const BUCKET = "screenshots";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

// ---- Simple in-memory rate limiter ----
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

function rateLimit(ip: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.lastReset > windowMs) {
    // reset window
    rateLimitStore.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count < limit) {
    entry.count++;
    return true;
  }

  return false; // over limit
}

type Data =
  | { ok: true; id: string; url: string }
  | { ok: false; error: string };

export const config = {
  api: {
    bodyParser: {
      sizeLimit: `${process.env.MAX_UPLOAD_SIZE ?? 8}mb`, // hard cap
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Method not allowed" });
  }

  try {
    // ---- Rate limiting ----
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    if (!rateLimit(ip)) {
      return res.status(429).json({
        ok: false,
        error: "Too many uploads. Please wait a minute.",
      });
    }

    const {
      fileName,
      fileBase64,
      expirySeconds = 3600,
      maxViews = 1,
    } = req.body as {
      fileName?: string;
      fileBase64?: string;
      expirySeconds?: number;
      maxViews?: number;
    };

    if (!fileName || !fileBase64) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing fileName or fileBase64" });
    }

    // ---- Extra server-side file size validation ----
    const buffer = Buffer.from(fileBase64, "base64");
    const maxBytes =
      parseInt(process.env.MAX_UPLOAD_SIZE ?? "8", 10) *
      1024 *
      1024;
    if (buffer.length > maxBytes) {
      return res.status(400).json({
        ok: false,
        error: `File too large. Max allowed is ${
          process.env.MAX_UPLOAD_SIZE ?? 8
        }MB`,
      });
    }

    const id = randomUUID();
    const path = `${id}/${fileName}`;

    // infer content type
    const ext = fileName.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    if (ext === "png") contentType = "image/png";
    if (ext === "gif") contentType = "image/gif";
    if (ext === "webp") contentType = "image/webp";

    // upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res
        .status(500)
        .json({ ok: false, error: uploadError.message });
    }

    // persist metadata in DB
    const expiryAt = new Date(
      Date.now() + expirySeconds * 1000
    ).toISOString();
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
      console.error("DB insert error:", dbError);
      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([path])
        .catch(() => {});
      return res
        .status(500)
        .json({ ok: false, error: dbError.message });
    }

    // generate shareable URL dynamically
    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const shareUrl = `${protocol}://${host}/view/${id}`;

    return res.status(200).json({ ok: true, id, url: shareUrl });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
}