// src/components/Layout.tsx
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      {/* Global Dynamic Sponsor Background */}
      <div className="sponsor-bg" />

      <Navbar />

      <main className="flex-fill position-relative" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}