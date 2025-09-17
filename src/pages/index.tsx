// src/pages/index.tsx
import Link from "next/link";
import React from "react";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-light py-5 text-center">
        <div className="container">
          <h1 className="display-4 fw-bold text-dark">BurnShot 🔥</h1>
          <p className="lead text-muted mb-4">
            Secure, self-destructing screenshot sharing.  
            Upload, share, and let your screenshots vanish automatically.
          </p>
          <Link href="/upload" className="btn btn-danger btn-lg rounded-pill">
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">📤 Easy Upload</h5>
                  <p className="card-text text-muted">
                    Upload screenshots quickly and securely. No clutter, no
                    hassle — just drag, drop, and share.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">⏳ Auto-Expiry</h5>
                  <p className="card-text text-muted">
                    Screenshots self-destruct after the set time or views limit,
                    ensuring your privacy and control.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">🔗 Share Instantly</h5>
                  <p className="card-text text-muted">
                    Get a unique link to share with anyone. No accounts needed.
                    Just send and forget.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-danger text-white py-5 text-center">
        <div className="container">
          <h2 className="fw-bold">Ready to share securely?</h2>
          <p className="mb-4">Start uploading your first BurnShot now.</p>
          <Link
            href="/upload"
            className="btn btn-light btn-lg rounded-pill fw-semibold"
          >
            Upload Screenshot
          </Link>
        </div>
      </section>
    </div>
  );
}