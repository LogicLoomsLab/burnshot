// src/pages/terms.tsx
import React from "react";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <>
      <Seo title="Terms of Service | BurnShot" description="Terms of Service" url="https://burnshot.app/terms" />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div className="glass-panel p-4 p-md-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="h2 fw-bold text-white mb-4">Terms of Service</h2>
              <div className="text-white-50">
                <p className="mb-4">Accessing and routing data through the BurnShot infrastructure implies binding consent to the following operational parameters.</p>

                <h5 className="text-white fw-bold">1. Acceptable Use</h5>
                <p className="mb-4">BurnShot is provisioned for the secure, temporary transfer of legitimate visual data. Transmission of illegal, non-consensual, or malicious payloads is strictly prohibited and subject to immediate infrastructural blocking.</p>

                <h5 className="text-white fw-bold">2. Cryptographic Deletion</h5>
                <p className="mb-4">While the system is architected for automated destruction, BurnShot provides the service "as is." LogicLooms Lab assumes no liability for network latency, unauthorized local access by the recipient, or potential extraction via third-party screen-capture tools.</p>

                <h5 className="text-white fw-bold">3. Rate Limiting & Abuse</h5>
                <p className="mb-4">To maintain global uptime, strict IP-based rate limiting is enforced at the edge layer. Automated abuse or attempts to bypass upload thresholds will result in permanent blacklisting.</p>

                <h5 className="text-white fw-bold">4. Modifications</h5>
                <p className="mb-0">LogicLooms Lab reserves the right to dynamically adjust constraints (e.g., max payload size, TTL limits) to optimize system integrity without prior notice.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}