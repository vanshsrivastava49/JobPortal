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
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
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
      } else if (response.data.success && Array.isArray(response.data.jobs)) {
        newJobs = response.data.jobs;
      } else if (Array.isArray(response.data)) {
        newJobs = response.data;
      }

      const validJobs = newJobs.filter(job => job && job._id && job.title);

      if (append && validJobs.length > 0) {
        setJobs(prev => {
          const existingIds = new Set(prev.map(j => j._id));
          const uniqueNewJobs = validJobs.filter(job => !existingIds.has(job._id));
          return [...prev, ...uniqueNewJobs];
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
        } catch (fallbackErr) {
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
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.business?.businessProfile?.businessName || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation !== "All") {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    if (selectedType !== "All") {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedLocation, selectedType, jobs]);

  useEffect(() => {
    fetchJobs(1, false);
  }, []);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("All");
    setSelectedType("All");
    setPage(1);
    setJobs([]);
    setHasMore(true);
  };

  const locations = Array.from(new Set(jobs.map(job => job.location))).sort().filter(Boolean);
  const types = Array.from(new Set(jobs.map(job => job.type))).sort().filter(Boolean);

  const formatSalary = (salary) => {
    if (!salary || salary === "") return "Negotiable";
    if (salary.includes("-")) return `₹${salary}`;
    return `₹${salary}+`;
  };

  const hasActiveFilters = searchTerm || selectedLocation !== "All" || selectedType !== "All";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }

        .jobs-wrapper {
          background: #f8fafc;
          min-height: 100vh;
        }

        .hero-section {
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          padding: 64px 24px 80px;
        }

        .hero-container {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 50px;
          color: #10b981;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 40px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 17px;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .search-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .search-box {
          background: white;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
        }

        .search-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          font-size: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .search-select {
          padding: 14px 16px;
          font-size: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          outline: none;
          min-width: 140px;
          font-weight: 500;
        }

        .search-select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .clear-btn {
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: #f8fafc;
          color: #475569;
        }

        .stats-bar {
          max-width: 1200px;
          margin: -24px auto 40px;
          padding: 0 24px;
        }

        .stats-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          font-size: 14px;
        }

        .stat-item {
          color: #64748b;
        }

        .stat-value {
          font-weight: 600;
          color: #0f172a;
        }

        .stat-divider {
          color: #cbd5e1;
        }

        .verified-badge {
          margin-left: auto;
          color: #10b981;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .jobs-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .job-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .job-card:hover {
          border-color: #10b981;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
        }

        .job-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .job-tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tag-type {
          background: #d1fae5;
          color: #065f46;
        }

        .tag-live {
          background: #e0f2fe;
          color: #075985;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #0ea5e9;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .job-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 16px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .job-card:hover .job-title {
          color: #10b981;
        }

        .job-company {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .company-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .company-info {
          flex: 1;
          min-width: 0;
        }

        .company-name {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .company-verified {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #10b981;
          margin-top: 2px;
        }

        .job-meta {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #64748b;
          margin-bottom: 20px;
        }

        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .job-salary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .salary-amount {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .salary-period {
          font-size: 12px;
          color: #64748b;
        }

        .job-actions {
          display: flex;
          gap: 10px;
          padding-top: 8px;
        }

        .btn-view {
          flex: 1;
          background: #0f172a;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-view:hover {
          background: #10b981;
        }

        .btn-bookmark {
          width: 48px;
          height: 48px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-bookmark:hover {
          background: #f1f5f9;
          color: #10b981;
          border-color: #10b981;
        }

        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 80px 24px;
        }

        .state-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 24px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .state-title {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .state-description {
          font-size: 15px;
          color: #64748b;
          margin-bottom: 24px;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: #10b981;
          color: white;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action:hover {
          background: #059669;
        }

        .btn-action-secondary {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-action-secondary:hover {
          background: #e2e8f0;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .load-more {
          text-align: center;
          padding: 48px 24px;
        }

        .load-more-text {
          font-size: 14px;
          color: #94a3b8;
          margin-top: 12px;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 48px 16px 64px;
          }

          .hero-title {
            font-size: 32px;
          }

          .search-box {
            flex-direction: column;
          }

          .search-input-wrapper {
            min-width: 100%;
          }

          .search-select {
            width: 100%;
          }

          .jobs-grid {
            grid-template-columns: 1fr;
          }

          .stats-card {
            font-size: 13px;
            gap: 16px;
          }

          .verified-badge {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>

      <Navbar />

      <div className="jobs-wrapper">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-container">
            <div className="hero-badge">
              <Sparkles size={14} />
              {filteredJobs.length} open positions
            </div>
            <h1 className="hero-title">Find your next opportunity</h1>
            <p className="hero-subtitle">
              Discover verified roles from top companies — updated in real time
            </p>
          </div>

          {/* Search Box */}
          <div className="search-container">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Job title, company, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="search-select"
              >
                <option>All</option>
                {locations.map(loc => <option key={loc}>{loc}</option>)}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="search-select"
              >
                <option>All</option>
                {types.map(type => <option key={type}>{type}</option>)}
              </select>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="clear-btn">
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stats-card">
            <span className="stat-item">
              <span className="stat-value">{filteredJobs.length}</span> jobs
            </span>
            <span className="stat-divider">|</span>
            <span className="stat-item">
              <span className="stat-value">{locations.length}</span> locations
            </span>
            <span className="stat-divider">|</span>
            <span className="stat-item">
              <span className="stat-value">{types.length}</span> types
            </span>
            <span className="verified-badge">
              <CheckCircle size={14} />
              Verified employers
            </span>
          </div>
        </div>

        {/* Jobs Grid */}
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
              <p className="state-description">
                Ensure your backend is running and jobs are approved
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => window.location.reload()} className="btn-action">
                  Reload
                </button>
                <button onClick={() => fetchJobs(1, false)} className="btn-action btn-action-secondary">
                  Retry
                </button>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="state-icon">
                <Search size={32} color="#cbd5e1" />
              </div>
              <h3 className="state-title">No jobs match your search</h3>
              <p className="state-description">
                Try different keywords or clear your filters
              </p>
              <button onClick={resetFilters} className="btn-action">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job, index) => {
                const isLast = index === filteredJobs.length - 1;
                return (
                  <div
                    key={job._id}
                    ref={isLast ? lastJobRef : null}
                    className="job-card"
                  >
                    <div className="job-tags">
                      <span className="job-tag tag-type">{job.type}</span>
                      <span className="job-tag tag-live">
                        <span className="live-dot" />
                        Live
                      </span>
                    </div>

                    <h2 className="job-title">{job.title}</h2>

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

                    <div className="job-meta">
                      <div className="job-meta-item">
                        <MapPin size={14} />
                        {job.location}
                      </div>
                      <div className="job-meta-item">
                        <Users size={14} />
                        {job.skills?.length || 0} skills
                      </div>
                    </div>

                    {job.salary && (
                      <div className="job-salary">
                        <DollarSign size={20} color="#d97706" />
                        <div>
                          <span className="salary-amount">{formatSalary(job.salary)}</span>
                          <span className="salary-period"> / year</span>
                        </div>
                      </div>
                    )}

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