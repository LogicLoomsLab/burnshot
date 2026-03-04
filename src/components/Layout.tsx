// src/components/Layout.tsx
import { ReactNode, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

type LayoutProps = {
  children: ReactNode;
};

interface Campaign {
  campaign_type: "billboard" | "banner" | "announcement";
  company_name: string;
  image_url: string;
  headline: string;
  subtext: string;
  button_text: string;
  link_url: string;
}

export default function Layout({ children }: LayoutProps) {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [banner, setBanner] = useState<Campaign | null>(null);
  const [announcement, setAnnouncement] = useState<Campaign | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true);

      if (!error && data) {
        const activeBillboard = data.find(c => c.campaign_type === "billboard");
        const activeBanner = data.find(c => c.campaign_type === "banner");
        const activeAnnouncement = data.find(c => c.campaign_type === "announcement");
        
        if (activeBillboard?.image_url) setBgImage(activeBillboard.image_url);
        if (activeBanner) setBanner(activeBanner as Campaign);
        if (activeAnnouncement) setAnnouncement(activeAnnouncement as Campaign);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <div 
        className="sponsor-bg" 
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
      />

      <AnimatePresence>
        {/* The New Announcement Bar (Brand Red) */}
        {announcement && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-100 py-2 px-3 text-center"
            style={{ 
              background: "var(--accent)", 
              color: "white",
              zIndex: 103, 
              position: "relative" 
            }}
          >
            <span className="fw-bold me-2">{announcement.headline}</span>
            <span className="small opacity-75">{announcement.subtext}</span>
          </motion.div>
        )}

        {/* The Affiliate Banner (Frosted Glass) */}
        {banner && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-100 py-2 px-3 text-center d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 gap-md-3"
            style={{ 
              background: "rgba(10, 10, 15, 0.6)", 
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)", 
              backdropFilter: "blur(20px)", 
              WebkitBackdropFilter: "blur(20px)",
              zIndex: 102, 
              position: "relative" 
            }}
          >
            <span className="badge bg-dark border border-secondary text-white-50 small">
              Partner: {banner.company_name}
            </span>
            <span className="text-white small fw-medium">
              {banner.headline} <span className="text-white-50 d-none d-sm-inline">— {banner.subtext}</span>
            </span>
            <a 
              href={banner.link_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white fw-bold small text-decoration-none ms-md-2"
              style={{ borderBottom: "1px solid var(--accent)" }}
              data-umami-event="Global Affiliate Click"
              data-umami-event-partner={banner.company_name}
            >
              {banner.button_text} &rarr;
            </a>
          </motion.div>
        )}
      </AnimatePresence>

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