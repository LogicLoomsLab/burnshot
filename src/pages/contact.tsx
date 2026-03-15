// src/pages/contact.tsx
import React from "react";
import Seo from "../components/Seo";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <>
      <Seo 
        title="Contact Us | BurnShot" 
        description="Get in touch with the team behind BurnShot. We are proudly built and maintained by LogicLooms Lab."
        url="https://burnshot.app/contact"
      />
      
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="col-12 col-md-8 col-lg-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            className="glass-panel p-5 rounded text-center shadow-lg"
          >
            <div className="mb-4">
              <span className="display-4">📬</span>
            </div>
            <h1 className="fw-bolder text-white mb-3">Get in Touch</h1>
            <p className="text-white-50 mb-5">
              Have a question about our zero-knowledge architecture, want to report abuse, or looking to partner with us? We'd love to hear from you.
            </p>

            <div className="d-flex flex-column gap-3 mb-5">
              <a 
                href="mailto:hello@logicloomslab.com" 
                className="btn btn-outline-light btn-lg py-3 rounded-pill fw-bold"
              >
                hello@logicloomslab.com
              </a>
            </div>

            <hr className="border-secondary opacity-25 mb-4" />

            <div className="text-white-50 small">
              <p className="mb-2">BurnShot is proudly built and maintained by</p>
              <a 
                href="https://logicloomslab.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white fw-bold text-decoration-none border-bottom border-danger pb-1"
              >
                LogicLooms Lab
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}