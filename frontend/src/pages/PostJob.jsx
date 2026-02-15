import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

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

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [linkedBusiness, setLinkedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [checkingBusiness, setCheckingBusiness] = useState(true);

  // ✅ Enhanced business check with API call
  const checkLinkedBusiness = useCallback(async () => {
    try {
      setCheckingBusiness(true);
      
      // First check from user object
      const businessId = user?.recruiterProfile?.linkedBusiness;
      
      if (!businessId) {
        setLinkedBusiness(null);
        setBusinessDetails(null);
        return;
      }

      // Fetch detailed business information
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/profile/recruiter/linked-business-details`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        );

        if (response.data.success && response.data.linked) {
          setLinkedBusiness(businessId);
          setBusinessDetails(response.data.business);
          
          // Pre-fill company name from business
          setForm(prev => ({
            ...prev,
            company: response.data.business.name || prev.company
          }));
        } else {
          setLinkedBusiness(null);
          setBusinessDetails(null);
        }
      } catch (apiError) {
        // If API fails, still use businessId from user object
        console.log("Using cached business link");
        setLinkedBusiness(businessId);
      }

    } catch (error) {
      console.error("Business check error:", error);
      setLinkedBusiness(null);
      setBusinessDetails(null);
    } finally {
      setCheckingBusiness(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (token && user) {
      checkLinkedBusiness();
    } else {
      setCheckingBusiness(false);
    }
  }, [checkLinkedBusiness, token, user]);

  // ✅ Inline validation function
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = "Job title is required";
        } else if (value.trim().length < 3) {
          errors.title = "Job title must be at least 3 characters";
        } else if (value.trim().length > 100) {
          errors.title = "Job title must be less than 100 characters";
        }
        break;

      case 'location':
        if (!value.trim()) {
          errors.location = "Location is required";
        } else if (value.trim().length < 2) {
          errors.location = "Location must be at least 2 characters";
        }
        break;

      case 'description':
        if (!value.trim()) {
          errors.description = "Job description is required";
        } else if (value.trim().length < 50) {
          errors.description = `Description must be at least 50 characters (${value.trim().length}/50)`;
        } else if (value.trim().length > 5000) {
          errors.description = "Description must be less than 5000 characters";
        }
        break;

      default:
        break;
    }

    return errors;
  };

  // ✅ Real-time form validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ✅ Validate entire form before submission
  const validateForm = () => {
    const errors = {};

    // Validate title
    const titleErrors = validateField('title', form.title);
    if (Object.keys(titleErrors).length > 0) {
      Object.assign(errors, titleErrors);
    }

    // Validate location
    const locationErrors = validateField('location', form.location);
    if (Object.keys(locationErrors).length > 0) {
      Object.assign(errors, locationErrors);
    }

    // Validate description
    const descriptionErrors = validateField('description', form.description);
    if (Object.keys(descriptionErrors).length > 0) {
      Object.assign(errors, descriptionErrors);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Enhanced error handling function
  const handleApiError = (err) => {
    console.error("❌ API Error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      code: err.code
    });

    // Timeout errors
    if (err.code === 'ECONNABORTED') {
      toast.error("⏱️ Request timeout. Server is taking too long to respond.", {
        duration: 5000
      });
      return;
    }

    // Network errors (no response)
    if (!err.response) {
      toast.error("🚫 Cannot connect to server. Please check if backend is running.", {
        duration: 6000
      });
      return;
    }

    const status = err.response.status;
    const data = err.response.data || {};
    const errorMessage = data.message;

    // Handle specific status codes
    switch (status) {
      case 400:
        toast.error(errorMessage || "⚠️ Invalid data. Please check your input.", {
          duration: 4000
        });
        break;

      case 401:
        toast.error("🔐 Session expired. Please login again.", {
          duration: 4000
        });
        localStorage.removeItem('token');
        setTimeout(() => navigate("/login"), 1500);
        break;

      case 403:
        if (data.code === 'NO_BUSINESS_LINK') {
          toast.error("🔗 Please link to an approved business first.", {
            duration: 5000
          });
          setTimeout(() => navigate("/dashboard"), 2000);
        } else if (data.code === 'BUSINESS_NOT_APPROVED') {
          toast.error("⏳ Your linked business is not approved yet.", {
            duration: 5000
          });
        } else {
          toast.error(errorMessage || "❌ You don't have permission for this action.", {
            duration: 4000
          });
        }
        break;

      case 404:
        toast.error("🔍 Resource not found. Please try again.", {
          duration: 4000
        });
        break;

      case 409:
        toast.error(errorMessage || "⚡ This action conflicts with existing data.", {
          duration: 4000
        });
        break;

      case 500:
        toast.error("💥 Server error. Please try again later or contact support.", {
          duration: 5000
        });
        break;

      default:
        toast.error(errorMessage || `❌ Error ${status}. Please try again.`, {
          duration: 4000
        });
    }
  };

  // ✅ Success toast helper
  const showSuccess = (message) => {
    toast.success(message, {
      duration: 3000,
      icon: '🎉',
      style: {
        background: '#D1FAE5',
        color: '#065F46',
        border: '1px solid #6EE7B7',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  };

  // ✅ Enhanced submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Validate form
    if (!validateForm()) {
      toast.error("⚠️ Please fix the errors in the form", {
        duration: 4000
      });
      // Scroll to first error
      const firstErrorField = Object.keys(formErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Step 2: Check business link
    if (!linkedBusiness) {
      toast.error("🔗 Please link to an approved business first from your dashboard.", {
        duration: 5000
      });
      setTimeout(() => navigate("/dashboard"), 2000);
      return;
    }

    // Step 3: Check token
    if (!token) {
      toast.error("🔐 Please login again");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Prepare job data
      const skills = form.skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const jobData = {
        title: form.title.trim(),
        company: form.company.trim() || businessDetails?.name || "",
        location: form.location.trim(),
        salary: form.salary.trim() || "",
        type: form.type,
        description: form.description.trim(),
        skills
      };

      console.log("📤 Submitting job:", jobData);

      const response = await axios.post(
        `${API_BASE_URL}/api/jobs`,
        jobData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );

      console.log("✅ Job created:", response.data);

      // Show success message
      showSuccess(
        response.data.message || "Job created successfully! Awaiting business approval."
      );

      // Reset form
      setForm({
        title: "",
        company: businessDetails?.name || "",
        location: "",
        salary: "",
        type: "Full Time",
        description: "",
        skills: ""
      });
      setFormErrors({});

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state while checking business
  if (checkingBusiness) {
    return (
      <div>
        <Navbar title="Post a Job" />
        <div className="container" style={{ 
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
            Verifying business link...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Check if form has required fields filled
  const isFormValid = () => {
    const hasTitle = form.title.trim().length >= 3;
    const hasLocation = form.location.trim().length >= 2;
    const hasDescription = form.description.trim().length >= 50;
    const noErrors = Object.keys(formErrors).length === 0;
    
    return hasTitle && hasLocation && hasDescription && noErrors;
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <Navbar title="Post a Job" />

      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-secondary"
          style={{ 
            padding: "10px 20px", 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 8,
            marginBottom: 24,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: 32,
            borderRadius: 16,
            background: "white",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          }}
        >
          <h2 style={{ marginBottom: 8, fontSize: 28, color: "#111827", fontWeight: 700 }}>
            Create New Job Listing
          </h2>
          <p style={{ marginBottom: 32, fontSize: 16, color: "#6b7280" }}>
            Post a job opportunity for your business
          </p>

          {/* Business Status Banner */}
          {!linkedBusiness ? (
            <div style={{
              background: "#fef2f2",
              padding: 16,
              borderRadius: 12,
              border: "2px solid #fca5a5",
              marginBottom: 32,
              display: "flex",
              alignItems: "start",
              gap: 12
            }}>
              <XCircle size={24} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#991b1b", display: "block", marginBottom: 4, fontSize: 16 }}>
                  Not Linked to Business
                </strong>
                <p style={{ fontSize: 14, color: "#7f1d1d", marginBottom: 12 }}>
                  You must be linked to an approved business before posting jobs.
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Go to Dashboard →
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: "#f0fdf4",
              padding: 16,
              borderRadius: 12,
              border: "2px solid #86efac",
              marginBottom: 32,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <CheckCircle2 size={24} style={{ color: "#16a34a", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#166534", display: "block", marginBottom: 2, fontSize: 16 }}>
                  Linked to {businessDetails?.name || "Business"}
                </strong>
                <p style={{ fontSize: 14, color: "#15803d" }}>
                  Job will be sent for business owner approval before going live
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 24 }}>
            {/* Job Title */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: "#374151"
              }}>
                Job Title <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                style={{
                  width: "100%", 
                  padding: "12px 16px", 
                  border: formErrors.title ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: 8, 
                  fontSize: 16,
                  background: formErrors.title ? "#fef2f2" : "white",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                placeholder="e.g. Senior Frontend Developer"
                disabled={loading || !linkedBusiness}
              />
              {formErrors.title && (
                <p style={{ 
                  marginTop: 6, 
                  fontSize: 13, 
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <AlertCircle size={14} />
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: "#374151"
              }}>
                Company Name
              </label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                style={{
                  width: "100%", 
                  padding: "12px 16px", 
                  border: "1px solid #d1d5db",
                  borderRadius: 8, 
                  fontSize: 16,
                  outline: "none",
                  transition: "all 0.2s",
                  background: businessDetails ? "#f9fafb" : "white",
                  cursor: businessDetails ? "not-allowed" : "text"
                }}
                placeholder="Your company name"
                disabled={loading}
                readOnly={!!businessDetails}
              />
              {businessDetails && (
                <p style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                  ✓ Auto-filled from your business profile
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: "#374151"
              }}>
                Location <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                style={{
                  width: "100%", 
                  padding: "12px 16px", 
                  border: formErrors.location ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: 8, 
                  fontSize: 16,
                  background: formErrors.location ? "#fef2f2" : "white",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                placeholder="e.g. Bangalore, India / Remote"
                disabled={loading || !linkedBusiness}
              />
              {formErrors.location && (
                <p style={{ 
                  marginTop: 6, 
                  fontSize: 13, 
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <AlertCircle size={14} />
                  {formErrors.location}
                </p>
              )}
            </div>

            {/* Salary */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: "#374151"
              }}>
                Salary Range
              </label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                style={{
                  width: "100%", 
                  padding: "12px 16px", 
                  border: "1px solid #d1d5db",
                  borderRadius: 8, 
                  fontSize: 16,
                  outline: "none",
                  transition: "all 0.2s"
                }}
                placeholder="e.g. ₹8-12 LPA or $80k-$120k"
                disabled={loading}
              />
            </div>

            {/* Job Type */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: "#374151"
              }}>
                Job Type <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={{
                  width: "100%", 
                  padding: "12px 16px", 
                  border: "1px solid #d1d5db",
                  borderRadius: 8, 
                  fontSize: 16,
                  background: "white",
                  outline: "none",
                  cursor: "pointer"
                }}
                disabled={loading || !linkedBusiness}
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Skills */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: "#374151"
              }}>
                Required Skills
              </label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                style={{
                  width: "100%", 
                  padding: "12px 16px", 
                  border: "1px solid #d1d5db",
                  borderRadius: 8, 
                  fontSize: 16,
                  outline: "none",
                  transition: "all 0.2s"
                }}
                placeholder="e.g. React, Node.js, MongoDB (comma separated)"
                disabled={loading || !linkedBusiness}
              />
              <p style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                Enter skills separated by commas
              </p>
            </div>

            {/* Description */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontWeight: 600,
                fontSize: 14,
                color: "#374151"
              }}>
                Job Description <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={8}
                style={{
                  width: "100%", 
                  padding: "12px 16px", 
                  border: formErrors.description ? "2px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: 8, 
                  fontSize: 16,
                  fontFamily: "inherit",
                  background: formErrors.description ? "#fef2f2" : "white",
                  resize: "vertical",
                  minHeight: 150,
                  outline: "none",
                  transition: "all 0.2s"
                }}
                placeholder="Describe the role, responsibilities, requirements, and qualifications..."
                disabled={loading || !linkedBusiness}
              />
              {formErrors.description && (
                <p style={{ 
                  marginTop: 6, 
                  fontSize: 13, 
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <AlertCircle size={14} />
                  {formErrors.description}
                </p>
              )}
              <p style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                {form.description.length} characters (minimum 50 required)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !linkedBusiness || !isFormValid()}
              style={{
                width: "100%",
                padding: "16px 32px",
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 8,
                background: (loading || !linkedBusiness || !isFormValid()) ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                cursor: (loading || !linkedBusiness || !isFormValid()) ? "not-allowed" : "pointer",
                opacity: (loading || !linkedBusiness || !isFormValid()) ? 0.7 : 1,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Posting Job...
                </>
              ) : !linkedBusiness ? (
                "🔗 Link to Business First"
              ) : !isFormValid() ? (
                "⏳ Complete Required Fields"
              ) : (
                "✅ Post Job for Approval"
              )}
            </button>
          </form>

          {/* Info Box */}
          <div style={{
            marginTop: 24,
            padding: 16,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            display: "flex",
            alignItems: "start",
            gap: 12
          }}>
            <AlertCircle size={20} style={{ color: "#1e40af", flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 14, color: "#1e3a8a" }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Approval Process</p>
              <p>
                Your job listing will be sent to the business owner for approval.
                Once approved, it will be visible to job seekers on the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;