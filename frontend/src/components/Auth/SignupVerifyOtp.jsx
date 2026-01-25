import React, { useState } from "react";
import { Shield, Loader, ArrowLeft, User } from "lucide-react";
import toast from "react-hot-toast";
import { verifyOTP } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignupVerifyOtp = ({ email, onBack }) => {
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("jobseeker");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const roleMap = {
    jobseeker: "jobseeker",
    recruiter: "recruiter",
    business: "business",
    admin:"admin"
  };

  // Role → dashboard redirect
  const redirectMap = {
    jobseeker: "/jobseeker",
    recruiter: "/recruiter",
    business: "/business",
    admin:"/admin"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    if (!name.trim()) {
      toast.error("Full name is required");
      return;
    }

    setLoading(true);

    try {
      const backendRole = roleMap[role];

      const res = await verifyOTP(
        email,
        otp,
        backendRole,
        mobile,
        name,
        "signup"
      );

      if (res.success) {
        toast.success("Account created successfully");

        // 🔐 Save auth
        login(
          {
            ...res.user,
            name, // ensure name is available in frontend
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
        {/* OTP */}
        <label>OTP</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Shield style={{ position: "absolute", left: 10, top: 12 }} />
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="000000"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </div>

        {/* NAME */}
        <label>Full Name</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <User style={{ position: "absolute", left: 10, top: 12 }} />
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* ROLE */}
        <label>Role</label>
        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="jobseeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
          <option value="business">Business Owner</option>
          <option value="admin">Admin</option>
        </select>

        {/* MOBILE */}
        <label>Mobile (Optional)</label>
        <input
          className="input"
          placeholder="+91 9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <button className="btn btn-primary" disabled={loading}>
          {loading ? <Loader className="spin" /> : "Create Account"}
        </button>
      </form>
    </>
  );
};

export default SignupVerifyOtp;
