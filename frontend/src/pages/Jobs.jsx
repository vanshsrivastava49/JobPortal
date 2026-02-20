import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Bookmark,
  ExternalLink,
  Loader2,
  Building2,
  CheckCircle,
  Users,
  X,
  Sparkles,
  Layers,
  Code2,
  ChevronDown,
  ChevronUp,
  Clock,
  Gift,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ROUND_TYPE_LABELS = {
  resume_screening: "Resume Screening",
  online_test: "Online Test",
  aptitude_test: "Aptitude Test",
  technical_interview: "Technical Interview",
  hr_interview: "HR Interview",
  group_discussion: "Group Discussion",
  assignment: "Assignment",
  final_interview: "Final Interview",
  offer: "Offer / Selection",
  other: "Other",
};

const ROUND_ICONS = {
  resume_screening: "📄",
  online_test: "💻",
  aptitude_test: "🧠",
  technical_interview: "⚙️",
  hr_interview: "🤝",
  group_discussion: "💬",
  assignment: "📝",
  final_interview: "🎯",
  offer: "🏆",
  other: "➕",
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPay, setSelectedPay] = useState("All");
  const [skillFilter, setSkillFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRounds, setExpandedRounds] = useState({});
  const observerRef = useRef();

  const fetchJobs = useCallback(async (pageNum = 1, append = false) => {
    if (loading) return;

    try {
      setLoading(pageNum === 1);
      setError(null);

      const response = await axios.get(`http://localhost:5000/api/jobs/public?page=${pageNum}&limit=12`, {
        timeout: 10000
      });

      let newJobs = [];
      if (response.data.jobs && Array.isArray(response.data.jobs)) {
        newJobs = response.data.jobs;
      } else if (Array.isArray(response.data)) {
        newJobs = response.data;
      }

      const validJobs = newJobs.filter(job => job && job._id && job.title);

      if (append && validJobs.length > 0) {
        setJobs(prev => {
          const existingIds = new Set(prev.map(j => j._id));
          const uniqueNew = validJobs.filter(job => !existingIds.has(job._id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setJobs(validJobs);
      }

      setHasMore(validJobs.length === 12);

    } catch (err) {
      console.error("Fetch error:", err);

      if (err.code !== 'ECONNABORTED' && !error) {
        try {
          const fallback = await axios.get("http://localhost:5000/api/jobs", { timeout: 5000 });
          const fallbackJobs = fallback.data.jobs || fallback.data || [];
          setJobs(fallbackJobs.filter(job => job.status === "approved"));
          toast.success("Loaded via fallback");
        } catch {
          setError("No jobs available");
          toast.error("No jobs found");
        }
      } else {
        setError("Backend not responding");
      }
    } finally {
      setLoading(false);
    }
  }, [loading, error]);

  const lastJobRef = useCallback((node) => {
    if (loading || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchJobs(nextPage, true);
      }
    }, { threshold: 0.1 });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, page, fetchJobs]);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        (job.skills || []).some(s => s.toLowerCase().includes(q)) ||
        (job.business?.businessProfile?.businessName || "").toLowerCase().includes(q)
      );
    }

    if (selectedLocation !== "All")
      filtered = filtered.filter(job => job.location === selectedLocation);

    if (selectedType !== "All")
      filtered = filtered.filter(job => job.type === selectedType);

    if (selectedPay === "Paid") filtered = filtered.filter(job => job.isPaid !== false);
    if (selectedPay === "Unpaid") filtered = filtered.filter(job => job.isPaid === false);

    if (skillFilter.trim()) {
      const sq = skillFilter.toLowerCase();
      filtered = filtered.filter(job =>
        (job.skills || []).some(s => s.toLowerCase().includes(sq))
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedLocation, selectedType, selectedPay, skillFilter, jobs]);

  useEffect(() => {
    fetchJobs(1, false);
  }, []);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("All");
    setSelectedType("All");
    setSelectedPay("All");
    setSkillFilter("");
    setPage(1);
    setJobs([]);
    setHasMore(true);
  };

  const toggleRounds = (jobId) => {
    setExpandedRounds(prev => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const locations = Array.from(new Set(jobs.map(job => job.location))).sort().filter(Boolean);
  const types = Array.from(new Set(jobs.map(job => job.type))).sort().filter(Boolean);
  const allSkills = Array.from(new Set(jobs.flatMap(j => j.skills || []).filter(Boolean))).sort();

  const hasActiveFilters = searchTerm || selectedLocation !== "All" || selectedType !== "All"
    || selectedPay !== "All" || skillFilter;

  const formatPay = (job) => {
    if (!job.isPaid) return { label: "Unpaid", color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
    if (job.stipend) {
      const period = { monthly: "/mo", yearly: "/yr", weekly: "/wk", hourly: "/hr", project: "/project" };
      return {
        label: `${job.stipend} ${period[job.stipendPeriod] || ""}`.trim(),
        color: "#065f46", bg: "#d1fae5", border: "#6ee7b7"
      };
    }
    if (job.salary) return { label: job.salary, color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" };
    return { label: "Paid", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; color: #0f172a; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .jobs-wrapper { background: #f8fafc; min-height: 100vh; }

        /* ── Hero ── */
        .hero-section { background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); padding: 64px 24px 80px; }
        .hero-container { max-width: 900px; margin: 0 auto; text-align: center; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
          border-radius: 50px; color: #10b981; font-size: 13px; font-weight: 600; margin-bottom: 24px;
        }
        .hero-title { font-size: 40px; font-weight: 700; color: white; margin-bottom: 16px; line-height: 1.2; }
        .hero-subtitle { font-size: 17px; color: #94a3b8; max-width: 600px; margin: 0 auto 40px; }

        /* ── Search ── */
        .search-container { max-width: 900px; margin: 0 auto; }
        .search-box {
          background: white; border-radius: 12px; padding: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1); display: flex; gap: 8px; flex-wrap: wrap;
        }
        .search-input-wrapper { flex: 1; min-width: 250px; position: relative; }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); }
        .search-input {
          width: 100%; padding: 14px 16px 14px 48px; font-size: 14px;
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .search-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .search-select {
          padding: 14px 16px; font-size: 14px; background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 8px; color: #475569; cursor: pointer; outline: none; min-width: 140px;
          font-weight: 500; font-family: 'Inter', sans-serif;
        }
        .search-select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }

        .filter-toggle-btn {
          display: flex; align-items: center; gap: 6px; padding: 14px 16px;
          font-size: 14px; font-weight: 600; color: #475569; background: #f8fafc;
          border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .filter-toggle-btn:hover, .filter-toggle-btn.active {
          border-color: #10b981; color: #10b981; background: #f0fdf4;
        }
        .clear-btn {
          padding: 14px 20px; font-size: 14px; font-weight: 600; color: #64748b;
          background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; gap: 6px; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .clear-btn:hover { background: #f8fafc; color: #475569; }

        /* ── Advanced filter panel ── */
        .adv-filters {
          max-width: 900px; margin: 12px auto 0; background: white;
          border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;
          display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;
          animation: fadeUp 0.2s ease;
        }
        .adv-filter-group { display: flex; flex-direction: column; gap: 8px; }
        .adv-filter-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .pay-chips { display: flex; gap: 6px; }
        .pay-chip {
          padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .pay-chip.active { background: #d1fae5; border-color: #6ee7b7; color: #065f46; }
        .skill-filter-input {
          padding: 8px 12px; font-size: 13px; background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 8px; outline: none; font-family: 'Inter', sans-serif;
          color: #0f172a; transition: all 0.2s; min-width: 200px;
        }
        .skill-filter-input:focus { border-color: #10b981; }
        .skill-filter-input::placeholder { color: #94a3b8; }

        /* ── Stats bar ── */
        .stats-bar { max-width: 1200px; margin: -24px auto 40px; padding: 0 24px; }
        .stats-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 16px 24px; display: flex; align-items: center; gap: 24px; flex-wrap: wrap; font-size: 14px;
        }
        .stat-item { color: #64748b; }
        .stat-value { font-weight: 600; color: #0f172a; }
        .stat-divider { color: #cbd5e1; }
        .verified-badge { margin-left: auto; color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 6px; font-size: 13px; }

        /* ── Skill cloud ── */
        .skill-cloud {
          max-width: 1200px; margin: 0 auto 24px; padding: 0 24px;
          display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
        }
        .skill-cloud-label { font-size: 12px; color: #94a3b8; font-weight: 600; white-space: nowrap; }
        .skill-cloud-pill {
          padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s; background: white;
          border: 1px solid #e2e8f0; color: #64748b;
        }
        .skill-cloud-pill:hover { border-color: #10b981; color: #10b981; }
        .skill-cloud-pill.active { background: #d1fae5; border-color: #6ee7b7; color: #065f46; }

        /* ── Grid ── */
        .jobs-container { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }
        .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }

        /* ── Job Card ── */
        .job-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;
          transition: all 0.2s; cursor: pointer; display: flex; flex-direction: column;
          animation: fadeUp 0.3s ease;
        }
        .job-card:hover { border-color: #10b981; box-shadow: 0 4px 20px rgba(16,185,129,0.1); }

        /* Tags */
        .job-tags { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .job-tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .tag-type { background: #dbeafe; color: #1e40af; }
        .tag-live { background: #d1fae5; color: #065f46; display: flex; align-items: center; gap: 4px; }
        .live-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
        .tag-pay {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          display: flex; align-items: center; gap: 4px;
          border: 1px solid transparent;
        }

        /* Title */
        .job-title {
          font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px;
          line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden; transition: color 0.2s;
        }
        .job-card:hover .job-title { color: #10b981; }

        /* Company */
        .job-company { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .company-logo {
          width: 40px; height: 40px; background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .company-info { flex: 1; min-width: 0; }
        .company-name { font-size: 14px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .company-verified { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #10b981; margin-top: 2px; }

        /* Meta */
        .job-meta { display: flex; gap: 16px; font-size: 13px; color: #64748b; margin-bottom: 16px; flex-wrap: wrap; }
        .job-meta-item { display: flex; align-items: center; gap: 6px; }

        /* Skills */
        .job-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .job-skill-pill {
          padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 500;
          background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; cursor: pointer; transition: all 0.15s;
        }
        .job-skill-pill:hover { border-color: #10b981; color: #10b981; }
        .job-skill-pill.highlighted { background: #d1fae5; border-color: #6ee7b7; color: #065f46; }
        .job-skill-more { font-size: 12px; color: #94a3b8; padding: 3px 0; }

        /* Divider */
        .job-divider { height: 1px; background: #f1f5f9; margin: 14px 0; }

        /* Rounds */
        .job-rounds-toggle {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; border-radius: 8px; background: #f8fafc;
          border: 1px solid #e2e8f0; cursor: pointer; font-size: 13px; font-weight: 600;
          color: #475569; font-family: 'Inter', sans-serif; transition: all 0.2s; width: 100%;
          margin-bottom: 0;
        }
        .job-rounds-toggle:hover { background: #f0fdf4; border-color: #6ee7b7; color: #065f46; }
        .job-rounds-list { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; margin-bottom: 4px; }
        .job-round-item {
          display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px;
          border-radius: 8px; background: #f8fafc; border: 1px solid #f1f5f9;
        }
        .job-round-num {
          width: 22px; height: 22px; border-radius: 50%; background: #0f172a;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: white; flex-shrink: 0; margin-top: 1px;
        }
        .job-round-icon { font-size: 14px; flex-shrink: 0; margin-top: 2px; }
        .job-round-info { flex: 1; min-width: 0; }
        .job-round-title { font-size: 13px; font-weight: 600; color: #0f172a; }
        .job-round-desc { font-size: 12px; color: #64748b; margin-top: 2px; line-height: 1.4; }
        .job-round-dur { display: flex; align-items: center; gap: 3px; font-size: 11px; color: #94a3b8; margin-top: 4px; }

        /* Actions */
        .job-actions { display: flex; gap: 10px; padding-top: 14px; margin-top: auto; }
        .btn-view {
          flex: 1; background: #0f172a; color: white; padding: 12px 16px; border-radius: 8px;
          font-size: 14px; font-weight: 600; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; text-decoration: none; font-family: 'Inter', sans-serif;
        }
        .btn-view:hover { background: #10b981; }
        .btn-bookmark {
          width: 48px; height: 48px; background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-bookmark:hover { background: #f0fdf4; border-color: #10b981; }

        /* States */
        .loading-state, .error-state, .empty-state { text-align: center; padding: 80px 24px; }
        .state-icon {
          width: 64px; height: 64px; margin: 0 auto 24px; background: #f1f5f9;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
        }
        .state-title { font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
        .state-description { font-size: 15px; color: #64748b; margin-bottom: 24px; }
        .btn-action {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 24px; background: #10b981; color: white; font-size: 14px; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .btn-action:hover { background: #059669; }
        .btn-action-secondary { background: #f1f5f9; color: #475569; }
        .btn-action-secondary:hover { background: #e2e8f0; }

        .load-more { text-align: center; padding: 48px 24px; }
        .load-more-text { font-size: 14px; color: #94a3b8; margin-top: 12px; }

        .spinner { animation: spin 1s linear infinite; }

        @media (max-width: 768px) {
          .hero-section { padding: 48px 16px 64px; }
          .hero-title { font-size: 32px; }
          .search-box { flex-direction: column; }
          .search-input-wrapper { min-width: 100%; }
          .search-select { width: 100%; }
          .jobs-grid { grid-template-columns: 1fr; }
          .stats-card { font-size: 13px; gap: 16px; }
          .verified-badge { margin-left: 0; width: 100%; }
          .adv-filters { flex-direction: column; }
        }
      `}</style>

      <Navbar />

      <div className="jobs-wrapper">
        {/* Hero */}
        <div className="hero-section">
          <div className="hero-container">
            <div className="hero-badge">
              <Sparkles size={14} />
              {filteredJobs.length} open positions
            </div>
            <h1 className="hero-title">Find your next opportunity</h1>
            <p className="hero-subtitle">
              Discover verified roles — see the full hiring process before you apply
            </p>
          </div>

          {/* Search box */}
          <div className="search-container">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Job title, company, skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="search-select">
                <option value="All">All Locations</option>
                {locations.map(loc => <option key={loc}>{loc}</option>)}
              </select>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="search-select">
                <option value="All">All Types</option>
                {types.map(type => <option key={type}>{type}</option>)}
              </select>
              <button
                className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(p => !p)}
              >
                <Filter size={15} />
                Filters
              </button>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="clear-btn">
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="adv-filters">
                <div className="adv-filter-group">
                  <span className="adv-filter-label">Compensation</span>
                  <div className="pay-chips">
                    {["All", "Paid", "Unpaid"].map(p => (
                      <button
                        key={p}
                        className={`pay-chip ${selectedPay === p ? "active" : ""}`}
                        onClick={() => setSelectedPay(p)}
                      >
                        {p === "Paid" ? "💰 " : p === "Unpaid" ? "🤝 " : ""}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="adv-filter-group" style={{ flex: 1 }}>
                  <span className="adv-filter-label">Filter by Skill</span>
                  <input
                    className="skill-filter-input"
                    placeholder="e.g. React, Python, Figma..."
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stats-card">
            <span className="stat-item"><span className="stat-value">{filteredJobs.length}</span> jobs</span>
            <span className="stat-divider">|</span>
            <span className="stat-item"><span className="stat-value">{locations.length}</span> locations</span>
            <span className="stat-divider">|</span>
            <span className="stat-item"><span className="stat-value">{types.length}</span> types</span>
            <span className="stat-divider">|</span>
            <span className="stat-item"><span className="stat-value">{allSkills.length}</span> skills</span>
            <span className="verified-badge">
              <CheckCircle size={14} />
              Verified employers
            </span>
          </div>
        </div>

        {/* Skill cloud */}
        {allSkills.length > 0 && (
          <div className="skill-cloud">
            <span className="skill-cloud-label">
              <Code2 size={12} style={{ display: "inline", marginRight: 4 }} />
              Skills:
            </span>
            {allSkills.slice(0, 20).map(skill => (
              <button
                key={skill}
                className={`skill-cloud-pill ${skillFilter.toLowerCase() === skill.toLowerCase() ? "active" : ""}`}
                onClick={() => setSkillFilter(prev => prev.toLowerCase() === skill.toLowerCase() ? "" : skill)}
              >
                {skill}
              </button>
            ))}
            {allSkills.length > 20 && (
              <span style={{ fontSize: 12, color: "#94a3b8" }}>+{allSkills.length - 20} more</span>
            )}
          </div>
        )}

        {/* Jobs grid */}
        <div className="jobs-container">
          {loading && filteredJobs.length === 0 ? (
            <div className="loading-state">
              <div className="state-icon">
                <Loader2 size={32} color="#10b981" className="spinner" />
              </div>
              <p className="state-title">Finding opportunities...</p>
            </div>
          ) : error && filteredJobs.length === 0 ? (
            <div className="error-state">
              <div className="state-icon">
                <Briefcase size={32} color="#cbd5e1" />
              </div>
              <h3 className="state-title">{error}</h3>
              <p className="state-description">Ensure your backend is running and jobs are approved</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => window.location.reload()} className="btn-action">Reload</button>
                <button onClick={() => fetchJobs(1, false)} className="btn-action btn-action-secondary">Retry</button>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="state-icon">
                <Search size={32} color="#cbd5e1" />
              </div>
              <h3 className="state-title">No jobs match your search</h3>
              <p className="state-description">Try different keywords or clear your filters</p>
              <button onClick={resetFilters} className="btn-action">Clear Filters</button>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job, index) => {
                const isLast = index === filteredJobs.length - 1;
                const pay = formatPay(job);
                const skills = job.skills || [];
                const rounds = job.rounds || [];
                const roundsOpen = expandedRounds[job._id];
                const SKILL_LIMIT = 4;

                return (
                  <div key={job._id} ref={isLast ? lastJobRef : null} className="job-card">
                    {/* Tags row */}
                    <div className="job-tags">
                      <span className="job-tag tag-type">{job.type}</span>
                      <span className="job-tag tag-live">
                        <span className="live-dot" />
                        Live
                      </span>
                      <span
                        className="tag-pay"
                        style={{ background: pay.bg, color: pay.color, borderColor: pay.border }}
                      >
                        {job.isPaid
                          ? <DollarSign size={10} />
                          : <Gift size={10} />
                        }
                        {pay.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="job-title">{job.title}</h2>

                    {/* Company */}
                    <div className="job-company">
                      <div className="company-logo">
                        <Building2 size={20} color="white" />
                      </div>
                      <div className="company-info">
                        <div className="company-name">
                          {job.company ||
                            job.business?.businessProfile?.businessName ||
                            job.business?.businessProfile?.companyName ||
                            "Direct Hire"}
                        </div>
                        <div className="company-verified">
                          <CheckCircle size={12} />
                          Verified
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="job-meta">
                      <div className="job-meta-item">
                        <MapPin size={13} />
                        {job.location}
                      </div>
                      {rounds.length > 0 && (
                        <div className="job-meta-item">
                          <Layers size={13} />
                          {rounds.length} round{rounds.length !== 1 ? "s" : ""}
                        </div>
                      )}
                      {skills.length > 0 && (
                        <div className="job-meta-item">
                          <Code2 size={13} />
                          {skills.length} skill{skills.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="job-skills">
                        {skills.slice(0, SKILL_LIMIT).map(s => (
                          <button
                            key={s}
                            className={`job-skill-pill ${
                              skillFilter && s.toLowerCase().includes(skillFilter.toLowerCase())
                                ? "highlighted" : ""
                            }`}
                            onClick={() => setSkillFilter(s)}
                          >
                            {s}
                          </button>
                        ))}
                        {skills.length > SKILL_LIMIT && (
                          <span className="job-skill-more">+{skills.length - SKILL_LIMIT} more</span>
                        )}
                      </div>
                    )}

                    {/* Hiring rounds */}
                    {rounds.length > 0 && (
                      <>
                        <div className="job-divider" />
                        <button className="job-rounds-toggle" onClick={() => toggleRounds(job._id)}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Layers size={14} />
                            Hiring Process ({rounds.length} rounds)
                          </span>
                          {roundsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {roundsOpen && (
                          <div className="job-rounds-list">
                            {rounds.map((r, i) => (
                              <div key={r._id || i} className="job-round-item">
                                <div className="job-round-num">{r.order || i + 1}</div>
                                <div className="job-round-icon">
                                  {ROUND_ICONS[r.type] || "➕"}
                                </div>
                                <div className="job-round-info">
                                  <div className="job-round-title">
                                    {r.title || ROUND_TYPE_LABELS[r.type] || r.type}
                                  </div>
                                  {r.description && (
                                    <div className="job-round-desc">
                                      {r.description.length > 90
                                        ? r.description.slice(0, 90) + "…"
                                        : r.description}
                                    </div>
                                  )}
                                  {r.duration && (
                                    <div className="job-round-dur">
                                      <Clock size={10} />
                                      {r.duration}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Actions */}
                    <div className="job-actions">
                      <Link to={`/jobs/${job._id}`} className="btn-view">
                        View Details
                        <ExternalLink size={14} />
                      </Link>
                      <button className="btn-bookmark">
                        <Bookmark size={20} color="#64748b" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasMore && jobs.length > 0 && (
            <div className="load-more">
              <Loader2 size={24} color="#10b981" className="spinner" />
              <p className="load-more-text">Loading more...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Jobs;