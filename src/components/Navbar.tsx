// src/components/Navbar.tsx
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  
  // Helper to apply the bright white color to the active tab
  const isActive = (path: string) => 
    router.pathname === path ? "text-white fw-bold" : "text-white-50";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-glass py-3 position-relative" style={{ zIndex: 100 }}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" href="/">
          <span style={{ fontSize: "1.5rem" }}>🔥</span> BurnShot
        </Link>
        
        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-2 gap-lg-4 align-items-lg-center">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} href="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/about")}`} href="/about">
                About
              </Link>
            </li>
            
            {/* Mobile-only Legal Links (Keeps desktop clean, but accessible on phones) */}
            <li className="nav-item d-lg-none">
              <Link className={`nav-link ${isActive("/terms")}`} href="/terms">
                Terms
              </Link>
            </li>
            <li className="nav-item d-lg-none">
              <Link className={`nav-link ${isActive("/privacy")}`} href="/privacy">
                Privacy
              </Link>
            </li>

            {/* Header CTA - Drives users straight to the money-maker */}
            <li className="nav-item ms-lg-2 mt-3 mt-lg-0">
              <Link href="/upload" className="btn btn-burn rounded-pill px-4 py-2 w-100 d-lg-inline-block shadow-sm">
                Start Encrypting
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}