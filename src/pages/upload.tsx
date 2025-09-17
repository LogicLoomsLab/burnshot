import React, { useRef, useState } from "react";

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const totalMinutes = hours * 60 + minutes;
  const validateExpiry = () => totalMinutes >= 1 && totalMinutes <= 7 * 24 * 60;
  const validateMaxViews = () => maxViews >= 1 && maxViews <= 50;

  const maxUploadSizeMB = parseInt(
    process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE ?? "8",
    10
  );
  const maxUploadSize = `${maxUploadSizeMB} MB`;

  function onChoose(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      if (f.size > maxUploadSizeMB * 1024 * 1024) {
        alert(`File too large. Max allowed size is ${maxUploadSize}.`);
        e.target.value = ""; // reset file input
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  }

  async function onUpload() {
    if (!file) return alert("Please select a file.");
    if (!validateExpiry()) return alert("Expiry must be 1 minute to 7 days.");
    if (!validateMaxViews())
      return alert("Max views must be between 1 and 50.");

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
      if (!resp.ok || !json.ok) {
        alert("Upload failed: " + (json.error || resp.statusText));
        setLoading(false);
        return;
      }

      setShareLink(json.url);
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      console.error(err);
      alert("Upload error: " + (err?.message || String(err)));
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="h4 mb-3 text-center">📤 Upload Screenshot</h2>
              <p className="text-muted text-center mb-4">
                Set expiry & view limits. Share securely with BurnShot.
              </p>

              {!shareLink ? (
                <>
                  {/* File input */}
                  <div
                    className="border rounded p-4 text-center mb-3"
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      ref={inputRef}
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={onChoose}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                      <div className="mb-2 fw-medium">
                        📁 Click to upload or drag & drop
                      </div>
                      <div className="text-muted small">
                        PNG, JPG, GIF, WebP (max {maxUploadSize})
                      </div>
                    </label>

                    {previewUrl && (
                      <div className="mt-3">
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="img-fluid rounded shadow-sm"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    )}

                    {file && (
                      <div className="mt-2 text-muted small">
                        Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                      </div>
                    )}
                  </div>

                  {/* Expiry + Max Views */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Expiry (Hours / Minutes)
                      </label>
                      <div className="d-flex gap-2">
                        <input
                          type="number"
                          className="form-control"
                          min={0}
                          max={168}
                          value={hours}
                          onChange={(e) =>
                            setHours(
                              Math.max(0, Math.min(168, Number(e.target.value)))
                            )
                          }
                        />
                        <input
                          type="number"
                          className="form-control"
                          min={0}
                          max={59}
                          value={minutes}
                          onChange={(e) =>
                            setMinutes(
                              Math.max(0, Math.min(59, Number(e.target.value)))
                            )
                          }
                        />
                      </div>
                      <div className="text-muted small mt-1">
                        Min 1 minute, max 7 days
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Max Views</label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        max={50}
                        value={maxViews}
                        onChange={(e) =>
                          setMaxViews(
                            Math.max(1, Math.min(50, Number(e.target.value)))
                          )
                        }
                      />
                      <div className="text-muted small mt-1">1–50 views</div>
                    </div>
                  </div>

                  {/* Upload button */}
                  <div className="mt-4 d-grid">
                    <button
                      className="btn btn-danger btn-lg rounded-pill"
                      onClick={onUpload}
                      disabled={loading || !file}
                    >
                      {loading ? "Uploading…" : "Upload & Get Link"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-muted">
                    Your secure link (expires automatically)
                  </p>
                  <div className="d-flex gap-2 mb-3">
                    <input readOnly className="form-control" value={shareLink} />
                    <button
                      className="btn btn-success rounded-pill"
                      onClick={copyToClipboard}
                    >
                      {copied ? "Copied ✅" : "Copy"}
                    </button>
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShareLink(null)}
                  >
                    Upload Another
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-muted small mt-3">
            BurnShot — secure, ephemeral screenshot sharing
          </div>
        </div>
      </div>
    </div>
  );
}