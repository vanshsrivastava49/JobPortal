import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import { Briefcase, Users, Eye, TrendingUp, Building2, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // States
  const [showDetails, setShowDetails] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [linkingBusiness, setLinkingBusiness] = useState(false);
  const [unlinkingBusiness, setUnlinkingBusiness] = useState(false);
  
  // ✅ FIXED: Pending requests state
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const profileProgress = user?.profileProgress || 0;
  const isProfileComplete = user?.profileCompleted;
  const profile = user?.recruiterProfile || {};
  const linkedBusinessId = profile.linkedBusiness;
  const isLinkedToBusiness = !!linkedBusinessId;

  // ✅ BETTER: Memoized fetch functions
  const fetchMyJobs = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingJobs(true);
      console.log("🔄 Fetching jobs...");
      const res = await axios.get("http://localhost:5000/api/jobs/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = res.data?.jobs || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      console.log("✅ Jobs loaded:", jobsData.length);
    } catch (err) {
      console.error("❌ Jobs fetch error:", err.response?.status, err.response?.data);
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
      console.log("🔄 Fetching approved businesses...");
      const res = await axios.get("http://localhost:5000/api/profile/business/approved", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const businessesData = Array.isArray(res.data) ? res.data : [];
      setBusinesses(businessesData);
      console.log("✅ Businesses loaded:", businessesData.length);
      
      if (businessesData.length === 0) {
        toast.error("No approved businesses available. Contact admin to approve businesses first.");
      }
    } catch (err) {
      console.error("❌ Businesses fetch error:", err.response?.status, err.response?.data);
      setBusinesses([]);
      toast.error("Failed to load businesses. Contact admin.");
    } finally {
      setLoadingBusinesses(false);
    }
  }, [token]);

  // 🔥 FIXED: fetchPendingRequests - CORRECT DATA STRUCTURE
  const fetchPendingRequests = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingRequests(true);
      console.log("🔄 Fetching pending requests...");
      const res = await axios.get("http://localhost:5000/api/profile/recruiter/pending-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // ✅ FIXED: Controller returns array directly, not {requests: []}
      setPendingRequests(res.data || []);
      console.log("✅ Pending requests loaded:", res.data?.length || 0);
    } catch (err) {
      console.log("No pending requests or error:", err.response?.status, err.response?.data);
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  // ✅ NEW approval workflow - Send REQUEST to business owner
  const linkToBusiness = async (businessId) => {
    if (!token || !businessId) {
      toast.error("Missing token or business ID");
      return;
    }

    try {
      setLinkingBusiness(true);
      console.log("🔗 REQUESTING business approval:", businessId);
      
      const response = await axios.post(
        "http://localhost:5000/api/profile/recruiter/request-business",
        { businessId },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );

      console.log("✅ Request response:", response.data);
      
      if (response.data.status === 'approved') {
        toast.success("✅ Already linked to this business! Ready to post jobs.");
      } else {
        toast.success("✅ Request sent successfully!");
        toast("Business owner will review your request within 24 hours", { 
          duration: 6000,
          style: { 
            background: "#fef3c7", 
            color: "#92400e",
            fontSize: "14px"
          }
        });
      }
      
      setShowBusinessModal(false);
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (err) {
      console.error("❌ Request error details:", err.response?.status, err.response?.data);
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
      console.log("🔗 Unlinking business...");
      
      await axios.post(
        "http://localhost:5000/api/profile/recruiter/unlink-business",
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      toast.success("✅ Business unlinked successfully");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("❌ Unlink error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to unlink business");
    } finally {
      setUnlinkingBusiness(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (token) {
      fetchMyJobs();
      fetchPendingRequests(); // ✅ FIXED
    }
  }, [fetchMyJobs, fetchPendingRequests, token]);

  const statusColor = (status) => {
    if (status === "approved") return "#10b981";
    if (status === "rejected_business") return "#ef4444";
    if (status === "pending_business") return "#f59e0b";
    return "#6b7280";
  };

  const stats = [
    {
      icon: Briefcase,
      label: "Active Jobs",
      value: jobs.filter(j => j.status === "approved").length,
      color: "#2563eb",
    },
    { icon: Users, label: "Total Applications", value: "—", color: "#16a34a" },
    { icon: Eye, label: "Profile Views", value: "—", color: "#ea580c" },
    {
      icon: Building2,
      label: "Linked Business",
      value: isLinkedToBusiness ? "✅ Yes" : pendingRequests.length > 0 ? `${pendingRequests.length} Pending` : "❌ No",
      color: isLinkedToBusiness ? "#10b981" : pendingRequests.length > 0 ? "#f59e0b" : "#ef4444",
    },
  ];

  return (
    <div>
      <Navbar title="Recruiter Dashboard" />

      <div className="container">
        <h2 style={{ marginBottom: 20, color: "#1f2937" }}>
          Welcome {user?.name || "Recruiter"}
        </h2>

        {/* DEBUG INFO - Remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div style={{ 
            background: "#fef3c7", 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 20, 
            fontSize: 12,
            color: "#92400e"
          }}>
            <strong>DEBUG:</strong> Profile: {isProfileComplete ? "✅ Complete" : `⏳ ${profileProgress}%`}, 
            Business: {isLinkedToBusiness ? "✅ Linked" : pendingRequests.length > 0 ? `⏳ ${pendingRequests.length}` : "❌ Not linked"}, 
            Token: {token ? "✅ Yes" : "❌ No"}
          </div>
        )}

        {/* PROFILE ALERT */}
        {!isProfileComplete && (
          <div style={{
            background: "#fff7ed",
            padding: 14,
            borderRadius: 10,
            marginBottom: 25,
            color: "#9a3412",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}>
            <div>Profile incomplete <b>({profileProgress}%)</b>.</div>
            <button className="btn btn-primary" onClick={() => navigate("/complete-profile")}>
              Complete Now
            </button>
          </div>
        )}

        {/* ✅ NEW: PENDING REQUESTS ALERT */}
        {pendingRequests.length > 0 && !isLinkedToBusiness && (
          <div style={{
            background: "#fef3c720",
            padding: 14,
            borderRadius: 10,
            marginBottom: 25,
            border: "1px solid #f59e0b40",
            color: "#92400e"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Clock size={20} />
              <div>
                <strong>{pendingRequests.length} Business Request(s) Pending</strong>
                <div style={{ fontSize: 14 }}>Waiting for business owner approval...</div>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS LINK ALERT */}
        {!isLinkedToBusiness && isProfileComplete && (
          <div style={{
            background: "#eff6ff",
            padding: 14,
            borderRadius: 10,
            marginBottom: 25,
            color: "#1e40af",
            border: "1px solid #93c5fd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}>
            <div>
              <strong>🚀 Request Access to Approved Business</strong>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                Send request to business owner for approval
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowBusinessModal(true);
                fetchBusinesses();
              }}
              disabled={loadingBusinesses}
            >
              {loadingBusinesses ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Loading...
                </>
              ) : (
                "Request Access"
              )}
            </button>
          </div>
        )}

        {/* LINKED BUSINESS DISPLAY */}
        {isLinkedToBusiness && (
          <div style={{
            background: "#dcfce7",
            padding: 14,
            borderRadius: 10,
            marginBottom: 25,
            border: "1px solid #bbf7d0",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Building2 size={20} color="#166534" />
                <div>
                  <div style={{ fontWeight: 600, color: "#166534" }}>
                    Linked to business ✅
                  </div>
                  <div style={{ fontSize: 14, color: "#4ade80" }}>
                    Ready to post jobs
                  </div>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: "8px 16px", fontSize: 14 }}
                onClick={unlinkBusiness}
                disabled={unlinkingBusiness}
              >
                {unlinkingBusiness ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Unlinking...
                  </>
                ) : (
                  "Change"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STATS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          marginBottom: 30,
        }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card" style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                padding: 20
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  background: `${stat.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon size={28} color={stat.color} />
                </div>
                <div>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#1f2937",
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 14, color: "#6b7280" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS */}
        <div className="card">
          <h3 style={{ marginBottom: 15, color: "#1f2937" }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "View Company Details"}
            </button>

            {isProfileComplete && isLinkedToBusiness ? (
              <button className="btn btn-primary" onClick={() => navigate("/post-job")}>
                Post New Job
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              >
                {pendingRequests.length > 0 
                  ? "Post New Job (Waiting business approval)" 
                  : "Post New Job (Complete profile & link business)"
                }
              </button>
            )}

            <button className="btn btn-secondary" onClick={() => navigate("/complete-profile")}>
              Update Profile
            </button>
          </div>

          {showDetails && (
            <div style={{
              marginTop: 20,
              padding: 20,
              background: "#f9fafb",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
            }}>
              <h4 style={{ marginBottom: 15, color: "#1f2937" }}>Company Details</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
                <p><strong>Name:</strong> {profile.companyName || "-"}</p>
                <p><strong>Website:</strong> {profile.companyWebsite || "-"}</p>
                <p><strong>Contact:</strong> {profile.contactNumber || "-"}</p>
                <p><strong>Location:</strong> {profile.companyLocation || "-"}</p>
                <p><strong>Industry:</strong> {profile.industryType || "-"}</p>
              </div>
            </div>
          )}

          <p style={{ marginTop: 15, color: "#6b7280", fontSize: 14 }}>
            👉 Jobs require business owner approval before going live.
          </p>
        </div>

        {/* MY JOBS */}
        <div className="card" style={{ marginTop: 25 }}>
          <h3 style={{ marginBottom: 20, color: "#1f2937" }}>
            My Job Listings ({jobs.length})
          </h3>

          {loadingJobs && (
            <div style={{ padding: 60, textAlign: "center" }}>
              <Loader2 size={48} className="animate-spin mx-auto mb-4 text-gray-400" />
              <p style={{ color: "#6b7280" }}>Loading jobs...</p>
            </div>
          )}
          
          {!loadingJobs && jobs.length === 0 && (
            <div style={{ padding: 60, textAlign: "center", color: "#6b7280" }}>
              <Briefcase size={64} style={{ marginBottom: 16, opacity: 0.5, display: "block", margin: "0 auto" }} />
              <h4 style={{ color: "#374151" }}>No jobs posted yet</h4>
              <p>{isLinkedToBusiness ? "Post your first job!" : "Link a business first!"}</p>
            </div>
          )}

          {!loadingJobs && Array.isArray(jobs) && jobs.map((job) => (
            <div key={job._id} style={{
              padding: 20,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              marginBottom: 15,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 15,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "#1f2937" }}>
                  {job.title}
                </div>
                <div style={{ fontSize: 14, color: "#64748b" }}>
                  {job.location} • {job.type || job.jobType} {job.salary && `• ${job.salary}`}
                </div>
              </div>
              <span style={{
                padding: "8px 16px",
                borderRadius: 20,
                background: `${statusColor(job.status)}15`,
                color: statusColor(job.status),
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: "nowrap",
              }}>
                {job.status === "pending_business" && "⏳ Business Review"}
                {job.status === "approved" && "✅ Live"}
                {job.status === "rejected_business" && "❌ Rejected"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BUSINESS SELECTION MODAL - UPDATED */}
      {showBusinessModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setShowBusinessModal(false)}>
          <div style={{
            background: "white",
            borderRadius: 12,
            width: "90vw",
            maxWidth: 600,
            maxHeight: "80vh",
            overflow: "hidden",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
          }} onClick={e => e.stopPropagation()}>
            
            {/* MODAL HEADER */}
            <div style={{ padding: 24, borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: 0, color: "#1f2937" }}>Request Business Access</h3>
              <p style={{ margin: "8px 0 0 0", color: "#6b7280" }}>
                Select approved business. Owner will review your request.
              </p>
            </div>

            {/* BUSINESS LIST */}
            <div style={{ maxHeight: 400, overflowY: "auto", padding: 20 }}>
              {loadingBusinesses ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Loader2 size={48} className="animate-spin mx-auto mb-4 text-gray-400" />
                  <p>Loading approved businesses...</p>
                </div>
              ) : businesses.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Building2 size={48} style={{ opacity: 0.5, marginBottom: 12, display: "block", margin: "0 auto" }} />
                  <p style={{ color: "#ef4444", fontWeight: 500 }}>No approved businesses found</p>
                  <p style={{ fontSize: 14, color: "#6b7280" }}>
                    Ask admin to approve businesses first via Admin → Pending Businesses
                  </p>
                </div>
              ) : (
                businesses.map((biz) => (
                  <div
                    key={biz._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 15,
                      padding: 16,
                      marginBottom: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: selectedBusinessId === biz._id ? "#f0f9ff" : "white",
                      transition: "all 0.2s",
                      opacity: linkingBusiness ? 0.7 : 1
                    }}
                    onClick={() => !linkingBusiness && setSelectedBusinessId(biz._id)}
                  >
                    {biz.businessProfile?.images?.[0] && (
                      <img
                        src={biz.businessProfile.images[0]}
                        alt={biz.businessProfile?.businessName}
                        style={{
                          width: 56,
                          height: 56,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #e5e7eb"
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>
                        {biz.businessProfile?.businessName || biz.name || "Unnamed Business"}
                      </div>
                      <div style={{ fontSize: 14, color: "#64748b" }}>
                        {biz.businessProfile?.category || "Business"}
                      </div>
                    </div>
                    {selectedBusinessId === biz._id && (
                      <CheckCircle size={24} color="#10b981" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* MODAL FOOTER */}
            <div style={{ 
              padding: 20, 
              borderTop: "1px solid #e5e7eb", 
              display: "flex", 
              gap: 12, 
              justifyContent: "flex-end" 
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowBusinessModal(false)}
                disabled={linkingBusiness}
                style={{ padding: "10px 20px" }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => selectedBusinessId && linkToBusiness(selectedBusinessId)}
                disabled={!selectedBusinessId || loadingBusinesses || linkingBusiness}
                style={{ 
                  padding: "10px 24px",
                  opacity: selectedBusinessId && !linkingBusiness ? 1 : 0.6
                }}
              >
                {linkingBusiness ? (
                  <>
                    <Loader2 className="animate-spin mr-2 inline" size={16} />
                    Sending Request...
                  </>
                ) : (
                  "Send Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
