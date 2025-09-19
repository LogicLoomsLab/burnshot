// src/pages/privacy.tsx
import React from "react";
import Seo from "@/components/Seo";

export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy Policy | BurnShot 🔥"
        description="Learn how BurnShot handles your data: no accounts, no tracking, temporary storage, and secure screenshot sharing."
        url="https://burnshot.vercel.app/privacy"
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <h2 className="mb-4">Privacy Policy</h2>
            <p>
              At <strong>BurnShot</strong>, your privacy is our top priority.
              Here’s how we handle your data:
            </p>

            <h5>1. No Accounts, No Tracking</h5>
            <p>
              We do not require signups or personal information. BurnShot does not
              track your browsing activity or build user profiles.
            </p>

            <h5>2. Temporary Storage</h5>
            <p>
              Files you upload are stored securely and are automatically destroyed
              after the set expiry time or number of views. Once deleted, they
              cannot be retrieved.
            </p>

            <h5>3. Access Control</h5>
            <p>
              Only those with the unique link can view your uploaded file. We do
              not expose your files publicly.
            </p>

            <h5>4. Logs</h5>
            <p>
              For security and abuse prevention, minimal technical logs may be
              collected (e.g., IP addresses). These are automatically rotated and
              not used for tracking.
            </p>

            <h5>5. Third-Party Services</h5>
            <p>
              BurnShot uses trusted third-party infrastructure (like Supabase) for
              secure storage and database operations. These providers may process
              data only to enable our service.
            </p>

            <h5>6. Contact</h5>
            <p>
              For questions about this policy, reach out to{" "}
              <strong>LogicLooms Lab</strong>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}