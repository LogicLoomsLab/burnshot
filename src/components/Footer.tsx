// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-5 border-top border-secondary">
      <div className="container text-center small">
        BurnShot © {new Date().getFullYear()} — Secure, ephemeral sharing
        <div className="text-muted">
          Built with ❤️ by LogicLooms Lab
        </div>
      </div>
    </footer>
  );
}