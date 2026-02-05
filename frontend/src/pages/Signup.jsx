import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EmailSignup from "../components/Auth/EmailSignup";
import SignupVerifyOtp from "../components/Auth/SignupVerifyOtp";
import { Briefcase } from "lucide-react";
import GoogleSignIn from "../components/Auth/GoogleSignIn";

const Signup = () => {
  const [step, setStep] = useState("signup");
  const [email, setEmail] = useState("");
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.profileCompleted ? "/dashboard" : "/complete-profile"}
        replace
      />
    );
  }

  const handleOTPSent = (userEmail) => {
    setEmail(userEmail);
    setStep("verify");
  };

  const handleBack = () => {
    setStep("signup");
    setEmail("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          maxWidth: "420px",
          width: "100%",
          padding: "36px 32px",
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background:
                "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: "0 8px 20px rgba(102,126,234,0.4)",
            }}
          >
            <Briefcase size={30} color="#fff" />
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "6px",
            }}
          >
            {step === "signup" ? "Create Account" : "Verify Your Email"}
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            {step === "signup"
              ? "Join our platform and start your journey"
              : `Enter the verification code sent to ${email}`}
          </p>
        </div>

        {/* BODY */}
        {step === "signup" ? (
          <>
            {/* EMAIL SIGNUP */}
            <EmailSignup onOTPSent={handleOTPSent} />

            {/* GOOGLE SIGN-IN */}
            <div style={{ marginTop: "22px", textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                  OR
                </span>
                <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              </div>

              <GoogleSignIn />
            </div>

            {/* LOGIN LINK */}
            <div style={{ textAlign: "center", marginTop: "22px" }}>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </>
        ) : (
          <SignupVerifyOtp email={email} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default Signup;