// src/pages/admin/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../lib/supabaseClient";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";

interface Campaign {
  id: string;
  campaign_type: "billboard" | "banner" | "announcement";
  company_name: string;
  image_url: string;
  headline: string;
  subtext: string;
  button_text: string;
  link_url: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    campaign_type: "announcement", // Default to the new type
    company_name: "BurnShot Team",
    image_url: "",
    headline: "",
    subtext: "",
    button_text: "",
    link_url: "",
  });

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    fetchCampaigns();
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCampaigns(data);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("campaigns")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    
    if (!error) {
      setCampaigns(campaigns.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this campaign permanently?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (!error) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("campaigns").insert([formData]);
    
    if (!error) {
      setShowForm(false);
      setFormData({
        campaign_type: "announcement",
        company_name: "BurnShot Team",
        image_url: "",
        headline: "",
        subtext: "",
        button_text: "",
        link_url: "",
      });
      fetchCampaigns();
    } else {
      alert("Error creating campaign: " + error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) return <div className="text-white text-center py-5 mt-5">Loading Command Center...</div>;

  return (
    <>
      <Seo title="Command Center | BurnShot" description="Admin dashboard" url="https://burnshot.app/admin" />
      <div className="sponsor-bg" />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white fw-bold m-0">Campaign Manager</h2>
          <div className="d-flex gap-3">
            <button className="btn btn-outline-light btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ New Campaign"}
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-panel p-4 mb-5">
            <h5 className="text-white mb-3">Deploy New Campaign</h5>
            <form onSubmit={handleCreate} className="row g-3">
              <div className="col-md-4">
                <label className="text-white-50 small">Type</label>
                <select 
                  className="form-control glass-input" 
                  value={formData.campaign_type}
                  onChange={(e) => setFormData({...formData, campaign_type: e.target.value})}
                >
                  <option value="announcement">System Announcement (Brand Red)</option>
                  <option value="banner">Text Banner (Affiliate)</option>
                  <option value="billboard">Billboard (Background Image)</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="text-white-50 small">Internal Name / Partner</label>
                <input required type="text" className="form-control glass-input" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
              </div>

              {formData.campaign_type === "billboard" && (
                <>
                  <div className="col-md-4">
                    <label className="text-white-50 small">Target URL</label>
                    <input required type="url" className="form-control glass-input" value={formData.link_url} onChange={(e) => setFormData({...formData, link_url: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="text-white-50 small">Background Image URL (High-Res)</label>
                    <input required type="url" className="form-control glass-input" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
                  </div>
                </>
              )}

              {(formData.campaign_type === "banner" || formData.campaign_type === "announcement") && (
                <>
                  <div className="col-md-4">
                    <label className="text-white-50 small">Headline</label>
                    <input required type="text" className="form-control glass-input" value={formData.headline} onChange={(e) => setFormData({...formData, headline: e.target.value})} />
                  </div>
                  <div className="col-md-8">
                    <label className="text-white-50 small">Subtext / Message</label>
                    <input required type="text" className="form-control glass-input" value={formData.subtext} onChange={(e) => setFormData({...formData, subtext: e.target.value})} />
                  </div>
                </>
              )}

              {/* Only require buttons/links for Affiliates, make optional for Announcements */}
              {formData.campaign_type === "banner" && (
                 <>
                  <div className="col-md-6">
                    <label className="text-white-50 small">Button Text</label>
                    <input required={formData.campaign_type === "banner"} type="text" className="form-control glass-input" value={formData.button_text} onChange={(e) => setFormData({...formData, button_text: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="text-white-50 small">Target URL</label>
                    <input required={formData.campaign_type === "banner"} type="url" className="form-control glass-input" value={formData.link_url} onChange={(e) => setFormData({...formData, link_url: e.target.value})} />
                  </div>
                 </>
              )}
              
              <div className="col-12 mt-4 text-end">
                <button type="submit" className="btn btn-burn px-4">Deploy</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="glass-panel overflow-hidden">
          <table className="table table-dark table-hover m-0 align-middle" style={{ background: "transparent" }}>
            <thead style={{ background: "rgba(0,0,0,0.5)" }}>
              <tr>
                <th className="text-white-50 font-monospace small border-0 py-3 px-4">Status</th>
                <th className="text-white-50 font-monospace small border-0 py-3">Type</th>
                <th className="text-white-50 font-monospace small border-0 py-3">Name</th>
                <th className="text-white-50 font-monospace small border-0 py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-white-50 border-0">No campaigns found.</td></tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 border-0">
                      <span className={`badge ${camp.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {camp.is_active ? "Live" : "Inactive"}
                      </span>
                    </td>
                    <td className="border-0 text-white text-capitalize">{camp.campaign_type}</td>
                    <td className="border-0 text-white fw-bold">{camp.company_name}</td>
                    <td className="border-0 text-end px-4">
                      <button 
                        className={`btn btn-sm me-2 ${camp.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(camp.id, camp.is_active)}
                      >
                        {camp.is_active ? "Pause" : "Activate"}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(camp.id)}>
                        Drop
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}