import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Viewer() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remainingViews, setRemainingViews] = useState<number | null>(null);

  // countdown states
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [initialSeconds, setInitialSeconds] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  // format HH:MM:SS
  function formatTime(s: number) {
    if (s <= 0) return "0s";
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const resp = await fetch("/api/consume-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const json = await resp.json();

        if (!resp.ok || !json.ok) {
          setErrorMsg(
            json.reason === "expired"
              ? "This screenshot has expired or been consumed."
              : json.message || "Failed to load screenshot."
          );
          return;
        }

        setFileUrl(json.fileUrl ?? null);
        setRemainingViews(
          typeof json.remainingViews === "number"
            ? json.remainingViews
            : json.remainingViews ?? null
        );

        // calculate expiry seconds
        let remaining = null;
        if (json.expiry_at) {
          const exp = new Date(json.expiry_at).getTime();
          remaining = Math.max(0, Math.floor((exp - Date.now()) / 1000));
        } else if (typeof json.expiresInSeconds === "number") {
          remaining = Math.max(0, Math.floor(json.expiresInSeconds));
        } else {
          remaining = 60; // fallback
        }

        if (mounted) {
          setRemainingSeconds(remaining);
          setInitialSeconds(remaining);
          if (remaining <= 0) setExpired(true);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Unexpected error");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // countdown ticking
  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      setExpired(true);
      return;
    }
    const t = setInterval(() => {
      setRemainingSeconds((r) => {
        if (r === null) return r;
        if (r <= 1) {
          clearInterval(t);
          setExpired(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [remainingSeconds]);

  // prevent saving / screenshots
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.key === "p") ||
        (e.metaKey && (e.key === "s" || e.key === "p"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        alert("Screenshots / saving are disabled for this page.");
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

  // circular progress math
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress =
    initialSeconds && remainingSeconds !== null
      ? Math.max(0, remainingSeconds / Math.max(1, initialSeconds))
      : 0;
  const offset = circumference * (1 - progress);

  // countdown ring component
  const CountdownRing = () => (
    <svg className="countdown-ring" viewBox="0 0 100 100" aria-hidden>
      {/* background circle */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="6"
        fill="transparent"
      />
      {/* progress circle */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="url(#g1)"
        strokeWidth="6"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff3b3b" />
          <stop offset="100%" stopColor="#ffb86b" />
        </linearGradient>
      </defs>
      {/* countdown text */}
      <text
        x="50"
        y="56"
        fontSize="14"
        textAnchor="middle"
        fill="#fff"
        fontWeight="bold"
        style={{ textShadow: "0 0 4px rgba(0,0,0,0.6)" }}
      >
        {remainingSeconds !== null ? formatTime(remainingSeconds) : ""}
      </text>
    </svg>
  );

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center p-4">
              <h2 className="h4 mb-4">📷 View Image</h2>

              {loading && <div className="py-4 text-muted">Loading…</div>}

              {errorMsg && (
                <div className="alert alert-danger">{errorMsg}</div>
              )}

              {fileUrl && !expired && (
                <>
                  <div className="position-relative">
                    <img
                      src={fileUrl}
                      alt="BurnShot"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: "70vh", objectFit: "contain" }}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />

                    {/* countdown ring - desktop (overlay) */}
                    <div className="d-none d-md-block"
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "80px",
                        height: "80px",
                      }}
                    >
                      <div title="Time until expiry">
                        <CountdownRing />
                      </div>

                    </div>
                  </div>

                  {/* countdown ring - mobile (below image) */}
                  <div className="d-block d-md-none mt-3">
                    <div style={{ width: "80px", margin: "0 auto" }}>
                      <div title="Time until expiry">
                        <CountdownRing />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-muted">
                    Remaining views:{" "}
                    <strong>{remainingViews ?? "—"}</strong>
                  </div>
                </>
              )}

              {expired && (
                <div className="p-4 text-center">
                  <h5 className="text-danger mb-2">
                    This screenshot has now expired.
                  </h5>
                  <p className="text-muted">
                    The image is no longer available.
                  </p>
                </div>
              )}

              {!loading && !fileUrl && !errorMsg && !expired && (
                <div className="py-4 text-muted">Preparing screenshot…</div>
              )}
            </div>
          </div>

          <div className="text-center text-muted small mt-3">
            BurnShot — secure, ephemeral screenshot viewing
          </div>
        </div>
      </div>
    </div>
  );
}