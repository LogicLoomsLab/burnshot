// src/pages/terms.tsx
import React from "react";
import Seo from "@/components/Seo";

export default function TermsPage() {
  return (
    <>
      <Seo
        title="Terms & Conditions | BurnShot 🔥"
        description="Read the terms and conditions for using BurnShot — a secure, self-destructing screenshot sharing platform."
        url="https://burnshot.vercel.app/terms"
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <h2 className="mb-4">Terms & Conditions</h2>
            <p>
              Welcome to <strong>BurnShot</strong>. By using our service, you agree
              to the following terms:
            </p>

            <h5>1. Usage</h5>
            <p>
              BurnShot is intended for temporary sharing of screenshots and images
              only. Do not use this service to share illegal, harmful, or abusive
              content.
            </p>

            <h5>2. Ephemeral Storage</h5>
            <p>
              Uploaded files are automatically deleted after the set number of
              views or after the expiry time you choose. While we do our best to
              enforce this, we cannot guarantee absolute deletion from all systems
              instantly.
            </p>

            <h5>3. No Liability</h5>
            <p>
              BurnShot is provided “as is.” We do not accept responsibility for
              loss of data, unauthorized access, or misuse of links once they have
              been shared.
            </p>

            <h5>4. Fair Use</h5>
            <p>
              Users must not abuse the service by overloading servers, attempting
              to bypass limits, or using BurnShot for malicious activities.
            </p>

            <h5>5. Changes</h5>
            <p>
              We may update these Terms at any time. Continued use of the service
              means you accept the latest version.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}