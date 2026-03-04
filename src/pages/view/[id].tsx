// src/pages/view/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- Cryptography Utilities ---
const decryptFile = async (arrayBuffer: ArrayBuffer, keyString: string) => {
  let base64 = keyString.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binaryKey = window.atob(base64);
  const keyBytes = new Uint8Array(binaryKey.length);
  for (let i = 0; i < binaryKey.length; i++) keyBytes[i] = binaryKey.charCodeAt(i);

  const key = await window.crypto.subtle.importKey("raw", keyBytes, "AES-GCM", true, ["decrypt"]);
  const iv = arrayBuffer.slice(0, 12);
  const ciphertext = arrayBuffer.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    ciphertext
  );

  return new Blob([decrypted]);
};

export default function Viewer() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remainingViews, setRemainingViews] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [initialSeconds, setInitialSeconds] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  function formatTime(s: number) {
    if (s <= 0) return "00:00:00";
    const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return hrs === "00" ? `${mins}:${secs}` : `${hrs}:${mins}:${secs}`;
  }

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    
    (async () => {
      setLoading(true);
      setErrorMsg(null);

      // Extract encryption key from URL fragment
      const keyHash = window.location.hash.replace("#", "");
      if (!keyHash) {
        setErrorMsg("Missing Decryption Key. The URL is incomplete.");
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch("/api/consume-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const json = await resp.json();

        if (!resp.ok || !json.ok) {
          setErrorMsg(json.reason === "expired" ? "Payload Detonated" : "Failed to load payload.");
          if (json.reason === "expired") setExpired(true);
          setLoading(false);
          return;
        }

        // Fetch the encrypted blob from Supabase
        const fileResp = await fetch(json.fileUrl);
        const encryptedBuffer = await fileResp.arrayBuffer();

        // Decrypt locally
        const decryptedBlob = await decryptFile(encryptedBuffer, keyHash);
        const localUrl = URL.createObjectURL(decryptedBlob);

        if (mounted) {
          setFileUrl(localUrl);
          setRemainingViews(json.remainingViews);
          setRemainingSeconds(json.secondsLeft);
          setInitialSeconds(json.secondsLeft);
          if (json.secondsLeft <= 0) setExpired(true);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to decrypt payload. The key may be invalid.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      setExpired(true);
      return;
    }
    const t = setInterval(() => {
      setRemainingSeconds((r) => {
        if (r === null) return r;
        if (r <= 1) { clearInterval(t); setExpired(true); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [remainingSeconds]);

  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "p") || (e.metaKey && (e.key === "s" || e.key === "p"))) {
        e.preventDefault(); e.stopPropagation();
        alert("Screenshots disabled for this payload.");
      }
    };
    const blockContext = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("keydown", blockKeys);
    window.addEventListener("contextmenu", blockContext);
    return () => {
      window.removeEventListener("keydown", blockKeys);
      window.removeEventListener("contextmenu", blockContext);
    };
  }, []);

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "85vh" }}>
      <div className="col-lg-10 col-xl-8 text-center position-relative">
        
        <AnimatePresence mode="wait">
          {/* STATE 1: LOADING / DECRYPTING */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-5">
              <div className="spinner-border text-danger mb-3" role="status" />
              <p className="text-white-50 text-uppercase tracking-wider small fw-bold">Decrypting Payload...</p>
            </motion.div>
          )}

          {/* STATE 2: ACTIVE VIEW */}
          {fileUrl && !expired && !loading && (
            <motion.div key="viewer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }} transition={{ duration: 0.4 }}>
              
              <div className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 rounded glass-panel">
                <div className="text-start">
                  <div className="text-white-50 small text-uppercase fw-bold">Views Left</div>
                  <div className="fs-5 fw-bold text-white">{remainingViews ?? "—"}</div>
                </div>
                <div className="text-end">
                  <div className="text-white-50 small text-uppercase fw-bold text-danger">Detonation In</div>
                  <div className="fs-5 fw-bold text-danger font-monospace">{remainingSeconds !== null ? formatTime(remainingSeconds) : ""}</div>
                </div>
              </div>

              <div className="position-relative d-inline-block">
                <img src={fileUrl} alt="Payload" className="img-fluid rounded shadow-lg border border-secondary" style={{ maxHeight: "70vh", objectFit: "contain" }} draggable={false} />
              </div>

              {/* Trust Signal / Watermark */}
              <div className="mt-4 text-white-50 small d-flex align-items-center justify-content-center gap-2">
                <span>🔒</span> Decrypted locally via <span className="text-white fw-bold">BurnShot</span>
              </div>
            </motion.div>
          )}

          {/* STATE 3: THE VIRAL HOOK (EXPIRED/DETONATED) */}
          {(expired || errorMsg) && !loading && (
            <motion.div key="detonated" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 20 }}>
              <div className="glass-panel p-5 text-center">
                <div className="display-1 mb-4">💥</div>
                <h2 className="fw-bolder text-white mb-2">Payload Destroyed</h2>
                <p className="text-white-50 mb-5">{errorMsg || "The parameters for this asset were met and it has been cryptographically erased."}</p>
                
                <hr className="border-secondary opacity-25 mb-5" />
                
                <h4 className="text-white mb-3">Need to send something sensitive?</h4>
                <p className="text-white-50 small mb-4">Send encrypted, self-destructing links. No accounts, no logs.</p>
                
                <Link href="/upload" className="btn btn-burn btn-lg px-5 py-3 rounded-pill">
                  Encrypt Your Own File
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}