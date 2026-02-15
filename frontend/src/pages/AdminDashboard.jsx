import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/common/Navbar";
import { 
  Users, Briefcase, Building, TrendingUp, CheckCircle, 
  Clock, XCircle, Eye, RefreshCw, Loader2, Search,
  UserCheck, MapPin, Mail, Calendar, ArrowUpRight
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
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, jobs, businesses
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);

      // Fetch in parallel
      const [
        usersRes,
        liveJobsRes,
        approvedBizRes,
        pendingBizRes
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        
        axios.get(`${API_BASE_URL}/api/jobs/public`).catch(() => ({ data: { jobs: [] } })),
        
        axios.get(`${API_BASE_URL}/api/profile/business/approved`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        
        axios.get(`${API_BASE_URL}/api/profile/business/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      // Process users data
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      setUsers(usersData);

      // Process jobs data
      const jobsData = liveJobsRes.data.jobs || [];
      setLiveJobs(jobsData);

      // Process businesses data
      const approvedBizData = Array.isArray(approvedBizRes.data) ? approvedBizRes.data : [];
      const pendingBizData = Array.isArray(pendingBizRes.data) ? pendingBizRes.data : [];
      
      setBusinesses(approvedBizData);
      setPendingBusinesses(pendingBizData);

      // Calculate stats
      const jobseekerCount = usersData.filter(u => u.role === 'jobseeker').length;
      const recruiterCount = usersData.filter(u => u.role === 'recruiter').length;
      const businessCount = usersData.filter(u => u.role === 'business').length;
      
      setStats({
        totalUsers: usersData.length,
        jobseekers: jobseekerCount,
        recruiters: recruiterCount,
        businesses: businessCount,
        liveJobs: jobsData.length,
        pendingJobs: 0, // You can add endpoint for this
        pendingBusinesses: pendingBizData.length,
        approvedBusinesses: approvedBizData.length
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

  // Filter data based on search
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      subtitle: `${stats.jobseekers} seekers, ${stats.recruiters} recruiters`
    },
    { 
      icon: Briefcase, 
      label: "Live Jobs", 
      value: stats.liveJobs, 
      color: "#10b981",
      subtitle: "Active job listings"
    },
    { 
      icon: Building, 
      label: "Total Businesses", 
      value: stats.approvedBusinesses + stats.pendingBusinesses, 
      color: "#f59e0b",
      subtitle: `${stats.approvedBusinesses} approved, ${stats.pendingBusinesses} pending`
    },
    { 
      icon: TrendingUp, 
      label: "Platform Growth", 
      value: "+12%", 
      color: "#8b5cf6",
      subtitle: "This month"
    },
  ];

  // Role badge helper
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

  // Status badge helper
  const getStatusBadge = (status) => {
    const styles = {
      approved: { bg: "#d1fae5", color: "#065f46", icon: <CheckCircle size={14} /> },
      pending: { bg: "#fef3c7", color: "#92400e", icon: <Clock size={14} /> },
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

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: white;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
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

        .business-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
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
                <div key={i} className="stat-card">
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
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users ({stats.totalUsers})
            </button>
            <button 
              className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              Live Jobs ({stats.liveJobs})
            </button>
            <button 
              className={`tab-button ${activeTab === 'businesses' ? 'active' : ''}`}
              onClick={() => setActiveTab('businesses')}
            >
              Businesses ({stats.approvedBusinesses + stats.pendingBusinesses})
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <TrendingUp size={20} />
                  Platform Overview
                </h2>
              </div>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "20px" 
              }}>
                <div style={{ 
                  padding: "20px", 
                  background: "#eff6ff", 
                  borderRadius: "12px",
                  border: "1px solid #bfdbfe"
                }}>
                  <div style={{ fontSize: "14px", color: "#1e40af", marginBottom: "8px" }}>
                    Job Seekers
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "#1e3a8a" }}>
                    {stats.jobseekers}
                  </div>
                </div>

                <div style={{ 
                  padding: "20px", 
                  background: "#fef3c7", 
                  borderRadius: "12px",
                  border: "1px solid #fde047"
                }}>
                  <div style={{ fontSize: "14px", color: "#92400e", marginBottom: "8px" }}>
                    Recruiters
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "#78350f" }}>
                    {stats.recruiters}
                  </div>
                </div>

                <div style={{ 
                  padding: "20px", 
                  background: "#d1fae5", 
                  borderRadius: "12px",
                  border: "1px solid #6ee7b7"
                }}>
                  <div style={{ fontSize: "14px", color: "#065f46", marginBottom: "8px" }}>
                    Business Owners
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "#064e3b" }}>
                    {stats.businesses}
                  </div>
                </div>

                <div style={{ 
                  padding: "20px", 
                  background: "#fae8ff", 
                  borderRadius: "12px",
                  border: "1px solid #e9d5ff"
                }}>
                  <div style={{ fontSize: "14px", color: "#6b21a8", marginBottom: "8px" }}>
                    Pending Approvals
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "#581c87" }}>
                    {stats.pendingBusinesses}
                  </div>
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
                filteredBusinesses.map((biz) => (
                  <div key={biz._id} className="business-card">
                    <div className="business-header">
                      <div>
                        <div className="business-name">
                          {biz.businessProfile?.businessName || biz.name}
                        </div>
                        <div className="business-category">
                          {biz.businessProfile?.category || "Uncategorized"}
                        </div>
                      </div>
                      {getStatusBadge(biz.businessProfile?.status || 'pending')}
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
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;