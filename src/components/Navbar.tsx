// src/components/Navbar.tsx
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  const isActive = (path: string) =>
    router.pathname === path ? "active fw-bold" : "";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold text-danger" href="/">
          BurnShot
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} href="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/upload")}`}
                href="/upload"
              >
                Upload
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/about")}`} href="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/terms")}`} href="/terms">
                Terms
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/privacy")}`} href="/privacy">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}