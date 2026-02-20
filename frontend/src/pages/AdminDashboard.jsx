import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/common/Navbar";
import { 
  Users, Briefcase, Building, TrendingUp, CheckCircle, 
  Clock, XCircle, Eye, RefreshCw, Loader2, Search,
  UserCheck, MapPin, Mail, Calendar, ArrowUpRight, ShieldOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    jobseekers: 0,
    recruiters: 0,
    businesses: 0,
    liveJobs: 0,
    pendingJobs: 0,
    pendingBusinesses: 0,
    approvedBusinesses: 0
  });

  // Data State
  const [users, setUsers] = useState([]);
  const [liveJobs, setLiveJobs] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [revokingId, setRevokingId] = useState(null);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, liveJobsRes, approvedBizRes, pendingBizRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`, { headers })
          .catch(() => ({ data: {} })),
        axios.get(`${API_BASE_URL}/api/admin/users`, { headers })
          .catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/jobs/public`)
          .catch(() => ({ data: { jobs: [] } })),
        axios.get(`${API_BASE_URL}/api/profile/business/approved`, { headers })
          .catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/profile/business/pending`, { headers })
          .catch(() => ({ data: [] }))
      ]);

      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      setUsers(usersData);

      const jobsData = liveJobsRes.data?.jobs || [];
      setLiveJobs(jobsData);

      const approvedBizData = Array.isArray(approvedBizRes.data) ? approvedBizRes.data : [];
      const pendingBizData = Array.isArray(pendingBizRes.data) ? pendingBizRes.data : [];
      setBusinesses(approvedBizData);
      setPendingBusinesses(pendingBizData);

      const statsFromApi = statsRes.data || {};
      setStats({
        totalUsers:         statsFromApi.totalUsers        ?? usersData.length,
        jobseekers:         statsFromApi.jobseekers        ?? usersData.filter(u => u.role === 'jobseeker').length,
        recruiters:         statsFromApi.recruiters        ?? usersData.filter(u => u.role === 'recruiter').length,
        businesses:         statsFromApi.businesses        ?? usersData.filter(u => u.role === 'business').length,
        liveJobs:           statsFromApi.liveJobs          ?? jobsData.length,
        pendingJobs:        statsFromApi.pendingJobs       ?? 0,
        pendingBusinesses:  statsFromApi.pendingBusinesses ?? pendingBizData.length,
        approvedBusinesses: statsFromApi.approvedBusinesses ?? approvedBizData.length
      });

    } catch (err) {
      console.error("Fetch data error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Revoke Handler ────────────────────────────────────────────────────────
  const handleRevokeBusiness = async (bizId, bizName) => {
    if (!window.confirm(
      `Revoke verification for "${bizName}"?\n\nThis will:\n• Reset their status back to pending\n• Disconnect all linked recruiters\n• Require them to re-apply for approval`
    )) return;

    try {
      setRevokingId(bizId);
      await axios.patch(
        `${API_BASE_URL}/api/admin/businesses/${bizId}/revoke`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`"${bizName}" verification revoked successfully`);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke business");
    } finally {
      setRevokingId(null);
    }
  };

  // Filter data based on search
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredJobs = liveJobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBusinesses = [...businesses, ...pendingBusinesses].filter(biz =>
    biz.businessProfile?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    biz.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats cards data
  const statsCards = [
    { 
      icon: Users, 
      label: "Total Users", 
      value: stats.totalUsers, 
      color: "#3b82f6",
      subtitle: `${stats.jobseekers} seekers · ${stats.recruiters} recruiters · ${stats.businesses} businesses`,
      tab: 'users'
    },
    { 
      icon: Briefcase, 
      label: "Live Jobs", 
      value: stats.liveJobs, 
      color: "#10b981",
      subtitle: `${stats.pendingJobs} pending approval`,
      tab: 'jobs'
    },
    { 
      icon: Building, 
      label: "Total Businesses", 
      value: stats.approvedBusinesses + stats.pendingBusinesses, 
      color: "#f59e0b",
      subtitle: `${stats.approvedBusinesses} approved · ${stats.pendingBusinesses} pending`,
      tab: 'businesses'
    },
    { 
      icon: Clock, 
      label: "Pending Approvals", 
      value: stats.pendingBusinesses, 
      color: "#ef4444",
      subtitle: "Businesses awaiting review",
      tab: 'businesses'
    },
  ];

  const getRoleBadge = (role) => {
    const styles = {
      jobseeker: { bg: "#dbeafe", color: "#1e40af", label: "Job Seeker" },
      recruiter: { bg: "#fef3c7", color: "#92400e", label: "Recruiter" },
      business: { bg: "#d1fae5", color: "#065f46", label: "Business" },
      admin: { bg: "#f3e8ff", color: "#6b21a8", label: "Admin" }
    };
    const style = styles[role] || styles.jobseeker;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600"
      }}>
        {style.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: { bg: "#d1fae5", color: "#065f46", icon: <CheckCircle size={14} /> },
      pending:  { bg: "#fef3c7", color: "#92400e", icon: <Clock size={14} /> },
      rejected: { bg: "#fee2e2", color: "#991b1b", icon: <XCircle size={14} /> }
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px"
      }}>
        {style.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center"
        }}>
          <Loader2 
            className="animate-spin" 
            size={48} 
            style={{ color: "#3b82f6", marginBottom: 16 }} 
          />
          <p style={{ fontSize: 18, color: "#6b7280" }}>
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

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

        .dashboard-wrapper {
          background: #f8fafc;
          min-height: 100vh;
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          margin-bottom: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 15px;
          color: #64748b;
          font-weight: 400;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .stat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .stat-subtitle {
          font-size: 12px;
          color: #94a3b8;
        }

        .tabs-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px;
          margin-bottom: 24px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tab-button {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
          color: #64748b;
        }

        .tab-button.active {
          background: #3b82f6;
          color: white;
        }

        .tab-button:hover:not(.active) {
          background: #f1f5f9;
        }

        .section-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-box {
          position: relative;
          max-width: 400px;
          width: 100%;
        }

        .search-input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .action-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          outline: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-secondary {
          background: white;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-danger {
          background: white;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .btn-danger:hover:not(:disabled) {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .data-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          color: #0f172a;
        }

        .data-table tr:hover {
          background: #f8fafc;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .user-email {
          font-size: 13px;
          color: #64748b;
        }

        .job-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }

        .job-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .job-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #64748b;
        }

        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .business-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }

        .business-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .business-card.approved {
          border-left: 4px solid #10b981;
        }

        .business-card.pending {
          border-left: 4px solid #f59e0b;
        }

        .business-card.rejected {
          border-left: 4px solid #ef4444;
        }

        .business-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .business-name {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .business-category {
          font-size: 13px;
          color: #64748b;
        }

        .business-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .revoke-banner {
          margin-top: 12px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 13px;
          color: #991b1b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 48px 24px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .empty-description {
          font-size: 14px;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
          }

          .page-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .data-table {
            font-size: 12px;
          }

          .data-table th,
          .data-table td {
            padding: 8px;
          }
        }
      `}</style>

      <Navbar />

      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">
                Monitor and manage all platform activities
              </p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={fetchAllData}
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {statsCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card" onClick={() => setActiveTab(stat.tab)}>
                  <div className="stat-header">
                    <div className="stat-icon">
                      <Icon size={24} color={stat.color} />
                    </div>
                    <ArrowUpRight size={20} color="#94a3b8" />
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-subtitle">{stat.subtitle}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>

            <div className="action-group">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/admin/pending-businesses")}
              >
                <Building size={16} />
                Approve Businesses ({stats.pendingBusinesses})
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('users')}
              >
                <Users size={16} />
                View All Users ({stats.totalUsers})
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('jobs')}
              >
                <Briefcase size={16} />
                View All Jobs ({stats.liveJobs})
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('businesses')}
              >
                <Building size={16} />
                View All Businesses ({stats.approvedBusinesses + stats.pendingBusinesses})
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            {[
              { key: 'overview',    label: 'Overview' },
              { key: 'users',       label: `Users (${stats.totalUsers})` },
              { key: 'jobs',        label: `Live Jobs (${stats.liveJobs})` },
              { key: 'businesses',  label: `Businesses (${stats.approvedBusinesses + stats.pendingBusinesses})` },
            ].map(tab => (
              <button
                key={tab.key}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* User Breakdown */}
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">
                    <Users size={20} />
                    User Breakdown
                  </h2>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('users')}>
                    View All Users
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {[
                    { label: "Job Seekers",     value: stats.jobseekers, bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", dark: "#1e3a8a", icon: "🎯", role: "jobseeker" },
                    { label: "Recruiters",      value: stats.recruiters, bg: "#fef3c7", border: "#fde047", text: "#92400e", dark: "#78350f", icon: "💼", role: "recruiter" },
                    { label: "Business Owners", value: stats.businesses, bg: "#d1fae5", border: "#6ee7b7", text: "#065f46", dark: "#064e3b", icon: "🏢", role: "business" },
                    { label: "Total Platform",  value: stats.totalUsers, bg: "#f3e8ff", border: "#e9d5ff", text: "#6b21a8", dark: "#581c87", icon: "📊", role: null }
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => item.role && setActiveTab('users')}
                      style={{
                        padding: "24px",
                        background: item.bg,
                        borderRadius: "12px",
                        border: `1px solid ${item.border}`,
                        cursor: item.role ? "pointer" : "default",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{item.icon}</div>
                      <div style={{ fontSize: "13px", color: item.text, marginBottom: "6px", fontWeight: "600" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "40px", fontWeight: "700", color: item.dark, lineHeight: 1 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Summary */}
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">
                    <TrendingUp size={20} />
                    Platform Summary
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {[
                    { label: "Live Jobs",          value: stats.liveJobs,           bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", icon: "✅" },
                    { label: "Pending Jobs",        value: stats.pendingJobs,        bg: "#fefce8", border: "#fef08a", text: "#a16207", icon: "⏳" },
                    { label: "Approved Businesses", value: stats.approvedBusinesses, bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", icon: "🏆" },
                    { label: "Pending Businesses",  value: stats.pendingBusinesses,  bg: "#fef2f2", border: "#fecaca", text: "#dc2626", icon: "🔔" },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "20px",
                      background: item.bg,
                      borderRadius: "12px",
                      border: `1px solid ${item.border}`,
                    }}>
                      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{item.icon}</div>
                      <div style={{ fontSize: "12px", color: item.text, marginBottom: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "36px", fontWeight: "700", color: item.text, lineHeight: 1 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <Users size={20} />
                  All Users ({filteredUsers.length})
                </h2>
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Filter Pills */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {[
                  { key: 'all',       label: `All (${stats.totalUsers})`,         bg: "#f1f5f9", active: "#0f172a" },
                  { key: 'jobseeker', label: `Job Seekers (${stats.jobseekers})`,  bg: "#dbeafe", active: "#1e40af" },
                  { key: 'recruiter', label: `Recruiters (${stats.recruiters})`,   bg: "#fef3c7", active: "#92400e" },
                  { key: 'business',  label: `Businesses (${stats.businesses})`,   bg: "#d1fae5", active: "#065f46" },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setRoleFilter(f.key)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      background: roleFilter === f.key ? f.bg : "#f8fafc",
                      color: roleFilter === f.key ? f.active : "#64748b",
                      outline: roleFilter === f.key ? `2px solid ${f.active}` : "none",
                      transition: "all 0.15s"
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredUsers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Users size={28} color="#cbd5e1" />
                  </div>
                  <div className="empty-title">No users found</div>
                  <div className="empty-description">
                    {searchTerm ? "Try a different search term" : "No users registered yet"}
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.slice(0, 50).map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="user-details">
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{getRoleBadge(user.role)}</td>
                          <td>
                            {user.profileCompleted ? (
                              <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle size={14} />
                                Complete
                              </span>
                            ) : (
                              <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Clock size={14} />
                                Incomplete
                              </span>
                            )}
                          </td>
                          <td style={{ color: "#64748b", fontSize: "13px" }}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button 
                              className="btn btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "13px" }}
                              onClick={() => toast("User details coming soon")}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <Briefcase size={20} />
                  Live Jobs ({filteredJobs.length})
                </h2>
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Briefcase size={28} color="#cbd5e1" />
                  </div>
                  <div className="empty-title">No jobs found</div>
                  <div className="empty-description">
                    {searchTerm ? "Try a different search term" : "No jobs posted yet"}
                  </div>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job._id} className="job-card">
                    <div className="job-title">{job.title}</div>
                    <div className="job-meta">
                      <div className="job-meta-item">
                        <Building size={14} />
                        {job.company}
                      </div>
                      <div className="job-meta-item">
                        <MapPin size={14} />
                        {job.location}
                      </div>
                      <div className="job-meta-item">
                        <Briefcase size={14} />
                        {job.type}
                      </div>
                      {job.salary && (
                        <div className="job-meta-item">
                          💰 {job.salary}
                        </div>
                      )}
                      <div className="job-meta-item">
                        <Calendar size={14} />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Businesses Tab */}
          {activeTab === 'businesses' && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <Building size={20} />
                  All Businesses ({filteredBusinesses.length})
                </h2>
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px", fontSize: "13px", color: "#64748b" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, background: "#10b981", display: "inline-block" }} />
                  Approved
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, background: "#f59e0b", display: "inline-block" }} />
                  Pending
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, background: "#ef4444", display: "inline-block" }} />
                  Rejected
                </span>
              </div>

              {filteredBusinesses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Building size={28} color="#cbd5e1" />
                  </div>
                  <div className="empty-title">No businesses found</div>
                  <div className="empty-description">
                    {searchTerm ? "Try a different search term" : "No businesses registered yet"}
                  </div>
                </div>
              ) : (
                filteredBusinesses.map((biz) => {
                  const status = biz.businessProfile?.status || 'pending';
                  const bizName = biz.businessProfile?.businessName || biz.name;
                  const isRevoking = revokingId === biz._id;

                  return (
                    <div key={biz._id} className={`business-card ${status}`}>
                      <div className="business-header">
                        <div>
                          <div className="business-name">{bizName}</div>
                          <div className="business-category">
                            {biz.businessProfile?.category || "Uncategorized"}
                          </div>
                        </div>

                        <div className="business-actions">
                          {getStatusBadge(status)}

                          {/* Revoke button — only for approved businesses */}
                          {status === 'approved' && (
                            <button
                              className="btn btn-danger"
                              style={{ padding: "6px 12px", fontSize: "13px" }}
                              disabled={isRevoking}
                              onClick={() => handleRevokeBusiness(biz._id, bizName)}
                            >
                              {isRevoking ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <ShieldOff size={14} />
                              )}
                              {isRevoking ? "Revoking..." : "Revoke"}
                            </button>
                          )}
                        </div>
                      </div>

                      {biz.businessProfile?.address && (
                        <div style={{ 
                          fontSize: "13px", 
                          color: "#64748b", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "6px",
                          marginBottom: "8px"
                        }}>
                          <MapPin size={14} />
                          {biz.businessProfile.address}
                        </div>
                      )}

                      {biz.businessProfile?.contactDetails && (
                        <div style={{ 
                          fontSize: "13px", 
                          color: "#64748b", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "6px"
                        }}>
                          <Mail size={14} />
                          {biz.businessProfile.contactDetails}
                        </div>
                      )}

                      {/* Info banner shown after revoke (status just changed to pending) */}
                      {status === 'pending' && biz.businessProfile?.verified === false && (
                        <div className="revoke-banner">
                          <ShieldOff size={14} />
                          Verification revoked — awaiting re-approval from business
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;