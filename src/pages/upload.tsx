// src/pages/upload.tsx
import React, { useRef, useState, useEffect } from "react";
import Seo from "@/components/Seo";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

const generateKey = async () => {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

const bufferToBase64Url = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const encryptFileToBlob = async (file: File) => {
  const key = await generateKey();
  const exportedKey = await window.crypto.subtle.exportKey("raw", key);
  const keyString = bufferToBase64Url(exportedKey);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const arrayBuffer = await file.arrayBuffer();

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    arrayBuffer
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  const encryptedBlob = new Blob([combined], { type: "application/octet-stream" });
  return { encryptedBlob, keyString };
};

interface AffiliateCampaign {
  company_name: string;
  headline: string;
  subtext: string;
  button_text: string;
  link_url: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(15);
  const [maxViews, setMaxViews] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [affiliate, setAffiliate] = useState<AffiliateCampaign | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const totalMinutes = hours * 60 + minutes;
  const maxUploadSizeMB = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE ?? "8", 10);

  useEffect(() => {
    const fetchAffiliate = async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("company_name, headline, subtext, button_text, link_url")
        .eq("is_active", true)
        .eq("campaign_type", "banner")
        .limit(1)
        .single();

      if (!error && data) {
        setAffiliate(data as AffiliateCampaign);
      }
    };
    fetchAffiliate();
  }, []);

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }
  function onChoose(e: React.ChangeEvent<HTMLInputElement>) { processFile(e.target.files?.[0]); }

  function processFile(f?: File | null) {
    if (!f) return;
    if (f.size > maxUploadSizeMB * 1024 * 1024) {
      alert(`File size exceeds configured limit of ${maxUploadSizeMB} MB.`);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function onUpload() {
    if (!file) return;
    setLoading(true);
    try {
      const { encryptedBlob, keyString } = await encryptFileToBlob(file);
      
      const prepResp = await fetch("/api/prepare-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: encryptedBlob.size,
          expirySeconds: totalMinutes * 60,
          maxViews,
        }),
      });

      const prepJson = await prepResp.json();
      if (!prepResp.ok || !prepJson.ok) {
        throw new Error(prepJson.error || "Failed to initialize upload payload.");
      }

      const storageResp = await fetch(prepJson.signedUrl, {
        method: "PUT",
        body: encryptedBlob,
        headers: { "Content-Type": "application/octet-stream" }
      });

      if (!storageResp.ok) {
        throw new Error("Direct storage transfer failed.");
      }

      setShareLink(`${prepJson.url}#${keyString}`);
    } catch (err: any) {
      alert("Encryption/Upload error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Seo title="Upload Securely | BurnShot" description="Secure, self-destructing image sharing." url="https://burnshot.app/upload" />
      <div className="sponsor-bg" />

      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="col-lg-6 col-md-8">
          <div className="glass-panel p-4 p-md-5">
            <AnimatePresence mode="wait">
              {!shareLink ? (
                <motion.div key="upload-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="d-flex justify-content-center mb-2">
                     <span className="badge bg-dark border border-success text-success mb-2 px-3 py-2">
                        <span className="me-2">🔒</span> End-to-End Encrypted
                     </span>
                  </div>
                  <h2 className="h3 fw-bold mb-1 text-center">Encrypt & Share</h2>
                  <p className="text-white-50 text-center mb-4 small">Keys never leave your device.</p>

                  <div className={`dropzone mb-4 ${isDragging ? "active" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => inputRef.current?.click()}>
                    <input ref={inputRef} id="fileInput" type="file" accept="image/*" onChange={onChoose} style={{ display: "none" }} />
                    <div className="text-center">
                      {previewUrl ? (
                        <img src={previewUrl} alt="preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: "180px" }} />
                      ) : (
                        <div className="py-4">
                          <div className="display-4 mb-2">📥</div>
                          <div className="fw-medium">Drag & drop or click to upload</div>
                          <div className="text-white-50 small mt-1">PNG, JPG, GIF, WebP (Max {maxUploadSizeMB}MB)</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {file && (
                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <label className="form-label text-white-50 small text-uppercase fw-bold">Expiry (Hrs:Mins)</label>
                        <div className="d-flex gap-2">
                          <input type="number" className="form-control glass-input" value={hours} onChange={(e) => setHours(Number(e.target.value))} min={0} max={168} />
                          <input type="number" className="form-control glass-input" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} min={0} max={59} />
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-white-50 small text-uppercase fw-bold">Max Views</label>
                        <input type="number" className="form-control glass-input" value={maxViews} onChange={(e) => setMaxViews(Number(e.target.value))} min={1} max={50} />
                      </div>
                    </div>
                  )}

                  <button className="btn btn-burn w-100 py-3" onClick={onUpload} disabled={loading || !file}>
                    {loading ? "Encrypting & Uploading..." : "Generate Secure Link"}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="success-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-3">
                  <div className="display-1 mb-3">🔒</div>
                  <h3 className="fw-bold mb-3">Link Secured</h3>
                  <p className="text-white-50 small mb-4">This link contains the decryption key. It cannot be recovered if lost.</p>
                  
                  <div className="d-flex gap-2 mb-4">
                    <input readOnly className="form-control glass-input text-center" value={shareLink} onClick={(e) => e.currentTarget.select()} />
                    <button className="btn btn-burn px-4" onClick={copyToClipboard}>{copied ? "Copied!" : "Copy"}</button>
                  </div>

                  <button className="btn btn-link text-white-50 text-decoration-none small mb-4" onClick={() => { setShareLink(null); setFile(null); setPreviewUrl(null); }}>
                    Encrypt another file
                  </button>

                  <hr className="border-secondary opacity-25" />
                  
                  {affiliate && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded text-start" 
                      style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-dark border border-secondary text-white-50">Partner: {affiliate.company_name}</span>
                      </div>
                      <h6 className="fw-bold mb-1 text-white">{affiliate.headline}</h6>
                      <p className="text-white-50 small mb-3">{affiliate.subtext}</p>
                      <a 
                        href={affiliate.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-light rounded-pill px-4"
                        data-umami-event="Affiliate Click"
                        data-umami-event-partner={affiliate.company_name}
                      >
                        {affiliate.button_text}
                      </a>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}