import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/common/Navbar";
import { 
  Building2, Users, Eye, TrendingUp, Briefcase, CheckCircle, Clock, XCircle, Loader2, UserPlus 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const BusinessOwnerDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  // Job states - FIXED API ENDPOINT
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showJobs, setShowJobs] = useState(false);

  // Recruiter approval states
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [showRecruiters, setShowRecruiters] = useState(false);

  const images = user?.businessProfile?.images || [];
  const isProfileComplete = user?.profileCompleted;
  const businessStatus = user?.businessProfile?.status || "pending";

  const stats = [
    { 
      icon: Building2, 
      label: "Active Listings", 
      value: businessStatus === "approved" ? "1" : "0", 
      color: "#2563eb" 
    },
    { icon: Users, label: "Total Views", value: "0", color: "#16a34a" },
    { icon: Eye, label: "Profile Views", value: "0", color: "#ea580c" },
    { 
      icon: TrendingUp, 
      label: "Jobs This Month", 
      value: "0", 
      color: "#7c3aed" 
    },
  ];

  // 🔥 FIXED: Correct API endpoint from job.routes.js
  const fetchPendingJobs = useCallback(async () => {
    if (!token || businessStatus !== "approved") {
      console.log("❌ Cannot fetch jobs - no token or business not approved");
      return;
    }

    console.log("🔍 BusinessOwnerDashboard - Fetching pending jobs for:", user?._id);
    
    try {
      setLoadingJobs(true);
      
      const res = await axios.get("http://localhost:5000/api/jobs/pending", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      });

      console.log("✅ BusinessOwnerDashboard JOBS RESPONSE:", res.data);
      
      // ✅ Handle both response formats (controller vs route)
      const jobsData = res.data.jobs || res.data || [];
      setPendingJobs(jobsData);
      
      if (jobsData.length > 0) {
        console.log(`✅ Found ${jobsData.length} pending jobs in dashboard`);
      }
      
    } catch (err) {
      console.error("❌ BusinessOwnerDashboard fetchPendingJobs ERROR:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setPendingJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }, [token, businessStatus, user?._id]);

  // Fetch pending recruiter requests
  const fetchPendingRecruiters = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingRecruiters(true);
      console.log("🔄 Fetching pending recruiters...");
      const res = await axios.get("http://localhost:5000/api/profile/business/pending-recruiters", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRecruiters(res.data || []);
      console.log("✅ Pending recruiters loaded:", res.data?.length);
    } catch (err) {
      console.log("No pending recruiters or error:", err);
      setPendingRecruiters([]);
    } finally {
      setLoadingRecruiters(false);
    }
  }, [token]);

  // Approve recruiter request
  const approveRecruiter = async (requestId) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/profile/business/approve-recruiter/${requestId}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✅ ${res.data.recruiter?.name || 'Recruiter'} approved! Can now post jobs.`);
      fetchPendingRecruiters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  // Reject recruiter request
  const rejectRecruiter = async (requestId, recruiterName) => {
    try {
      const reason = prompt(`Why are you rejecting ${recruiterName}? (Optional)`);
      await axios.patch(
        `http://localhost:5000/api/profile/business/reject-recruiter/${requestId}`, 
        { reason: reason || "No reason provided" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("❌ Recruiter request rejected");
      fetchPendingRecruiters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    }
  };

  // 🔥 FIXED: Correct job approval endpoints from job.routes.js
  const approveJob = async (jobId) => {
    try {
      console.log("✅ Approving job:", jobId);
      await axios.patch(`http://localhost:5000/api/jobs/approve/${jobId}`, {
        status: 'approved'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("✅ Job approved & LIVE!");
      fetchPendingJobs(); // Refresh immediately
    } catch (err) {
      console.error("❌ Job approval error:", err.response?.data);
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  const rejectJob = async (jobId) => {
    try {
      console.log("❌ Rejecting job:", jobId);
      await axios.patch(`http://localhost:5000/api/jobs/reject/${jobId}`, {
        status: 'rejected_business'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("❌ Job rejected");
      fetchPendingJobs(); // Refresh immediately
    } catch (err) {
      console.error("❌ Job rejection error:", err.response?.data);
      toast.error(err.response?.data?.message || "Rejection failed");
    }
  };

  // Load data on mount + auto-refresh
  useEffect(() => {
    console.log("🎯 BusinessOwnerDashboard mounted - Business ID:", user?._id);
    if (token && businessStatus === "approved") {
      fetchPendingJobs();
      fetchPendingRecruiters();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        console.log("🔄 Auto-refreshing dashboard data...");
        fetchPendingJobs();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [token, businessStatus, fetchPendingJobs, fetchPendingRecruiters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Business Owner Dashboard" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h2 style={{ marginBottom: "20px", color: "#1f2937", fontSize: "32px", fontWeight: "700" }}>
          Welcome {user?.name || "Business Owner"}
        </h2>

        {/* PROFILE REMINDER */}
        {!isProfileComplete && (
          <div style={{
            background: "#fff7ed",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "24px",
            color: "#9a3412",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #fed7aa"
          }}>
            <span style={{ fontWeight: 500 }}>
              <strong>⚠️ Profile Incomplete</strong> - Complete to unlock full features
            </span>
            <button
              className="btn btn-primary"
              style={{ padding: "10px 24px", fontWeight: 600 }}
              onClick={() => navigate("/complete-profile")}
            >
              Complete Now
            </button>
          </div>
        )}

        {/* STATUS BADGE */}
        <div style={{ marginBottom: 32 }}>
          <span style={{
            padding: "12px 24px",
            borderRadius: 24,
            fontSize: 16,
            fontWeight: 600,
            background: businessStatus === "approved" ? "#dcfce7" : "#fef3c7",
            color: businessStatus === "approved" ? "#166534" : "#92400e",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            {businessStatus === "approved" ? "✅ Approved & Live" : "⏳ Pending Admin Approval"}
          </span>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card" style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "28px",
                borderRadius: "20px",
                background: "white",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                border: "1px solid #f1f5f9"
              }}>
                <div style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "16px",
                  background: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 20px ${stat.color}30`
                }}>
                  <Icon size={32} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: "32px", fontWeight: "800", color: "#1f2937", marginBottom: 4 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "16px", color: "#6b7280", fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS */}
        <div className="card" style={{ 
          marginBottom: 40, 
          padding: "32px", 
          borderRadius: "20px",
          background: "white",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          border: "1px solid #f1f5f9"
        }}>
          <h3 style={{ marginBottom: "24px", color: "#1f2937", fontSize: "24px", fontWeight: "700" }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/complete-profile")}
              disabled={isProfileComplete}
              style={{ padding: "16px 32px", fontSize: "16px", fontWeight: 600 }}
            >
              {isProfileComplete ? "Update Listing" : "Add Business Listing"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/businesses")}
              style={{ padding: "16px 32px", fontSize: "16px" }}
            >
              View Public Listing
            </button>
            <button className="btn btn-secondary" style={{ padding: "16px 32px", fontSize: "16px" }}>
              View Leads
            </button>
          </div>
        </div>

        {/* 🔥 PENDING RECRUITERS SECTION */}
        {businessStatus === "approved" && (
          <div className="card" style={{ marginBottom: 40 }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px solid #e5e7eb"
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: "24px", 
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
                gap: 12
              }}>
                <UserPlus size={28} />
                Recruiter Access Requests ({pendingRecruiters.length})
                {pendingRecruiters.length > 0 && (
                  <span style={{ 
                    background: "#fef3c720", 
                    color: "#f59e0b", 
                    padding: "6px 16px", 
                    borderRadius: 20, 
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                    {pendingRecruiters.length} pending
                  </span>
                )}
              </h3>
              <button 
                className="btn btn-secondary" 
                onClick={() => { 
                  setShowRecruiters(!showRecruiters); 
                  if (!showRecruiters) fetchPendingRecruiters(); 
                }}
                style={{ padding: "12px 24px" }}
              >
                {showRecruiters ? "Hide" : "Show"} Requests
              </button>
            </div>

            {showRecruiters && (
              <>
                {loadingRecruiters ? (
                  <div style={{ textAlign: "center", padding: 60 }}>
                    <Loader2 size={40} className="animate-spin mx-auto mb-6 text-blue-500" />
                    <p style={{ color: "#6b7280", fontSize: 18 }}>Loading recruiter requests...</p>
                  </div>
                ) : pendingRecruiters.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 80 }}>
                    <UserPlus size={64} style={{ opacity: 0.5, marginBottom: 20, display: "block", margin: "0 auto" }} />
                    <p style={{ color: "#6b7280", fontSize: 20, marginBottom: 8 }}>No pending recruiter requests</p>
                    <p style={{ fontSize: 16, color: "#9ca3af" }}>
                      Recruiters will request access to post jobs for your business here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 24 }}>
                    {pendingRecruiters.map((request) => (
                      <div key={request._id} style={{
                        padding: 32,
                        border: "1px solid #e5e7eb",
                        borderRadius: 20,
                        background: "white",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
                      }}>
                        {/* Recruiter card content remains same */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: "24px", color: "#1f2937", fontWeight: 700 }}>
                              {request.recruiter?.recruiterProfile?.companyName || request.recruiter?.name || "Unnamed Recruiter"}
                            </h4>
                            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                              <span style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#fef3c720",
                                color: "#f59e0b",
                                padding: "10px 16px",
                                borderRadius: 24,
                                fontSize: 15,
                                fontWeight: 600
                              }}>
                                <Clock size={20} />
                                Requested {new Date(request.requestedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
                          <div>
                            <p style={{ marginBottom: 12 }}><strong>Recruiter:</strong> {request.recruiter?.name}</p>
                            <p style={{ marginBottom: 12 }}><strong>Email:</strong> {request.recruiter?.email}</p>
                            {request.recruiter?.recruiterProfile?.companyWebsite && (
                              <p><strong>Website:</strong> {request.recruiter.recruiterProfile.companyWebsite}</p>
                            )}
                          </div>
                          <div>
                            {request.recruiter?.recruiterProfile?.companyLocation && (
                              <p style={{ marginBottom: 12 }}><strong>Location:</strong> {request.recruiter.recruiterProfile.companyLocation}</p>
                            )}
                            {request.recruiter?.recruiterProfile?.industryType && (
                              <p><strong>Industry:</strong> {request.recruiter.recruiterProfile.industryType}</p>
                            )}
                          </div>
                        </div>

                        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 24 }}>
                          <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => rejectRecruiter(request._id, request.recruiter?.name)}
                              style={{ padding: "16px 32px", fontWeight: 600 }}
                            >
                              <XCircle size={20} style={{ marginRight: 8 }} />
                              Reject
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() => approveRecruiter(request._id)}
                              style={{ padding: "16px 40px", fontWeight: 600 }}
                            >
                              <CheckCircle size={20} style={{ marginRight: 8 }} />
                              Approve Access
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 🔥 FIXED PENDING JOBS SECTION */}
        {businessStatus === "approved" && (
          <div className="card" style={{ marginBottom: 40 }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px solid #e5e7eb"
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: "24px", 
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
                gap: 12
              }}>
                <Briefcase size={28} />
                Job Approvals ({pendingJobs.length})
                {pendingJobs.length > 0 && (
                  <span style={{ 
                    background: "#ef444420", 
                    color: "#dc2626", 
                    padding: "6px 16px", 
                    borderRadius: 20, 
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                    {pendingJobs.length} pending
                  </span>
                )}
                {pendingJobs.length > 0 && (
                  <span style={{ fontSize: 14, color: "#059669", fontWeight: 500 }}>
                    Business ID: {user?._id?.slice(-6)}
                  </span>
                )}
              </h3>
              <button 
                className="btn btn-secondary" 
                onClick={() => { 
                  setShowJobs(!showJobs); 
                  if (!showJobs) fetchPendingJobs(); 
                }}
                style={{ padding: "12px 24px" }}
              >
                {showJobs ? "Hide" : "🔄 Refresh & Show"} Jobs
              </button>
            </div>

            {showJobs && (
              <>
                {loadingJobs ? (
                  <div style={{ textAlign: "center", padding: 80 }}>
                    <Loader2 size={48} className="animate-spin mx-auto mb-6 text-blue-500" />
                    <p style={{ color: "#6b7280", fontSize: 20 }}>Loading pending jobs...</p>
                    <p style={{ fontSize: 16, color: "#9ca3af", marginTop: 8 }}>
                      Looking for jobs with status "pending_business"
                    </p>
                  </div>
                ) : pendingJobs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 80 }}>
                    <Briefcase size={64} style={{ opacity: 0.5, marginBottom: 24, display: "block", margin: "0 auto" }} />
                    <h3 style={{ color: "#6b7280", fontSize: 24, marginBottom: 12 }}>No pending job approvals</h3>
                    <p style={{ fontSize: 16, color: "#9ca3af", maxWidth: 400, margin: "0 auto" }}>
                      Recruiters who've been approved can post jobs here for your review.
                      <br/>
                      <strong>Business ID:</strong> {user?._id?.slice(-6)} | <strong>Status filter:</strong> pending_business
                    </p>
                    <button 
                      onClick={fetchPendingJobs}
                      className="btn btn-primary"
                      style={{ marginTop: 24, padding: "16px 32px" }}
                    >
                      🔄 Check Again
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 24 }}>
                    {pendingJobs.map((job) => (
                      <div key={job._id} style={{
                        padding: 32,
                        border: "1px solid #e5e7eb",
                        borderRadius: 20,
                        background: "white",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: "28px", color: "#1f2937", fontWeight: 700 }}>
                              {job.title}
                            </h4>
                            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
                              <span style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#fef3c720",
                                color: "#f59e0b",
                                padding: "12px 20px",
                                borderRadius: 24,
                                fontSize: 16,
                                fontWeight: 600
                              }}>
                                <Clock size={22} />
                                Pending Your Approval
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
                          <div>
                            <p style={{ marginBottom: 16, fontSize: 16 }}><strong>📍 Location:</strong> {job.location}</p>
                            <p style={{ marginBottom: 16, fontSize: 16 }}><strong>💼 Type:</strong> {job.type || job.jobType}</p>
                            {job.salary && (
                              <p style={{ fontSize: 16 }}><strong>💰 Salary:</strong> {job.salary}</p>
                            )}
                          </div>
                          <div>
                            <p style={{ marginBottom: 16, fontSize: 16 }}><strong>👤 Posted by:</strong> {job.recruiter?.name || "Unknown"}</p>
                            {job.recruiter?.recruiterProfile?.companyName && (
                              <p style={{ fontSize: 16 }}><strong>🏢 Company:</strong> {job.recruiter.recruiterProfile.companyName}</p>
                            )}
                          </div>
                        </div>

                        {job.skills?.length > 0 && (
                          <div style={{ marginBottom: 32 }}>
                            <p style={{ marginBottom: 16, fontSize: 18, fontWeight: 600, color: "#374151" }}>
                              🛠️ Required Skills:
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                              {job.skills.map((skill, i) => (
                                <span
                                  key={i}
                                  style={{
                                    padding: "8px 20px",
                                    background: "#e0e7ff",
                                    color: "#4338ca",
                                    borderRadius: 20,
                                    fontWeight: 500,
                                    fontSize: 15
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ marginBottom: 32 }}>
                          <p style={{ marginBottom: 20, color: "#6b7280", fontSize: 16 }}>
                            <strong>📝 Description:</strong>
                          </p>
                          <p style={{ 
                            fontSize: 16, 
                            lineHeight: 1.7, 
                            color: "#374151",
                            padding: "24px",
                            background: "#f8fafc",
                            borderRadius: 16,
                            borderLeft: "4px solid #3b82f6"
                          }}>
                            {job.description?.substring(0, 300)}...
                          </p>
                        </div>

                        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 24 }}>
                          <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => rejectJob(job._id)}
                              style={{ 
                                padding: "18px 40px", 
                                fontSize: 16,
                                fontWeight: 600 
                              }}
                            >
                              <XCircle size={22} style={{ marginRight: 10 }} />
                              Reject Job
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() => approveJob(job._id)}
                              style={{ 
                                padding: "18px 48px", 
                                fontSize: 16,
                                fontWeight: 600 
                              }}
                            >
                              <CheckCircle size={22} style={{ marginRight: 10 }} />
                              Approve & Go Live
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* BUSINESS IMAGES */}
        <div className="card" style={{ padding: "32px", borderRadius: "20px" }}>
          <h3 style={{ marginBottom: 24, fontSize: "24px", color: "#1f2937" }}>Your Business Images</h3>
          {images.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: 18 }}>No images uploaded yet.</p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: "20px"
            }}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="business"
                  onClick={() => window.open(img, "_blank")}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "16px",
                    cursor: "pointer",
                    border: "2px solid #e5e7eb",
                    transition: "all 0.3s",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.02)";
                    e.target.style.boxShadow = "0 16px 48px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessOwnerDashboard;
