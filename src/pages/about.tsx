// src/pages/about.tsx
import React from "react";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <>
      <Seo title="About | BurnShot" description="The infrastructure of ephemeral sharing." url="https://burnshot.app/about" />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div 
              className="glass-panel p-4 p-md-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="d-inline-block mb-3 px-3 py-1 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="small fw-bold text-white-50 text-uppercase">About The Protocol</span>
              </div>
              <h2 className="display-6 fw-bold text-white mb-4">Engineering Privacy.</h2>
              
              <div className="text-white-50" style={{ lineHeight: "1.8", fontSize: "1.1rem" }}>
                <p className="mb-4">
                  <strong className="text-white">BurnShot</strong> is engineered to solve a fundamental flaw in modern communication: the persistence of data. When you send a screenshot via messaging apps or email, you lose control of that asset forever.
                </p>
                <p className="mb-4">
                  We built a zero-knowledge, ephemeral routing system. BurnShot allows you to distribute sensitive visual data with mathematical certainty that it will self-destruct.
                </p>
                <p className="mb-4">
                  Maintained by <strong className="text-white">LogicLooms Lab</strong>, our architecture requires no accounts and processes no personally identifiable information. We provide the infrastructure; you control the payload.
                </p>
                <p className="mb-0">
                  <em className="text-white">Upload. Transmit. Detonate.</em>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}