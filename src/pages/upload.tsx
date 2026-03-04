// src/pages/upload.tsx
import React, { useRef, useState } from "react";
import Seo from "@/components/Seo";
import { motion, AnimatePresence } from "framer-motion";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(result.slice(comma + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const totalMinutes = hours * 60 + minutes;
  const maxUploadSizeMB = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE ?? "8", 10);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    processFile(f);
  }

  function onChoose(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    processFile(f);
  }

  function processFile(f?: File | null) {
    if (!f) return;
    if (f.size > maxUploadSizeMB * 1024 * 1024) {
      alert(`File too large. Max allowed size is ${maxUploadSizeMB} MB.`);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function onUpload() {
    if (!file) return;
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const resp = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: base64,
          expirySeconds: totalMinutes * 60,
          maxViews,
        }),
      });

      const json = await resp.json();
      if (!resp.ok || !json.ok) throw new Error(json.error || resp.statusText);

      setShareLink(json.url);
    } catch (err: any) {
      alert("Upload error: " + err.message);
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
      
      {/* Dynamic Sponsor Background Placeholder */}
      <div className="sponsor-bg" />

      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="col-lg-6 col-md-8"
        >
          <div className="glass-panel p-4 p-md-5">
            <AnimatePresence mode="wait">
              {!shareLink ? (
                <motion.div key="upload-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <h2 className="h3 fw-bold mb-1 text-center">Encrypt & Share</h2>
                  <p className="text-white-50 text-center mb-4 small">Files vanish after the limit is reached.</p>

                  <div 
                    className={`dropzone mb-4 ${isDragging ? "active" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                  >
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
                    {loading ? "Encrypting..." : "Generate Secure Link"}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="success-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-3">
                  <div className="display-1 mb-3">🔒</div>
                  <h3 className="fw-bold mb-3">Link Secured</h3>
                  <p className="text-white-50 small mb-4">This link will self-destruct after its view limit is reached.</p>
                  
                  <div className="d-flex gap-2 mb-4">
                    <input readOnly className="form-control glass-input text-center" value={shareLink} onClick={(e) => e.currentTarget.select()} />
                    <button className="btn btn-burn px-4" onClick={copyToClipboard}>{copied ? "Copied!" : "Copy"}</button>
                  </div>

                  <button className="btn btn-link text-white-50 text-decoration-none small mb-4" onClick={() => { setShareLink(null); setFile(null); setPreviewUrl(null); }}>
                    Upload another file
                  </button>

                  <hr className="border-secondary opacity-25" />
                  
                  {/* MONETIZATION: The Privacy Affiliate Banner */}
                  <div className="mt-4 p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="badge bg-dark border border-secondary text-white-50 mb-2">Partner</span>
                    <h6 className="fw-bold mb-1">Keep your browsing as hidden as your files.</h6>
                    <p className="text-white-50 small mb-2">Get military-grade encryption with our top-rated VPN partner.</p>
                    <a href="#" className="btn btn-sm btn-outline-light rounded-pill px-3">Claim 60% Off NordVPN</a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}