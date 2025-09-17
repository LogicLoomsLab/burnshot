// src/components/Layout.tsx
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar always at top */}
      <Navbar />

      {/* Main content fills available space */}
      <main className="flex-fill">{children}</main>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
}