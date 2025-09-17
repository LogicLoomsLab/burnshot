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
              <strong>BurnShot</strong> is a secure, ephemeral screenshot sharing service.
              It allows you to upload images with strict expiry and view limits,
              ensuring sensitive content disappears after it has served its purpose.
            </p>
            <p>
              BurnShot is proudly developed and maintained by{" "}
              <strong>LogicLooms Lab</strong>. Our mission is to provide simple,
              privacy-focused tools that respect user data and prevent oversharing.
            </p>
            <p>
              With BurnShot, your screenshots are never permanent — they burn
              after viewing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}