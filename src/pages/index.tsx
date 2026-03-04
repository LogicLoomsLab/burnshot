// src/pages/index.tsx
import Link from "next/link";
import React from "react";
import Seo from "@/components/Seo";
import { motion, Variants } from "framer-motion";

export default function HomePage() {
  // Explicitly typing these as 'Variants' solves the TypeScript build error
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <Seo
        title="BurnShot 🔥 | Zero-Knowledge Image Sharing"
        description="Military-grade, self-destructing image sharing. No tracking. No logs."
        url="https://burnshot.app/"
      />

      <div className="container py-5 d-flex flex-column justify-content-center" style={{ minHeight: "85vh" }}>
        <motion.div 
          className="text-center mb-5"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="d-inline-block mb-3 px-3 py-1 rounded-pill" style={{ background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.3)", color: "#ff3b3b" }}>
            <span className="small fw-bold tracking-wider text-uppercase">End-to-End Ephemeral</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="display-3 fw-bolder text-white mb-4" style={{ letterSpacing: "-1px" }}>
            Share Secrets.<br />
            <span style={{ color: "var(--accent)" }}>Leave No Trace.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="lead text-white-50 mx-auto mb-5" style={{ maxWidth: "600px" }}>
            Upload sensitive images. Set the detonation timer. Send the link. BurnShot destroys the data the second your limits are reached.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Link href="/upload" className="btn btn-burn btn-lg px-5 py-3 fs-5">
              Generate Secure Link
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="row g-4 mt-4"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <div className="col-md-4">
            <motion.div variants={itemVariants} className="glass-panel p-4 h-100 text-center">
              <div className="display-5 mb-3">👁️‍🗨️</div>
              <h4 className="text-white fw-bold mb-2">Zero Tracking</h4>
              <p className="text-white-50 small mb-0">No accounts. No cookies. No IP logging. Your identity remains entirely decoupled from your files.</p>
            </motion.div>
          </div>
          <div className="col-md-4">
            <motion.div variants={itemVariants} className="glass-panel p-4 h-100 text-center">
              <div className="display-5 mb-3">⏳</div>
              <h4 className="text-white fw-bold mb-2">Auto-Detonation</h4>
              <p className="text-white-50 small mb-0">Cryptographically erased from our servers the millisecond your set view limit or timer expires.</p>
            </motion.div>
          </div>
          <div className="col-md-4">
            <motion.div variants={itemVariants} className="glass-panel p-4 h-100 text-center">
              <div className="display-5 mb-3">🛡️</div>
              <h4 className="text-white fw-bold mb-2">Enterprise Grade</h4>
              <p className="text-white-50 small mb-0">Built on highly available edge infrastructure to ensure rapid, secure delivery anywhere globally.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}