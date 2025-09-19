// src/pages/about.tsx
import React from "react";

export default function AboutPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="burn-card p-4">
            <h2 className="h4 mb-3">About BurnShot</h2>
            <p>
              <strong>BurnShot</strong> is a simple yet powerful tool for
              sharing screenshots securely. Unlike traditional file-sharing,
              BurnShot ensures your images disappear after a set number of views
              or a time limit — no lingering files, no accidental oversharing.
            </p>
            <p>
              Built with privacy in mind, BurnShot doesn’t require signups or
              personal data. You’re always in control of how long your shared
              content lives online.
            </p>
            <p>
              BurnShot is proudly developed and maintained by{" "}
              <strong>LogicLooms Lab</strong>. Our mission is to provide
              privacy-focused tools that respect users and protect sensitive
              information from unnecessary exposure.
            </p>
            <p>
              In short: <em>Upload. Share. Burn.</em> That’s the BurnShot way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}