// src/pages/privacy.tsx
import React from "react";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Policy | BurnShot" description="Zero-tracking privacy policy." url="https://burnshot.app/privacy" />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div className="glass-panel p-4 p-md-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="h2 fw-bold text-white mb-4">Privacy Architecture</h2>
              <div className="text-white-50">
                <p className="mb-5 lead">Our policy is simple: We cannot leak data we do not collect.</p>

                <h5 className="text-white fw-bold">1. Zero-Account Infrastructure</h5>
                <p className="mb-4">BurnShot operates on a stateless consumer model. We do not require, request, or store names, email addresses, or identifying markers.</p>

                <h5 className="text-white fw-bold">2. Ephemeral Storage Protocol</h5>
                <p className="mb-4">Uploaded assets reside in temporary cloud buckets. Upon hitting the user-defined view threshold or TTL (Time-To-Live) expiry, an automated RPC irreversibly purges the asset from our storage arrays.</p>

                <h5 className="text-white fw-bold">3. Analytics & Telemetry</h5>
                <p className="mb-4">We utilize cookie-free, strictly anonymized event tracking to monitor global system load and uptime. No user fingerprinting or cross-site tracking scripts are executed.</p>

                <h5 className="text-white fw-bold">4. Third-Party Infrastructure</h5>
                <p className="mb-4">BurnShot leverages enterprise-grade providers (Vercel, Supabase) strictly for edge routing and secure blob storage. Assets are never shared with or sold to data brokers.</p>

                <p className="mt-5 small border-top border-secondary pt-4">
                  Direct inquiries: <a href="mailto:hello@logicloomslab.com" className="text-accent text-decoration-none">hello@logicloomslab.com</a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}