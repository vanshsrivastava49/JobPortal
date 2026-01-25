import React, { useState } from "react";
import { Shield, Loader, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { verifyOTP } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const VerifyOtp = ({ email, onBack }) => {
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("job_seeker");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const roleMap = {
    jobseeker: "jobseeker",
    recruiter: "recruiter",
    business: "business",
    admin: "admin",
  };

  // 🔥 ROLE → DASHBOARD ROUTE
  const redirectMap = {
    jobseeker: "/job-seeker",
    recruiter: "/employer",
    business: "/business",
    admin: "/admin",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const backendRole = roleMap[role];
    if (!backendRole) {
      toast.error("Invalid role selected");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOTP(
        email,
        otp,
        backendRole,
        mobile,
        "login"
      );

      if (response.success) {
        toast.success("Verification successful!");
        login(response.user, response.token);
        navigate(redirectMap[response.user.role] || "/dashboard");
      } else {
        toast.error(response.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 20px" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#6b7280",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <ArrowLeft size={20} style={{ marginRight: "8px" }} />
        Back
      </button>

      <h2
        style={{
          marginBottom: "10px",
          color: "#1f2937",
          fontSize: "28px",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        Verify Your Email
      </h2>

      <p
        style={{
          marginBottom: "30px",
          color: "#6b7280",
          fontSize: "16px",
          textAlign: "center",
        }}
      >
        We've sent a 6-digit code to {email}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label className="label">Enter OTP</label>
          <div style={{ position: "relative" }}>
            <Shield
              size={20}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              disabled={loading}
              style={{
                paddingLeft: "45px",
                letterSpacing: "5px",
                fontSize: "18px",
                textAlign: "center",
              }}
            />
          </div>
        </div>

        {/* ROLE */}
        <div style={{ marginBottom: "20px" }}>
          <label className="label">Select Your Role</label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="jobseeker">Job Seeker</option>
            <option value="recruiter">Employer</option>
            <option value="business">Business Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* MOBILE */}
        <div style={{ marginBottom: "30px" }}>
          <label className="label">Mobile Number (Optional)</label>
          <input
            type="tel"
            className="input"
            placeholder="+91 9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", padding: "12px" }}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader
                size={20}
                style={{
                  marginRight: "8px",
                  animation: "spin 1s linear infinite",
                }}
              />
              Verifying...
            </>
          ) : (
            "Verify & Continue"
          )}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
