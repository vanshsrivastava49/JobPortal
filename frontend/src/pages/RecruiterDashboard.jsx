import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import {
  Briefcase,
  Users,
  Eye,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Plus,
  AlertCircle,
  MapPin,
  DollarSign,
  Send,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [showDetails, setShowDetails] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [linkingBusiness, setLinkingBusiness] = useState(false);
  const [unlinkingBusiness, setUnlinkingBusiness] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const profileProgress = user?.profileProgress || 0;
  const isProfileComplete = user?.profileCompleted;
  const profile = user?.recruiterProfile || {};
  const linkedBusinessId = profile.linkedBusiness;
  const isLinkedToBusiness = !!linkedBusinessId;

  const fetchMyJobs = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingJobs(true);
      const res = await axios.get("http://localhost:5000/api/jobs/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = res.data?.jobs || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error("Jobs fetch error:", err);
      toast.error("Failed to load jobs");
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }, [token]);

  const fetchBusinesses = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingBusinesses(true);
      const res = await axios.get(
        "http://localhost:5000/api/profile/business/approved",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const businessesData = Array.isArray(res.data) ? res.data : [];
      setBusinesses(businessesData);
      if (businessesData.length === 0) {
        toast.error("No approved businesses available");
      }
    } catch (err) {
      console.error("Businesses fetch error:", err);
      setBusinesses([]);
      toast.error("Failed to load businesses");
    } finally {
      setLoadingBusinesses(false);
    }
  }, [token]);

  const fetchPendingRequests = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingRequests(true);
      const res = await axios.get(
        "http://localhost:5000/api/profile/recruiter/pending-requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests(res.data || []);
    } catch (err) {
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  const linkToBusiness = async (businessId) => {
    if (!token || !businessId) {
      toast.error("Missing token or business ID");
      return;
    }
    try {
      setLinkingBusiness(true);
      const response = await axios.post(
        "http://localhost:5000/api/profile/recruiter/request-business",
        { businessId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      if (response.data.status === "approved") {
        toast.success("Already linked to this business!");
      } else {
        toast.success("Request sent successfully!");
        toast("Business owner will review your request within 24 hours", {
          duration: 6000,
          icon: "⏰",
        });
      }
      setShowBusinessModal(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Request error:", err);
      const errorMsg = err.response?.data?.message || "Failed to send request";
      toast.error(errorMsg);
    } finally {
      setLinkingBusiness(false);
    }
  };

  const unlinkBusiness = async () => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      setUnlinkingBusiness(true);
      await axios.post(
        "http://localhost:5000/api/profile/recruiter/unlink-business",
        {},
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      toast.success("Business unlinked successfully");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Unlink error:", err);
      toast.error(err.response?.data?.message || "Failed to unlink business");
    } finally {
      setUnlinkingBusiness(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyJobs();
      fetchPendingRequests();
    }
  }, [fetchMyJobs, fetchPendingRequests, token]);

  const stats = [
    {
      icon: Briefcase,
      label: "Active Jobs",
      value: jobs.filter((j) => j.status === "approved").length,
      color: "#3b82f6",
    },
    {
      icon: Users,
      label: "Applications",
      value: "—",
      color: "#10b981",
    },
    {
      icon: Eye,
      label: "Profile Views",
      value: "—",
      color: "#8b5cf6",
    },
    {
      icon: Building2,
      label: "Business Status",
      value: isLinkedToBusiness
        ? "Linked"
        : pendingRequests.length > 0
        ? `${pendingRequests.length} Pending`
        : "Not Linked",
      color: isLinkedToBusiness
        ? "#10b981"
        : pendingRequests.length > 0
        ? "#f59e0b"
        : "#ef4444",
    },
  ];

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
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          margin-bottom: 32px;
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

        .alert-banner {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .alert-banner.warning {
          background: #fffbeb;
          border-color: #fde047;
        }

        .alert-banner.info {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .alert-banner.success {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .alert-description {
          font-size: 13px;
          color: #64748b;
        }

        .alert-action {
          flex-shrink: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
          line-height: 1;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .section-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
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
          border-radius: 6px;
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

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 6px;
          margin-top: 16px;
        }

        .detail-item-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .detail-item-value {
          font-size: 14px;
          color: #0f172a;
          font-weight: 500;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .job-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 16px;
          transition: all 0.2s;
        }

        .job-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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
          margin-bottom: 12px;
        }

        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .job-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .info-note {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #fef3c7;
          border: 1px solid #fde047;
          border-radius: 6px;
          font-size: 13px;
          color: #78350f;
          margin-top: 16px;
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

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 48px 24px;
          color: #64748b;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .modal-description {
          font-size: 13px;
          color: #64748b;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .business-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .business-card:hover {
          border-color: #cbd5e1;
        }

        .business-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .business-image {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .business-info {
          flex: 1;
        }

        .business-name {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .business-category {
          font-size: 13px;
          color: #64748b;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
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

          .action-group {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <Navbar />

      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="page-header">
            <h1 className="page-title">
              Welcome back, {user?.name?.split(" ")[0] || "Recruiter"}
            </h1>
            <p className="page-subtitle">
              Manage your jobs, track applications, and grow your talent network
            </p>
          </div>

          {!isProfileComplete && (
            <div className="alert-banner warning">
              <div className="alert-icon">
                <AlertCircle size={20} color="#f59e0b" />
              </div>
              <div className="alert-content">
                <div className="alert-title">
                  Complete Your Profile ({profileProgress}%)
                </div>
                <div className="alert-description">
                  Finish setting up your profile to unlock all features
                </div>
              </div>
              <div className="alert-action">
                <button
                  onClick={() => navigate("/complete-profile")}
                  className="btn btn-primary btn-sm"
                >
                  Complete Now
                </button>
              </div>
            </div>
          )}

          {pendingRequests.length > 0 && !isLinkedToBusiness && (
            <div className="alert-banner info">
              <div className="alert-icon">
                <Clock size={20} color="#3b82f6" />
              </div>
              <div className="alert-content">
                <div className="alert-title">
                  {pendingRequests.length} Business Request
                  {pendingRequests.length > 1 ? "s" : ""} Pending
                </div>
                <div className="alert-description">
                  Waiting for business owner approval
                </div>
              </div>
            </div>
          )}

          {!isLinkedToBusiness && isProfileComplete && (
            <div className="alert-banner warning">
              <div className="alert-icon">
                <AlertCircle size={20} color="#f59e0b" />
              </div>
              <div className="alert-content">
                <div className="alert-title">Request Access to Business</div>
                <div className="alert-description">
                  Connect with an approved business to start posting jobs
                </div>
              </div>
              <div className="alert-action">
                <button
                  onClick={() => {
                    setShowBusinessModal(true);
                    fetchBusinesses();
                  }}
                  disabled={loadingBusinesses}
                  className="btn btn-primary btn-sm"
                >
                  {loadingBusinesses ? (
                    <>
                      <Loader2 size={14} className="spinner" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Request Access
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {isLinkedToBusiness && (
            <div className="alert-banner success">
              <div className="alert-icon">
                <CheckCircle size={20} color="#10b981" />
              </div>
              <div className="alert-content">
                <div className="alert-title">Linked to Business</div>
                <div className="alert-description">
                  Ready to post jobs and manage applications
                </div>
              </div>
              <div className="alert-action">
                <button
                  onClick={unlinkBusiness}
                  disabled={unlinkingBusiness}
                  className="btn btn-secondary btn-sm"
                >
                  {unlinkingBusiness ? "Unlinking..." : "Change"}
                </button>
              </div>
            </div>
          )}

          <div className="stats-grid">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <Icon size={20} color={stat.color} />
                    </div>
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>

            <div className="action-group">
              <button
                onClick={() => navigate("/post-job")}
                disabled={!isProfileComplete || !isLinkedToBusiness}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Post New Job
              </button>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="btn btn-secondary"
              >
                <Eye size={16} />
                {showDetails ? "Hide Details" : "View Company Details"}
              </button>

              <button
                onClick={() => navigate("/complete-profile")}
                className="btn btn-secondary"
              >
                <Users size={16} />
                Update Profile
              </button>
            </div>

            {showDetails && (
              <div className="details-grid">
                <div>
                  <div className="detail-item-label">Company Name</div>
                  <div className="detail-item-value">
                    {profile.companyName || "—"}
                  </div>
                </div>
                <div>
                  <div className="detail-item-label">Website</div>
                  <div className="detail-item-value">
                    {profile.companyWebsite || "—"}
                  </div>
                </div>
                <div>
                  <div className="detail-item-label">Contact</div>
                  <div className="detail-item-value">
                    {profile.contactNumber || "—"}
                  </div>
                </div>
                <div>
                  <div className="detail-item-label">Location</div>
                  <div className="detail-item-value">
                    {profile.companyLocation || "—"}
                  </div>
                </div>
                <div>
                  <div className="detail-item-label">Industry</div>
                  <div className="detail-item-value">
                    {profile.industryType || "—"}
                  </div>
                </div>
              </div>
            )}

            <div className="info-note">
              <AlertCircle size={16} />
              <span>Jobs require business owner approval before going live</span>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">My Job Listings ({jobs.length})</h2>
            </div>

            {loadingJobs && (
              <div className="loading-state">
                <Loader2 size={20} className="spinner" />
                <span>Loading jobs...</span>
              </div>
            )}

            {!loadingJobs && jobs.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Briefcase size={28} color="#cbd5e1" />
                </div>
                <div className="empty-title">No jobs posted yet</div>
                <div className="empty-description">
                  {isLinkedToBusiness
                    ? "Post your first job to get started"
                    : "Link a business first to start posting jobs"}
                </div>
              </div>
            )}

            {!loadingJobs && jobs.length > 0 && (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job._id} className="job-card">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-meta">
                      <div className="job-meta-item">
                        <MapPin size={14} />
                        {job.location}
                      </div>
                      <div className="job-meta-item">
                        <Briefcase size={14} />
                        {job.type || job.jobType}
                      </div>
                      {job.salary && (
                        <div className="job-meta-item">
                          <DollarSign size={14} />
                          {job.salary}
                        </div>
                      )}
                    </div>
                    <div className="job-footer">
                      {job.status === "pending_business" && (
                        <span className="status-badge status-pending">
                          <Clock size={12} />
                          Business Review
                        </span>
                      )}
                      {job.status === "approved" && (
                        <span className="status-badge status-approved">
                          <CheckCircle size={12} />
                          Live
                        </span>
                      )}
                      {job.status === "rejected_business" && (
                        <span className="status-badge status-rejected">
                          <XCircle size={12} />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showBusinessModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowBusinessModal(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3 className="modal-title">Request Business Access</h3>
                  <p className="modal-description">
                    Select an approved business. Owner will review your request.
                  </p>
                </div>

                <div className="modal-body">
                  {loadingBusinesses ? (
                    <div className="loading-state">
                      <Loader2 size={20} className="spinner" />
                      <span>Loading businesses...</span>
                    </div>
                  ) : businesses.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Building2 size={28} color="#cbd5e1" />
                      </div>
                      <div className="empty-title">
                        No approved businesses found
                      </div>
                      <div className="empty-description">
                        Ask admin to approve businesses first
                      </div>
                    </div>
                  ) : (
                    businesses.map((biz) => (
                      <div
                        key={biz._id}
                        className={`business-card ${
                          selectedBusinessId === biz._id ? "selected" : ""
                        }`}
                        onClick={() =>
                          !linkingBusiness && setSelectedBusinessId(biz._id)
                        }
                      >
                        {biz.businessProfile?.images?.[0] && (
                          <img
                            src={biz.businessProfile.images[0]}
                            alt={biz.businessProfile.businessName}
                            className="business-image"
                          />
                        )}
                        <div className="business-info">
                          <div className="business-name">
                            {biz.businessProfile?.businessName ||
                              biz.name ||
                              "Unnamed Business"}
                          </div>
                          <div className="business-category">
                            {biz.businessProfile?.category || "Business"}
                          </div>
                        </div>
                        {selectedBusinessId === biz._id && (
                          <Check size={20} color="#3b82f6" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    onClick={() => setShowBusinessModal(false)}
                    disabled={linkingBusiness}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      selectedBusinessId && linkToBusiness(selectedBusinessId)
                    }
                    disabled={
                      !selectedBusinessId || loadingBusinesses || linkingBusiness
                    }
                    className="btn btn-primary"
                  >
                    {linkingBusiness ? (
                      <>
                        <Loader2 size={16} className="spinner" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecruiterDashboard;