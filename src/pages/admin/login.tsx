// src/pages/admin/login.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../lib/supabaseClient";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect active sessions
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push("/admin");
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <>
      <Seo title="Admin Login | BurnShot" description="Restricted access." url="https://burnshot.app/admin/login" />
      <div className="sponsor-bg" />

      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "85vh" }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="col-12 col-md-6 col-lg-4"
        >
          <div className="glass-panel p-4 p-md-5">
            <div className="text-center mb-4">
              <span style={{ fontSize: "2rem" }}>🔥</span>
              <h2 className="h4 fw-bold text-white mt-2">System Access</h2>
              <p className="text-white-50 small">Restricted to authorized personnel.</p>
            </div>

            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label text-white-50 small text-uppercase fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control glass-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-white-50 small text-uppercase fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control glass-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-burn w-100" 
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Authenticate"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}