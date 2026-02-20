import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Gift,
  Layers,
  Eye,
  EyeOff,
  Briefcase,
  Clock,
  MapPin,
  Users,
  FileText,
  Award,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const ROUND_TYPES = [
  { value: "resume_screening", label: "Resume Screening", icon: "📄" },
  { value: "online_test", label: "Online Test / Assessment", icon: "💻" },
  { value: "aptitude_test", label: "Aptitude Test", icon: "🧠" },
  { value: "technical_interview", label: "Technical Interview", icon: "⚙️" },
  { value: "hr_interview", label: "HR Interview", icon: "🤝" },
  { value: "group_discussion", label: "Group Discussion", icon: "💬" },
  { value: "assignment", label: "Assignment / Task", icon: "📝" },
  { value: "final_interview", label: "Final Interview", icon: "🎯" },
  { value: "offer", label: "Offer / Selection", icon: "🏆" },
  { value: "other", label: "Other", icon: "➕" },
];

const JOB_CATEGORIES = [
  "Full Time", "Part Time", "Internship", "Contract", "Remote", "Freelance"
];

const defaultRound = () => ({
  id: Date.now() + Math.random(),
  type: "resume_screening",
  title: "",
  description: "",
  duration: "",
  expanded: true,
});

const PostJob = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full Time",
    description: "",
    skills: "",
    isPaid: true,
    stipend: "",
    stipendPeriod: "monthly",
    rounds: [defaultRound()],
    status: "pending_business",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [linkedBusiness, setLinkedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [checkingBusiness, setCheckingBusiness] = useState(true);
  const [activeSection, setActiveSection] = useState("basics");
  const [existingJob, setExistingJob] = useState(null);
  const [takingDown, setTakingDown] = useState(false);

  const checkLinkedBusiness = useCallback(async () => {
    try {
      setCheckingBusiness(true);
      const businessId = user?.recruiterProfile?.linkedBusiness;
      if (!businessId) { setLinkedBusiness(null); setBusinessDetails(null); return; }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/profile/recruiter/linked-business-details`,
          { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
        );
        if (response.data.success && response.data.linked) {
          setLinkedBusiness(businessId);
          setBusinessDetails(response.data.business);
          setForm(prev => ({ ...prev, company: response.data.business.name || prev.company }));
        } else {
          setLinkedBusiness(null); setBusinessDetails(null);
        }
      } catch { setLinkedBusiness(businessId); }
    } catch { setLinkedBusiness(null); setBusinessDetails(null); }
    finally { setCheckingBusiness(false); }
  }, [user, token]);

  useEffect(() => {
    if (token && user) checkLinkedBusiness();
    else setCheckingBusiness(false);
  }, [checkLinkedBusiness, token, user]);

  useEffect(() => {
    if (jobId && token) {
      axios.get(`${API_BASE_URL}/api/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          const job = res.data.job || res.data;
          setExistingJob(job);
          setForm({
            title: job.title || "",
            company: job.company || "",
            location: job.location || "",
            type: job.type || "Full Time",
            description: job.description || "",
            skills: (job.skills || []).join(", "),
            isPaid: job.isPaid !== false,
            stipend: job.stipend || "",
            stipendPeriod: job.stipendPeriod || "monthly",
            rounds: job.rounds?.length
              ? job.rounds.map((r) => ({ ...r, id: r._id || Date.now() + Math.random(), expanded: false }))
              : [defaultRound()],
            status: job.status,
          });
        }).catch(() => {});
    }
  }, [jobId, token]);

  const addRound = () => setForm((prev) => ({ ...prev, rounds: [...prev.rounds, defaultRound()] }));
  const removeRound = (id) => setForm((prev) => ({ ...prev, rounds: prev.rounds.filter((r) => r.id !== id) }));
  const updateRound = (id, field, value) => setForm((prev) => ({ ...prev, rounds: prev.rounds.map((r) => r.id === id ? { ...r, [field]: value } : r) }));
  const toggleRound = (id) => setForm((prev) => ({ ...prev, rounds: prev.rounds.map((r) => r.id === id ? { ...r, expanded: !r.expanded } : r) }));
  const moveRound = (idx, dir) => {
    setForm((prev) => {
      const rounds = [...prev.rounds];
      const swap = idx + dir;
      if (swap < 0 || swap >= rounds.length) return prev;
      [rounds[idx], rounds[swap]] = [rounds[swap], rounds[idx]];
      return { ...prev, rounds };
    });
  };

  const validate = () => {
    const errors = {};
    if (!form.title.trim() || form.title.trim().length < 3)
      errors.title = "Job title must be at least 3 characters";
    if (!form.location.trim())
      errors.location = "Location is required";
    if (!form.description.trim() || form.description.trim().length < 50)
      errors.description = `Description needs at least 50 characters (${form.description.trim().length} now)`;
    if (form.isPaid && !form.stipend.trim())
      errors.stipend = "Please enter the stipend/salary amount";
    if (form.rounds.length === 0)
      errors.rounds = "Add at least one recruitment round";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── KEY FIX: handleSubmit no longer depends on a form event ──
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      // Jump back to the first section that has an error
      if (formErrors.title || formErrors.location || formErrors.description) {
        setActiveSection("basics");
      } else if (formErrors.stipend) {
        setActiveSection("compensation");
      }
      return;
    }
    if (!linkedBusiness) {
      toast.error("Link to a business first from your dashboard");
      setTimeout(() => navigate("/dashboard"), 2000);
      return;
    }
    try {
      setLoading(true);
      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        type: form.type,
        description: form.description.trim(),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        isPaid: form.isPaid,
        stipend: form.isPaid ? form.stipend.trim() : "",
        stipendPeriod: form.isPaid ? form.stipendPeriod : "",
        rounds: form.rounds.map((r, i) => ({
          order: i + 1,
          type: r.type,
          title: r.title || ROUND_TYPES.find((t) => t.value === r.type)?.label || r.type,
          description: r.description,
          duration: r.duration,
        })),
      };
      const url = jobId ? `${API_BASE_URL}/api/jobs/${jobId}` : `${API_BASE_URL}/api/jobs`;
      const method = jobId ? "put" : "post";
      const response = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        timeout: 15000,
      });
      toast.success(response.data.message || "Job submitted for approval!", {
        duration: 3000,
        style: { background: "#D1FAE5", color: "#065F46", border: "1px solid #6EE7B7", borderRadius: "12px", fontWeight: "500" },
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit job");
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDown = async () => {
    if (!existingJob) return;
    const confirmed = window.confirm("Take this job offline? It will no longer be visible to job seekers. You can repost it later.");
    if (!confirmed) return;
    try {
      setTakingDown(true);
      await axios.patch(`${API_BASE_URL}/api/jobs/${existingJob._id}/takedown`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Job taken down successfully");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to take down job");
    } finally {
      setTakingDown(false);
    }
  };

  const isFormValid = () =>
    form.title.trim().length >= 3 &&
    form.location.trim().length >= 2 &&
    form.description.trim().length >= 50 &&
    (!form.isPaid || form.stipend.trim()) &&
    form.rounds.length > 0;

  const sections = [
    { id: "basics", label: "Job Details", icon: Briefcase },
    { id: "compensation", label: "Compensation", icon: DollarSign },
    { id: "rounds", label: "Hiring Process", icon: Layers },
  ];

  const sectionOrder = ["basics", "compensation", "rounds"];
  const goNext = () => {
    const idx = sectionOrder.indexOf(activeSection);
    if (idx < sectionOrder.length - 1) setActiveSection(sectionOrder[idx + 1]);
  };
  const goPrev = () => {
    const idx = sectionOrder.indexOf(activeSection);
    if (idx > 0) setActiveSection(sectionOrder[idx - 1]);
  };

  if (checkingBusiness) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 16 }}>
          <Loader2 size={40} style={{ color: "#6366f1", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#64748b", fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #f8fafc; color: #0f172a; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }

        .pj-root { background: #f8fafc; min-height: 100vh; }

        .pj-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          animation: fadeIn 0.5s ease;
        }

        .pj-back {
          display: inline-flex; align-items: center; gap: 8px;
          color: #94a3b8; background: none; border: none; cursor: pointer;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          padding: 8px 0; margin-bottom: 28px; transition: color 0.2s;
        }
        .pj-back:hover { color: #6366f1; }

        .pj-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 40px; gap: 16px; flex-wrap: wrap;
        }
        .pj-header-left h1 {
          font-family: 'Syne', sans-serif;
          font-size: 34px; font-weight: 800; color: #0f172a;
          line-height: 1.1; margin-bottom: 8px;
        }
        .pj-header-left p { color: #94a3b8; font-size: 15px; }

        .pj-business-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 600;
        }
        .pj-business-pill.linked {
          background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
        }
        .pj-business-pill.unlinked {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
        }

        .pj-takedown-banner {
          background: #fff7ed; border: 1px solid #fed7aa;
          border-radius: 12px; padding: 16px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 32px; flex-wrap: wrap;
        }
        .pj-takedown-banner-left { display: flex; align-items: center; gap: 12px; }
        .pj-takedown-banner-left span { font-size: 14px; color: #ea580c; }
        .pj-takedown-banner-left strong { display: block; font-size: 15px; color: #c2410c; margin-bottom: 2px; }

        .pj-progress-bar {
          height: 3px; background: #e2e8f0; border-radius: 100px;
          overflow: hidden; margin-bottom: 20px;
        }
        .pj-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #818cf8);
          border-radius: 100px; transition: width 0.5s ease;
        }

        .pj-tabs {
          display: flex; gap: 4px; margin-bottom: 32px;
          background: #f1f5f9; border: 1px solid #e2e8f0;
          border-radius: 12px; padding: 4px;
        }
        .pj-tab {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 12px 16px; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          background: none; border: none; color: #94a3b8;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .pj-tab.active {
          background: white; color: #6366f1;
          border: 1px solid #e0e7ff;
          box-shadow: 0 1px 4px rgba(99,102,241,0.12);
        }
        .pj-tab:hover:not(.active) { color: #64748b; background: rgba(255,255,255,0.6); }

        .pj-card {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 28px; margin-bottom: 20px;
          animation: fadeIn 0.4s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .pj-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px;
        }
        .pj-card-subtitle { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }

        .pj-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .pj-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .pj-field:last-child { margin-bottom: 0; }

        .pj-label {
          font-size: 12px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.6px;
        }
        .pj-label span { color: #ef4444; margin-left: 2px; }

        .pj-input, .pj-select, .pj-textarea {
          width: 100%; padding: 12px 16px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; font-size: 15px;
          font-family: 'DM Sans', sans-serif; color: #0f172a;
          outline: none; transition: all 0.2s; -webkit-appearance: none;
        }
        .pj-input::placeholder, .pj-textarea::placeholder { color: #94a3b8; }
        .pj-input:focus, .pj-select:focus, .pj-textarea:focus {
          border-color: #a5b4fc; background: white;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .pj-input.error, .pj-textarea.error {
          border-color: #fca5a5; background: #fff5f5;
        }
        .pj-select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; background-size: 16px;
          padding-right: 40px;
        }
        .pj-select option { background: white; color: #0f172a; }
        .pj-textarea { resize: vertical; min-height: 140px; line-height: 1.6; }
        .pj-error-msg { font-size: 12px; color: #ef4444; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
        .pj-hint { font-size: 12px; color: #94a3b8; }

        .pj-comp-chip {
          padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1.5px solid transparent; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 6px;
        }
        .pj-comp-chip.paid { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
        .pj-comp-chip.paid.active { background: #dcfce7; border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.15); }
        .pj-comp-chip.unpaid { background: #f8fafc; border-color: #e2e8f0; color: #64748b; }
        .pj-comp-chip.unpaid.active { background: #f1f5f9; border-color: #94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,0.15); }

        .pj-stipend-group { display: flex; gap: 12px; align-items: flex-start; }
        .pj-stipend-group .pj-input { flex: 1; }
        .pj-stipend-group .pj-select { width: 140px; flex-shrink: 0; }

        .pj-rounds-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .pj-round-card {
          background: #fafbff; border: 1px solid #e2e8f0;
          border-radius: 12px; overflow: hidden; transition: all 0.2s;
          animation: slideIn 0.3s ease;
        }
        .pj-round-card:hover { border-color: #c7d2fe; box-shadow: 0 2px 8px rgba(99,102,241,0.07); }

        .pj-round-header {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; cursor: pointer; user-select: none;
          background: #fafbff;
        }
        .pj-round-num {
          width: 28px; height: 28px;
          background: #eef2ff; border: 1px solid #c7d2fe;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #6366f1; flex-shrink: 0;
        }
        .pj-round-type-icon { font-size: 18px; flex-shrink: 0; }
        .pj-round-info { flex: 1; min-width: 0; }
        .pj-round-info-title {
          font-size: 14px; font-weight: 600; color: #1e293b;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pj-round-info-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }

        .pj-round-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .pj-round-action-btn {
          width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer; border-radius: 6px;
          color: #cbd5e1; transition: all 0.2s;
        }
        .pj-round-action-btn:hover { background: #f1f5f9; color: #64748b; }
        .pj-round-action-btn.danger:hover { background: #fef2f2; color: #ef4444; }
        .pj-round-action-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .pj-round-body {
          padding: 0 16px 16px; border-top: 1px solid #f1f5f9;
          background: white; display: grid; gap: 14px;
        }
        .pj-round-body .pj-grid-2 { gap: 14px; margin-top: 14px; }

        .pj-type-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 8px; margin-top: 10px;
        }
        .pj-type-opt {
          display: flex; align-items: center; gap: 8px; padding: 10px 12px;
          border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;
          font-size: 13px; font-weight: 500; color: #64748b; transition: all 0.15s;
          background: #f8fafc; font-family: 'DM Sans', sans-serif;
        }
        .pj-type-opt:hover { border-color: #c7d2fe; color: #6366f1; background: #eef2ff; }
        .pj-type-opt.active { background: #eef2ff; border-color: #818cf8; color: #6366f1; font-weight: 600; }

        .pj-add-round-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 13px;
          background: #fafafa; border: 1.5px dashed #c7d2fe;
          border-radius: 10px; color: #6366f1; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .pj-add-round-btn:hover { background: #eef2ff; border-color: #818cf8; }

        .pj-main-grid {
          display: grid; grid-template-columns: 1fr 300px;
          gap: 24px; align-items: start;
        }
        .pj-sidebar { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 16px; }

        .pj-summary-card {
          background: #f5f3ff; border: 1px solid #e0e7ff;
          border-radius: 16px; padding: 20px;
          box-shadow: 0 1px 4px rgba(99,102,241,0.07);
        }
        .pj-summary-card h3 {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700; color: #6366f1; margin-bottom: 16px;
        }
        .pj-summary-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 0; border-bottom: 1px solid #ede9fe;
        }
        .pj-summary-item:last-child { border-bottom: none; padding-bottom: 0; }
        .pj-summary-icon {
          width: 28px; height: 28px; background: #ede9fe;
          border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pj-summary-label {
          font-size: 11px; color: #94a3b8; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .pj-summary-value { font-size: 13px; color: #1e293b; font-weight: 500; margin-top: 2px; }

        .pj-submit-btn {
          width: 100%; padding: 15px 24px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white; border: none; border-radius: 12px;
          font-size: 16px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 10px; transition: all 0.2s; letter-spacing: 0.2px;
        }
        .pj-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(99,102,241,0.35);
        }
        .pj-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .pj-takedown-btn {
          width: 100%; padding: 13px 24px;
          background: #fff7ed; color: #c2410c;
          border: 1px solid #fed7aa; border-radius: 12px;
          font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 8px; transition: all 0.2s;
        }
        .pj-takedown-btn:hover:not(:disabled) { background: #ffedd5; border-color: #fdba74; }
        .pj-takedown-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .pj-nav-btn {
          padding: 13px 20px; border-radius: 12px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
          border: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .pj-nav-btn-prev {
          background: white; border: 1px solid #e2e8f0; color: #94a3b8;
        }
        .pj-nav-btn-prev:hover { background: #f8fafc; color: #64748b; }
        .pj-nav-btn-next {
          flex: 1; background: #eef2ff; border: 1px solid #c7d2fe; color: #6366f1;
          justify-content: center;
        }
        .pj-nav-btn-next:hover { background: #e0e7ff; }

        .pj-unlinked-warning {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 12px; padding: 20px; text-align: center;
        }
        .pj-unlinked-warning p { font-size: 14px; color: #dc2626; margin-bottom: 12px; }
        .pj-unlinked-warning button {
          padding: 10px 20px; background: #fecaca; color: #991b1b;
          border: 1px solid #fca5a5; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .pj-unlinked-warning button:hover { background: #fca5a5; }

        .pj-info-note {
          padding: 14px; background: #f0f9ff; border: 1px solid #bae6fd;
          border-radius: 12px; font-size: 13px; color: #0369a1;
          display: flex; gap: 10px; align-items: flex-start;
        }

        @media (max-width: 860px) {
          .pj-main-grid { grid-template-columns: 1fr; }
          .pj-sidebar { position: static; }
          .pj-grid-2 { grid-template-columns: 1fr; }
          .pj-header-left h1 { font-size: 26px; }
          .pj-tabs { overflow-x: auto; }
          .pj-tab { min-width: 110px; }
        }
      `}</style>

      <Navbar />

      <div className="pj-root">
        <div className="pj-layout">

          {/* Back */}
          <button type="button" className="pj-back" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="pj-header">
            <div className="pj-header-left">
              <h1>{existingJob ? "Edit Job Listing" : "Post a New Job"}</h1>
              <p>{existingJob ? "Update your job posting details" : "Create a role and define your entire hiring pipeline"}</p>
            </div>
            <div className={`pj-business-pill ${linkedBusiness ? "linked" : "unlinked"}`}>
              {linkedBusiness
                ? <><CheckCircle2 size={14} />{businessDetails?.name || "Business Linked"}</>
                : <><XCircle size={14} />Not Linked</>}
            </div>
          </div>

          {/* Live job takedown banner */}
          {existingJob?.status === "approved" && (
            <div className="pj-takedown-banner">
              <div className="pj-takedown-banner-left">
                <Eye size={20} color="#ea580c" />
                <div>
                  <strong>This job is currently LIVE</strong>
                  <span>Visible to all job seekers on the platform</span>
                </div>
              </div>
              <button type="button" className="pj-takedown-btn" onClick={handleTakeDown} disabled={takingDown} style={{ width: "auto", minWidth: 140 }}>
                {takingDown
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Taking Down…</>
                  : <><EyeOff size={14} /> Take Job Down</>}
              </button>
            </div>
          )}

          {/* Progress bar */}
          {!existingJob && (
            <div className="pj-progress-bar">
              <div className="pj-progress-fill" style={{
                width: `${(
                  (form.title.trim().length >= 3 ? 1 : 0) +
                  (form.location.trim() ? 1 : 0) +
                  (form.description.trim().length >= 50 ? 1 : 0) +
                  (!form.isPaid || form.stipend.trim() ? 1 : 0) +
                  (form.rounds.length > 0 ? 1 : 0)
                ) * 20}%`
              }} />
            </div>
          )}

          {/* ── Tabs — all type="button" to never trigger form submit ── */}
          <div className="pj-tabs">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  type="button"
                  key={s.id}
                  className={`pj-tab ${activeSection === s.id ? "active" : ""}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  <Icon size={15} />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* ── Main layout ── */}
          <div className="pj-main-grid">

            {/* 
              KEY FIX: The <div> replaces <form> entirely.
              Nothing here can accidentally submit.
              The submit button calls handleSubmit() directly via onClick.
            */}
            <div>

              {/* ── BASICS ── */}
              {activeSection === "basics" && (
                <div className="pj-card">
                  <div className="pj-card-title">Core Details</div>
                  <div className="pj-card-subtitle">What's the role and where is it based?</div>

                  <div className="pj-field">
                    <label className="pj-label">Job Title <span>*</span></label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className={`pj-input ${formErrors.title ? "error" : ""}`}
                      placeholder="e.g. Senior Frontend Engineer"
                      disabled={loading || !linkedBusiness}
                    />
                    {formErrors.title && <span className="pj-error-msg"><AlertCircle size={12} />{formErrors.title}</span>}
                  </div>

                  <div className="pj-grid-2">
                    <div className="pj-field">
                      <label className="pj-label">Company Name</label>
                      <input
                        value={form.company}
                        onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                        className="pj-input"
                        placeholder="Your company name"
                        disabled={loading || !!businessDetails}
                        readOnly={!!businessDetails}
                        style={{ opacity: businessDetails ? 0.6 : 1 }}
                      />
                      {businessDetails && <span className="pj-hint">✓ Auto-filled from business profile</span>}
                    </div>
                    <div className="pj-field">
                      <label className="pj-label">Location <span>*</span></label>
                      <input
                        value={form.location}
                        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                        className={`pj-input ${formErrors.location ? "error" : ""}`}
                        placeholder="e.g. Bangalore / Remote"
                        disabled={loading || !linkedBusiness}
                      />
                      {formErrors.location && <span className="pj-error-msg"><AlertCircle size={12} />{formErrors.location}</span>}
                    </div>
                  </div>

                  <div className="pj-field">
                    <label className="pj-label">Employment Type <span>*</span></label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {JOB_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, type: cat }))}
                          style={{
                            padding: "8px 16px", borderRadius: "100px",
                            border: `1.5px solid ${form.type === cat ? "#818cf8" : "#e2e8f0"}`,
                            background: form.type === cat ? "#eef2ff" : "#f8fafc",
                            color: form.type === cat ? "#6366f1" : "#64748b",
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pj-field">
                    <label className="pj-label">Required Skills</label>
                    <input
                      value={form.skills}
                      onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
                      className="pj-input"
                      placeholder="React, Node.js, PostgreSQL (comma-separated)"
                      disabled={loading || !linkedBusiness}
                    />
                    <span className="pj-hint">Separate multiple skills with commas</span>
                    {form.skills.trim() && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                        {form.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                          <span key={i} style={{ padding: "3px 10px", borderRadius: "100px", fontSize: 11, fontWeight: 600, background: "#eef2ff", border: "1px solid #c7d2fe", color: "#6366f1" }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pj-field">
                    <label className="pj-label">Job Description <span>*</span></label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      className={`pj-textarea ${formErrors.description ? "error" : ""}`}
                      placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
                      rows={7}
                      disabled={loading || !linkedBusiness}
                    />
                    {formErrors.description && <span className="pj-error-msg"><AlertCircle size={12} />{formErrors.description}</span>}
                    <span className="pj-hint">{form.description.length} / 5000 chars · min 50 required</span>
                  </div>
                </div>
              )}

              {/* ── COMPENSATION ── */}
              {activeSection === "compensation" && (
                <div className="pj-card">
                  <div className="pj-card-title">Compensation</div>
                  <div className="pj-card-subtitle">Is this role paid or voluntary?</div>

                  <div className="pj-field">
                    <label className="pj-label">Payment Type <span>*</span></label>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="button" className={`pj-comp-chip paid ${form.isPaid ? "active" : ""}`}
                        onClick={() => setForm((p) => ({ ...p, isPaid: true }))}>
                        <DollarSign size={14} />Paid Role
                      </button>
                      <button type="button" className={`pj-comp-chip unpaid ${!form.isPaid ? "active" : ""}`}
                        onClick={() => setForm((p) => ({ ...p, isPaid: false, stipend: "" }))}>
                        <Gift size={14} />Unpaid / Volunteer
                      </button>
                    </div>
                  </div>

                  {form.isPaid ? (
                    <div className="pj-field" style={{ animation: "fadeIn 0.3s ease" }}>
                      <label className="pj-label">Stipend / Salary <span>*</span></label>
                      <div className="pj-stipend-group">
                        <input
                          value={form.stipend}
                          onChange={(e) => setForm((p) => ({ ...p, stipend: e.target.value }))}
                          className={`pj-input ${formErrors.stipend ? "error" : ""}`}
                          placeholder="e.g. ₹15,000 or ₹8-12 LPA"
                          disabled={loading || !linkedBusiness}
                        />
                        <select
                          value={form.stipendPeriod}
                          onChange={(e) => setForm((p) => ({ ...p, stipendPeriod: e.target.value }))}
                          className="pj-select"
                          disabled={loading || !linkedBusiness}
                        >
                          <option value="monthly">/ Month</option>
                          <option value="yearly">/ Year</option>
                          <option value="weekly">/ Week</option>
                          <option value="hourly">/ Hour</option>
                          <option value="project">/ Project</option>
                        </select>
                      </div>
                      {formErrors.stipend && <span className="pj-error-msg"><AlertCircle size={12} />{formErrors.stipend}</span>}
                      <span className="pj-hint">Be specific — clear pay attracts better candidates</span>
                    </div>
                  ) : (
                    <div style={{ padding: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                      <p style={{ fontSize: 14, color: "#64748b" }}>
                        This role will be listed as <strong style={{ color: "#0f172a" }}>Unpaid / Volunteer</strong>.
                        Candidates will see this clearly on the job card.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── ROUNDS ── */}
              {activeSection === "rounds" && (
                <div className="pj-card">
                  <div className="pj-card-title">Hiring Process</div>
                  <div className="pj-card-subtitle">Define each round — candidates can see what to expect before applying</div>

                  {formErrors.rounds && (
                    <div className="pj-error-msg" style={{ marginBottom: 16 }}>
                      <AlertCircle size={14} />{formErrors.rounds}
                    </div>
                  )}

                  <div className="pj-rounds-list">
                    {form.rounds.map((round, idx) => {
                      const roundMeta = ROUND_TYPES.find((t) => t.value === round.type) || ROUND_TYPES[0];
                      return (
                        <div key={round.id} className="pj-round-card">
                          <div className="pj-round-header" onClick={() => toggleRound(round.id)}>
                            <div className="pj-round-num">{idx + 1}</div>
                            <div className="pj-round-type-icon">{roundMeta.icon}</div>
                            <div className="pj-round-info">
                              <div className="pj-round-info-title">{round.title || roundMeta.label}</div>
                              {round.duration && (
                                <div className="pj-round-info-sub">
                                  <Clock size={10} style={{ display: "inline", marginRight: 4 }} />{round.duration}
                                </div>
                              )}
                            </div>
                            <div className="pj-round-actions" onClick={(e) => e.stopPropagation()}>
                              <button type="button" className="pj-round-action-btn" onClick={() => moveRound(idx, -1)} disabled={idx === 0}><ChevronUp size={14} /></button>
                              <button type="button" className="pj-round-action-btn" onClick={() => moveRound(idx, 1)} disabled={idx === form.rounds.length - 1}><ChevronDown size={14} /></button>
                              <button type="button" className="pj-round-action-btn danger" onClick={() => removeRound(round.id)}><Trash2 size={14} /></button>
                            </div>
                            <div style={{ color: "#cbd5e1", marginLeft: 4 }}>
                              {round.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>

                          {round.expanded && (
                            <div className="pj-round-body">
                              <div>
                                <label className="pj-label" style={{ display: "block", marginBottom: 10, marginTop: 14 }}>Round Type</label>
                                <div className="pj-type-grid">
                                  {ROUND_TYPES.map((t) => (
                                    <button
                                      key={t.value}
                                      type="button"
                                      className={`pj-type-opt ${round.type === t.value ? "active" : ""}`}
                                      onClick={() => updateRound(round.id, "type", t.value)}
                                    >
                                      <span>{t.icon}</span>{t.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="pj-grid-2">
                                <div>
                                  <label className="pj-label" style={{ marginBottom: 6, display: "block" }}>Custom Title (optional)</label>
                                  <input
                                    value={round.title}
                                    onChange={(e) => updateRound(round.id, "title", e.target.value)}
                                    className="pj-input"
                                    placeholder={roundMeta.label}
                                  />
                                </div>
                                <div>
                                  <label className="pj-label" style={{ marginBottom: 6, display: "block" }}>Duration / Timeframe</label>
                                  <input
                                    value={round.duration}
                                    onChange={(e) => updateRound(round.id, "duration", e.target.value)}
                                    className="pj-input"
                                    placeholder="e.g. 45 mins, 2 days"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="pj-label" style={{ marginBottom: 6, display: "block" }}>Round Description</label>
                                <textarea
                                  value={round.description}
                                  onChange={(e) => updateRound(round.id, "description", e.target.value)}
                                  className="pj-textarea"
                                  placeholder="What will candidates do in this round? What are you evaluating?"
                                  rows={3}
                                  style={{ minHeight: 90 }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {form.rounds.length < 10 && (
                    <button type="button" className="pj-add-round-btn" onClick={addRound}>
                      <Plus size={16} />Add Another Round
                    </button>
                  )}

                  <div style={{ marginTop: 16, padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, fontSize: 13, color: "#15803d", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Award size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>Candidates can see your full hiring pipeline before they apply. Transparency helps attract serious applicants.</span>
                  </div>
                </div>
              )}

              {/* ── Navigation buttons ── */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {activeSection !== "basics" && (
                  <button type="button" className="pj-nav-btn pj-nav-btn-prev" onClick={goPrev}>
                    ← Previous
                  </button>
                )}

                {activeSection !== "rounds" ? (
                  <button type="button" className="pj-nav-btn pj-nav-btn-next" onClick={goNext}>
                    Next →
                  </button>
                ) : (
                  /* ── SUBMIT — type="button" + onClick only, never a form submit ── */
                  <button
                    type="button"
                    className="pj-submit-btn"
                    onClick={handleSubmit}
                    disabled={loading || !linkedBusiness || !isFormValid()}
                    style={{ flex: 1 }}
                  >
                    {loading
                      ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />Submitting…</>
                      : !linkedBusiness
                        ? "🔗 Link to Business First"
                        : !isFormValid()
                          ? "⏳ Complete Required Fields"
                          : existingJob
                            ? "✅ Update Job Listing"
                            : "🚀 Post for Approval"}
                  </button>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="pj-sidebar">
              {linkedBusiness ? (
                <div className="pj-summary-card">
                  <h3>Job Preview</h3>
                  {[
                    { icon: Briefcase, label: "Role",     value: form.title || "—" },
                    { icon: Clock,     label: "Type",     value: form.type },
                    { icon: MapPin,    label: "Location", value: form.location || "—" },
                    { icon: DollarSign,label: "Pay",      value: form.isPaid ? (form.stipend ? `${form.stipend} / ${form.stipendPeriod}` : "Paid (TBD)") : "Unpaid / Volunteer" },
                    { icon: Users,     label: "Skills",   value: form.skills ? form.skills.split(",").filter(Boolean).length + " skills" : "None listed" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="pj-summary-item">
                      <div className="pj-summary-icon"><Icon size={14} color="#6366f1" /></div>
                      <div>
                        <div className="pj-summary-label">{label}</div>
                        <div className="pj-summary-value">{value}</div>
                      </div>
                    </div>
                  ))}

                  <div className="pj-summary-item">
                    <div className="pj-summary-icon"><Layers size={14} color="#6366f1" /></div>
                    <div>
                      <div className="pj-summary-label">Rounds</div>
                      <div className="pj-summary-value">
                        {form.rounds.length} stage{form.rounds.length !== 1 ? "s" : ""}
                        {form.rounds.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            {form.rounds.map((r, i) => {
                              const meta = ROUND_TYPES.find((t) => t.value === r.type) || ROUND_TYPES[0];
                              return (
                                <div key={r.id} style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                                  <span style={{ width: 16, height: 16, background: "#eef2ff", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#6366f1", flexShrink: 0 }}>{i + 1}</span>
                                  {meta.icon} {r.title || meta.label}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pj-unlinked-warning">
                  <XCircle size={32} color="#dc2626" style={{ margin: "0 auto 12px", display: "block" }} />
                  <p>You must link to an approved business before posting jobs.</p>
                  <button type="button" onClick={() => navigate("/dashboard")}>Go to Dashboard →</button>
                </div>
              )}

              {existingJob?.status === "approved" && (
                <button type="button" className="pj-takedown-btn" onClick={handleTakeDown} disabled={takingDown}>
                  {takingDown
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Taking Down…</>
                    : <><EyeOff size={14} />Take Job Offline</>}
                </button>
              )}

              <div className="pj-info-note">
                <FileText size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>All new jobs go to the business owner for approval before going live. Edits to live jobs resubmit for review.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostJob;