import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import { Briefcase, Users, Eye, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [showDetails, setShowDetails] = useState(false);
  const [jobs, setJobs] = useState([]); // MUST always be array
  const [loadingJobs, setLoadingJobs] = useState(true);

  const profileProgress = user?.profileProgress || 0;
  const isProfileComplete = user?.profileCompleted;
  const profile = user?.recruiterProfile || {};

  /* ===========================
     FETCH RECRUITER JOBS
  =========================== */
  useEffect(() => {
    if (token) fetchMyJobs();
  }, [token]);

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/jobs/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ SAFE EXTRACTION
      const jobsData = res.data?.jobs || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.log("Jobs fetch error:", err);
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  /* ===========================
     STATUS BADGE COLOR
  =========================== */
  const statusColor = (status) => {
    if (status === "approved") return "green";
    if (status === "rejected") return "red";
    return "orange";
  };

  /* ===========================
     STATS
  =========================== */
  const stats = [
    {
      icon: Briefcase,
      label: "Active Jobs",
      value: jobs.length,
      color: "#2563eb",
    },
    {
      icon: Users,
      label: "Total Applications",
      value: "—",
      color: "#16a34a",
    },
    {
      icon: Eye,
      label: "Profile Views",
      value: "—",
      color: "#ea580c",
    },
    {
      icon: TrendingUp,
      label: "Hires This Month",
      value: "—",
      color: "#7c3aed",
    },
  ];

  return (
    <div>
      <Navbar title="Recruiter Dashboard" />

      <div className="container">
        <h2 style={{ marginBottom: 20, color: "#1f2937" }}>
          Welcome {user?.name || "Recruiter"}
        </h2>

        {/* PROFILE ALERT */}
        {!isProfileComplete && (
          <div
            style={{
              background: "#fff7ed",
              padding: 14,
              borderRadius: 10,
              marginBottom: 25,
              color: "#9a3412",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              Profile incomplete <b>({profileProgress}%)</b>.
            </div>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/complete-profile")}
            >
              Complete Now
            </button>
          </div>
        )}

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
            marginBottom: 30,
          }}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 12,
                    background: `${stat.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={28} color={stat.color} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#1f2937",
                    }}
                  >
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
          <h3 style={{ marginBottom: 15 }}>Quick Actions</h3>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "View Company Details"}
            </button>

            <button
              className="btn btn-primary"
              onClick={() =>
                isProfileComplete
                  ? navigate("/post-job")
                  : navigate("/complete-profile")
              }
            >
              Post New Job
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate("/complete-profile")}
            >
              Update Profile
            </button>
          </div>

          {/* COMPANY DETAILS */}
          {showDetails && (
            <div
              style={{
                marginTop: 20,
                padding: 15,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4>Company Details</h4>
              <p><b>Name:</b> {profile.companyName || "-"}</p>
              <p><b>Website:</b> {profile.companyWebsite || "-"}</p>
              <p><b>Contact:</b> {profile.contactNumber || "-"}</p>
              <p><b>Location:</b> {profile.companyLocation || "-"}</p>
              <p><b>Industry:</b> {profile.industryType || "-"}</p>
              <p><b>Description:</b> {profile.companyDescription || "-"}</p>

              {profile.companyLogo && (
                <img
                  src={profile.companyLogo}
                  alt="Company Logo"
                  style={{ width: 120, borderRadius: 8 }}
                />
              )}
            </div>
          )}

          <p style={{ marginTop: 15, color: "#6b7280" }}>
            Jobs require admin approval before going live.
          </p>
        </div>

        {/* MY JOBS */}
        <div className="card" style={{ marginTop: 25 }}>
          <h3>My Job Listings</h3>

          {loadingJobs && <p>Loading jobs...</p>}
          {!loadingJobs && jobs.length === 0 && <p>No jobs posted.</p>}

          {!loadingJobs &&
            Array.isArray(jobs) &&
            jobs.map((job) => (
              <div
                key={job._id}
                style={{
                  padding: 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <b>{job.title}</b>
                  <p style={{ fontSize: 14, color: "#6b7280" }}>
                    {job.location}
                  </p>
                </div>

                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: `${statusColor(job.status)}20`,
                    color: statusColor(job.status),
                    fontWeight: 600,
                  }}
                >
                  {job.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
