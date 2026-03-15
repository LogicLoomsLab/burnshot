// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-4 mt-auto position-relative" style={{ zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)" }}>
      <div className="container text-center small text-white-50">
        <div className="mb-2 fw-medium text-white">
          BurnShot © {new Date().getFullYear()} — Secure, ephemeral sharing
        </div>
        <div className="mb-3">
          Built with <span className="text-danger">❤️</span> by LogicLooms Lab
        </div>
        <div className="d-flex justify-content-center gap-4">
          <Link href="/terms" className="text-decoration-none text-white-50 hover-white transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="text-decoration-none text-white-50 hover-white transition-colors">
            Privacy
          </Link>
          <Link href="/contact" className="text-white-50 text-decoration-none small">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}