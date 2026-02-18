import React, { useState } from "react";
import { Shield, Loader, ArrowLeft, User } from "lucide-react";
import toast from "react-hot-toast";
import { verifyOTP } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignupVerifyOtp = ({ email, onBack }) => {
  const [otp,       setOtp]       = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [role,      setRole]      = useState("jobseeker");
  const [mobile,    setMobile]    = useState("");
  const [loading,   setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const roleMap = {
    jobseeker: "jobseeker",
    recruiter: "recruiter",
    business:  "business",
    admin:     "admin",
  };

  const redirectMap = {
    jobseeker: "/jobseeker",
    recruiter: "/recruiter",
    business:  "/business",
    admin:     "/admin",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validation ──────────────────────────────────────────────
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    // Combine for backend — backend stores as `name` on the User root field
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    setLoading(true);

    try {
      const res = await verifyOTP(
  email,
  otp,
  roleMap[role],
  mobile,
  firstName.trim(),   // ← separate
  lastName.trim(),    // ← separate
  "signup"
);

      if (res.success) {
        toast.success("Account created successfully");

        login(
          {
            ...res.user,
            name:      fullName,          // full name in auth context
            firstName: firstName.trim(),  // available for pre-filling CompleteProfile
            lastName:  lastName.trim(),
          },
          res.token
        );

        navigate(redirectMap[res.user.role]);
      } else {
        toast.error(res.message || "Signup failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={onBack} className="link">
        <ArrowLeft size={18} /> Back
      </button>

      <form onSubmit={handleSubmit}>

        <label>OTP</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Shield
            size={18}
            style={{ position: "absolute", left: 10, top: 13, color: "#9ca3af" }}
          />
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="000000"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>
              First Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <User
                size={16}
                style={{ position: "absolute", left: 10, top: 13, color: "#9ca3af" }}
              />
              <input
                className="input"
                style={{ paddingLeft: 36 }}
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>
              Last Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <User
                size={16}
                style={{ position: "absolute", left: 10, top: 13, color: "#9ca3af" }}
              />
              <input
                className="input"
                style={{ paddingLeft: 36 }}
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── ROLE ─────────────────────────────────────────────── */}
        <label>Role</label>
        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <option value="jobseeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
          <option value="business">Business Owner</option>
          <option value="admin">Admin</option>
        </select>

        {/* ── MOBILE ───────────────────────────────────────────── */}
        <label>Mobile (Optional)</label>
        <input
          className="input"
          placeholder="+91 9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <button
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? <Loader size={18} className="spin" /> : "Create Account"}
        </button>

      </form>
    </>
  );
};

export default SignupVerifyOtp;