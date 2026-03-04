// src/components/Layout.tsx
import { ReactNode, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillboard = async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("image_url")
        .eq("is_active", true)
        .eq("campaign_type", "billboard")
        .limit(1)
        .single();

      if (!error && data?.image_url) {
        setBgImage(data.image_url);
      }
    };

    fetchBillboard();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <div 
        className="sponsor-bg" 
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
      />

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