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
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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

          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "5px",
            }}
          >
            {step === "signup" ? "Create Account" : "Verify Your Email"}
          </h1>

          <p style={{ color: "#6b7280", fontSize: "14px" }}>
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
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p style={{ marginBottom: "10px", color: "#6b7280" }}>or</p>
              <GoogleSignIn />
            </div>

            {/* LOGIN LINK */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
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
