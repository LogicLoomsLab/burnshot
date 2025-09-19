// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-5 border-top border-secondary">
      <div className="container text-center small">
        BurnShot © {new Date().getFullYear()} — Secure, ephemeral sharing
        <div className="text-muted mb-2">
          Built with ❤️ by LogicLooms Lab
        </div>
        <div>
          <Link href="/terms" className="text-decoration-none text-light me-3">
            Terms
          </Link>
          <Link href="/privacy" className="text-decoration-none text-light">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}