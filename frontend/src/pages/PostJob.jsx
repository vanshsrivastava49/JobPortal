import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PostJob = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "Full Time",
    description: "",
    skills: ""
  });

  const [loading, setLoading] = useState(false);
  const [linkedBusiness, setLinkedBusiness] = useState(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  // ✅ BULLETPROOF business check
  const checkLinkedBusiness = useCallback(() => {
    try {
      const businessId = user?.recruiterProfile?.linkedBusiness;
      if (businessId && businessId !== null && businessId !== undefined && businessId !== "") {
        setLinkedBusiness(businessId);
        return true;
      }
      setLinkedBusiness(null);
      return false;
    } catch (error) {
      console.error("Business check error:", error);
      setLinkedBusiness(null);
      return false;
    }
  }, [user]);

  // ✅ Real-time form validation
  const validateForm = useCallback(() => {
    const isValid = form.title.trim() && 
                   form.location.trim() && 
                   form.description.trim() && 
                   linkedBusiness && 
                   token;
    setSubmitDisabled(!isValid);
  }, [form, linkedBusiness, token]);

  // ✅ Effects
  useEffect(() => {
    checkLinkedBusiness();
  }, [checkLinkedBusiness]);

  useEffect(() => {
    validateForm();
  }, [form, linkedBusiness, token, validateForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ PERFECT submit handler - NO ERRORS
  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevent default form submit

    // ✅ Double-check validation
    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      toast.error("Please fill all required fields (*)");
      return;
    }

    if (!linkedBusiness) {
      toast.error("❌ Please link to a business first from Dashboard → Request Access");
      navigate("/dashboard");
      return;
    }

    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setLoading(true);

      const skills = form.skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const jobData = {
        title: form.title.trim(),
        company: form.company.trim() || "",
        location: form.location.trim(),
        salary: form.salary.trim() || "",
        type: form.type,
        description: form.description.trim(),
        skills // ✅ Backend handles array properly
      };

      console.log("📤 Posting job to backend:", jobData);

      const response = await axios.post(
        "http://localhost:5000/api/jobs",
        jobData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          timeout: 15000 // ✅ Longer timeout
        }
      );

      console.log("✅ Job created successfully:", response.data);
      
      toast.success("✅ Job created! Waiting for business owner approval...");
      
      // Reset form
      setForm({
        title: "",
        company: "",
        location: "",
        salary: "",
        type: "Full Time",
        description: "",
        skills: ""
      });

      // ✅ Smooth redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("❌ PostJob FULL ERROR:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        code: err.code
      });

      // ✅ PERFECT error handling - covers ALL cases
      if (err.code === 'ECONNABORTED') {
        toast.error("⏱️ Request timeout. Please check backend server.");
      } else if (!err.response) {
        toast.error("🚫 Backend server not responding (localhost:5000)");
      } else if (err.response.status === 400) {
        toast.error(err.response.data.message || "Please check your input data");
      } else if (err.response.status === 401) {
        toast.error("🔐 Please login again");
        localStorage.removeItem('token');
        navigate("/login");
      } else if (err.response.status === 403) {
        toast.error("❌ Not authorized. Verify recruiter role & business link.");
      } else if (err.response.status === 500) {
        toast.error("💥 Server error. Please contact support.");
      } else {
        toast.error(err.response.data?.message || `Error ${err.response.status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar title="Post a Job" />

      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-secondary mb-6"
          style={{ 
            padding: "10px 20px", 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 8 
          }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div
          style={{
            maxWidth: 900,
            margin: "0 auto 40px",
            padding: 30,
            borderRadius: 16,
            background: "white",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
          }}
        >
          <h2 style={{ marginBottom: 25, fontSize: 28, color: "#1f2937" }}>
            Create New Job Listing
          </h2>

          {/* Business Status */}
          {!linkedBusiness ? (
            <div style={{
              background: "#fef2f2",
              padding: 16,
              borderRadius: 12,
              border: "1px solid #fecaca",
              marginBottom: 25
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#fecaca", color: "#dc2626", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 20
                }}>
                  !
                </div>
                <div>
                  <strong style={{ color: "#dc2626" }}>Not linked to business</strong>
                  <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                    Link to approved business first from Dashboard → "Request Access"
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: "#f0fdf4",
              padding: 16,
              borderRadius: 12,
              border: "1px solid #bbf7d0",
              marginBottom: 25
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#dcfce7", color: "#166534", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  ✅
                </div>
                <div>
                  <strong style={{ color: "#166534" }}>Linked to business</strong>
                  <div style={{ fontSize: 14, color: "#4ade80" }}>
                    Job will be sent for business owner approval
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ FORM - Now with proper form element */}
          <form onSubmit={handleSubmit} className="form-grid" style={{ display: "grid", gap: 20 }}>
            {/* Job Title */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Job Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input"
                style={{
                  width: "100%", padding: "12px 16px", border: "1px solid #d1d5db",
                  borderRadius: 12, fontSize: 16, transition: "all 0.2s"
                }}
                placeholder="Frontend Developer"
                disabled={loading || !linkedBusiness}
                required
              />
            </div>

            {/* Company */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Company Name</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="input"
                style={{
                  width: "100%", padding: "12px 16px", border: "1px solid #d1d5db",
                  borderRadius: 12, fontSize: 16, transition: "all 0.2s"
                }}
                placeholder="Your Company Name"
                disabled={loading}
              />
            </div>

            {/* Location */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input"
                style={{
                  width: "100%", padding: "12px 16px", border: "1px solid #d1d5db",
                  borderRadius: 12, fontSize: 16, transition: "all 0.2s"
                }}
                placeholder="Bangalore / Remote"
                disabled={loading || !linkedBusiness}
                required
              />
            </div>

            {/* Salary */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Salary</label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                className="input"
                style={{
                  width: "100%", padding: "12px 16px", border: "1px solid #d1d5db",
                  borderRadius: 12, fontSize: 16, transition: "all 0.2s"
                }}
                placeholder="₹8–12 LPA"
                disabled={loading}
              />
            </div>

            {/* Job Type */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Job Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="input"
                style={{
                  width: "100%", padding: "12px 16px", border: "1px solid #d1d5db",
                  borderRadius: 12, fontSize: 16, background: "white"
                }}
                disabled={loading || !linkedBusiness}
                required
              >
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Internship</option>
                <option>Contract</option>
                <option>Remote</option>
              </select>
            </div>

            {/* Skills */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                Skills (comma separated)
              </label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="input"
                style={{
                  width: "100%", padding: "12px 16px", border: "1px solid #d1d5db",
                  borderRadius: 12, fontSize: 16, transition: "all 0.2s"
                }}
                placeholder="React, Node.js, MongoDB"
                disabled={loading || !linkedBusiness}
              />
            </div>

            {/* Description */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                Job Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                className="input"
                style={{
                  width: "100%", padding: "16px", border: "1px solid #d1d5db",
                  borderRadius: 12, fontSize: 16, fontFamily: "inherit",
                  resize: "vertical", minHeight: 120, transition: "all 0.2s"
                }}
                placeholder="Describe responsibilities, requirements, qualifications..."
                disabled={loading || !linkedBusiness}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit" // ✅ Changed from onClick to type="submit"
              disabled={loading || !linkedBusiness || submitDisabled}
              className="btn btn-primary"
              style={{
                gridColumn: "1 / -1",
                padding: "16px 32px",
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 12,
                background: (loading || !linkedBusiness || submitDisabled) ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                cursor: (loading || !linkedBusiness || submitDisabled) ? "not-allowed" : "pointer",
                opacity: (loading || !linkedBusiness || submitDisabled) ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="inline mr-2 animate-spin" size={24} />
                  Posting Job...
                </>
              ) : !linkedBusiness ? (
                "🔗 Link Business First"
              ) : submitDisabled ? (
                "⏳ Complete required fields"
              ) : (
                "✅ Post Job (Business Approval Required)"
              )}
            </button>
          </form>

          <p
            style={{
              marginTop: 25,
              color: "#6b7280",
              fontSize: 14,
              textAlign: "center",
              padding: "20px",
              background: "#f8fafc",
              borderRadius: 12
            }}
          >
            👉 Your job will be sent to the linked business owner for approval before going live.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
