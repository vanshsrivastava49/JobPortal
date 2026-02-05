import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Briefcase, Mail, Shield, Loader, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { sendOTP, verifyOTP } from "../api/authApi";
import GoogleSignIn from "../components/Auth/GoogleSignIn";

const Login = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // STEP 1: SEND LOGIN OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOTP(email, "login");
      if (res.success) {
        toast.success("OTP sent to your email");
        setStep("verify");
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY LOGIN OTP
const handleVerifyOtp = async (e) => {
  e.preventDefault();

  if (otp.length !== 6) {
    toast.error("Enter a valid 6-digit OTP");
    return;
  }

  setLoading(true);
  try {
    const res = await verifyOTP(
      email,
      otp,
      null,
      null,
      null,
      "login"
    );

    if (res.success) {
      toast.success("Login successful");

      login(res.user, res.token);
      navigate("/dashboard");

    } else {
      toast.error(res.message || "Invalid OTP");
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Invalid OTP");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "450px",
          width: "100%",
          padding: "40px",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Briefcase size={30} color="white" />
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: "700" }}>
            Welcome Back
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Login using OTP sent to your email
          </p>
        </div>

        {/* STEP 1: EMAIL */}
        {step === "email" && (
          <form onSubmit={handleSendOtp}>
            <label>Email Address</label>

            <div style={{ position: "relative", marginBottom: "20px" }}>
              <Mail
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
                type="email"
                className="input"
                style={{ paddingLeft: "45px" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button className="btn btn-primary"style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }} disabled={loading}>
              {loading ? <Loader className="spin" /> : "Send OTP"}
            </button>

            {/* GOOGLE SIGN-IN */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p style={{ marginBottom: "10px", color: "#6b7280" }}>or</p>
              <GoogleSignIn />
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === "verify" && (
          <>
            <button
              onClick={() => setStep("email")}
              style={{
                background: "none",
                border: "none",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={18} /> Back
            </button>

            <form onSubmit={handleVerifyOtp}>
              <label>Enter OTP</label>

              <div style={{ position: "relative", marginBottom: "20px" }}>
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
                  className="input"
                  style={{ paddingLeft: "45px", letterSpacing: "4px" }}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </div>

              <button className="btn btn-primary" disabled={loading}>
                {loading ? <Loader className="spin" /> : "Verify & Login"}
              </button>
            </form>
          </>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "14px" }}>
            Don’t have an account?{" "}
            <Link to="/signup" style={{ color: "#2563eb", fontWeight: 600 }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
