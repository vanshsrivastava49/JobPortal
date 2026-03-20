import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Building2, Zap, Users, Shield } from "lucide-react";
import GoogleSignIn from "../components/Auth/GoogleSignIn";
import EmailSignup from "../components/Auth/EmailSignup";
import SignupVerifyOtp from "../components/Auth/SignupVerifyOtp";
import Navbar from "../components/common/Navbar";

const BusinessSignup = () => {
  const [step, setStep] = useState("signup");
  const [email, setEmail] = useState("");
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.profileCompleted ? "/business/dashboard" : "/complete-profile"} replace />;
  }

  const handleOTPSent = (userEmail) => { setEmail(userEmail); setStep("verify"); };
  const handleBack = () => { setStep("signup"); setEmail(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .bizs-page {
          min-height: calc(100vh - 82px);
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #fffbeb;
        }

        /* ── LEFT — form ── */
        .bizs-left {
          flex: 1; min-width: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px; overflow-y: auto; background: #fffbeb;
        }

        .bizs-form-box {
          width: 100%; max-width: 420px; margin: 0 auto;
          animation: bizsUp 0.45s ease both;
        }
        @keyframes bizsUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        .bizs-wordmark {
          font-size: 20px; font-weight: 800; color: #1c1917;
          margin-bottom: 28px; display: flex; align-items: center; gap: 10px; letter-spacing: -0.4px;
        }
        .bizs-wordmark-dot { width: 8px; height: 8px; border-radius: 50%; background: #d97706; margin-top: 2px; flex-shrink: 0; }

        .bizs-role-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
        .bizs-chip {
          padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700;
          border: 1px solid #e5e7eb; background: white; color: #9ca3af;
          text-decoration: none; transition: all 0.15s; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .bizs-chip:hover { border-color: #d97706; color: #b45309; }
        .bizs-chip.active { border-color: #d97706; color: #92400e; background: #fffbeb; }

        .bizs-heading { font-size: 28px; font-weight: 800; color: #1c1917; margin-bottom: 6px; letter-spacing: -0.5px; }
        .bizs-sub { font-size: 14px; color: #78716c; margin-bottom: 24px; line-height: 1.6; font-weight: 400; }
        .bizs-sub strong { color: #92400e; font-weight: 700; }

        .bizs-divider { text-align: center; position: relative; margin: 20px 0; }
        .bizs-divider::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #e7e5e4; }
        .bizs-divider span { background: #fffbeb; padding: 0 14px; font-size: 11px; color: #a8a29e; position: relative; letter-spacing: 0.06em; text-transform: uppercase; }

        .bizs-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #78716c; }
        .bizs-footer a { color: #d97706; font-weight: 700; text-decoration: none; }
        .bizs-footer a:hover { text-decoration: underline; }

        .bizs-back { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; color: #78716c; margin-bottom: 16px; padding: 0; font-family: 'Inter', sans-serif; font-weight: 500; transition: color 0.15s; }
        .bizs-back:hover { color: #1c1917; }

        /* ══ OTP grid fix ══ */
        .bizs-form-box .otp-row,
        .bizs-form-box [class*="otp-row"],
        .bizs-form-box [class*="otp_row"] {
          display: grid !important;
          grid-template-columns: repeat(6, 1fr) !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .bizs-form-box .otp-row input,
        .bizs-form-box [class*="otp-row"] input,
        .bizs-form-box [class*="otp_row"] input {
          width: 100% !important;
          flex: unset !important;
          aspect-ratio: 1/1 !important;
          max-height: 60px !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        /* Child form overrides */
        .bizs-form-box input {
          background: white !important;
          border: 1.5px solid #e7e5e4 !important;
          border-radius: 10px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          color: #1c1917 !important;
          box-sizing: border-box !important;
        }
        .bizs-form-box input::placeholder { color: #a8a29e !important; }
        .bizs-form-box input:focus { border-color: #d97706 !important; box-shadow: 0 0 0 3px rgba(217,119,6,0.1) !important; }
        .bizs-form-box label {
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important; font-weight: 700 !important;
          color: #57534e !important; letter-spacing: 0.06em !important; text-transform: uppercase !important;
        }
        .bizs-form-box button[type="submit"] {
          background: #92400e !important;
          border-radius: 10px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 15px !important; font-weight: 700 !important;
        }
        .bizs-form-box button[type="submit"]:hover:not(:disabled) {
          background: #78350f !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 16px rgba(146,64,14,0.25) !important;
        }
        .bizs-form-box input[maxLength="1"],
        .bizs-form-box input[maxlength="1"] {
          font-size: 22px !important; font-weight: 800 !important;
          text-align: center !important;
          border: 1.5px solid #e7e5e4 !important;
        }
        .bizs-form-box input[maxLength="1"]:focus,
        .bizs-form-box input[maxlength="1"]:focus {
          background: #fffbeb !important; border-color: #d97706 !important;
        }

        /* ── RIGHT brand panel ── */
        .bizs-right {
          width: 42%; flex-shrink: 0;
          background: #1c1917;
          display: flex; flex-direction: column; justify-content: center;
          padding: 64px 56px; position: relative; overflow: hidden;
        }
        .bizs-right-pattern { position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(circle, rgba(217,119,6,0.08) 1px, transparent 1px); background-size: 32px 32px; }
        .bizs-right-glow { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%); top: -80px; right: -80px; pointer-events: none; }
        .bizs-right-content { position: relative; z-index: 2; }
        .bizs-right-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #d97706; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .bizs-right-eyebrow::after { content: ''; flex: 1; height: 1px; background: rgba(217,119,6,0.3); max-width: 60px; }
        .bizs-right-title { font-size: 38px; font-weight: 800; line-height: 1.15; color: white; margin-bottom: 20px; letter-spacing: -1px; }
        .bizs-right-title span { color: #d97706; }
        .bizs-right-desc { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.8; margin-bottom: 40px; max-width: 300px; }
        .bizs-perks { display: flex; flex-direction: column; gap: 18px; }
        .bizs-perk { display: flex; align-items: flex-start; gap: 14px; }
        .bizs-perk-icon { width: 38px; height: 38px; border-radius: 8px; background: rgba(217,119,6,0.1); border: 1px solid rgba(217,119,6,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .bizs-perk-title { font-size: 13px; font-weight: 700; color: white; margin-bottom: 3px; }
        .bizs-perk-desc { font-size: 12px; color: rgba(255,255,255,0.35); }
        .bizs-free-badge { margin-top: 36px; padding: 14px 20px; background: rgba(217,119,6,0.08); border: 1px solid rgba(217,119,6,0.2); border-radius: 10px; }
        .bizs-free-badge-title { font-size: 13px; font-weight: 700; color: #d97706; margin-bottom: 4px; }
        .bizs-free-badge-desc { font-size: 12px; color: rgba(255,255,255,0.35); }

        @media (max-width: 900px) { .bizs-right { display: none; } }
        @media (max-width: 520px) { .bizs-left { padding: 32px 20px; } }
      `}</style>

      <Navbar />
      <div className="bizs-page">
        <div className="bizs-left">
          <div className="bizs-form-box">
            <div className="bizs-wordmark">
              <Building2 size={20} color="#d97706" />
              GreenJobs Business
              <div className="bizs-wordmark-dot" />
            </div>
            <div className="bizs-role-row">
              <Link to="/signup" className="bizs-chip">Job Seeker</Link>
              <Link to="/recruiter/signup" className="bizs-chip">Recruiter</Link>
              <span className="bizs-chip active">Business</span>
              <Link to="/admin/signup" className="bizs-chip">Admin</Link>
            </div>
            {step === "signup" ? (
              <>
                <h1 className="bizs-heading">Register Business</h1>
                <p className="bizs-sub">List your company and attract green energy professionals.</p>
                <EmailSignup onOTPSent={handleOTPSent} role="business" />
                <div className="bizs-divider"><span>or</span></div>
                <GoogleSignIn />
              </>
            ) : (
              <>
                <button className="bizs-back" type="button" onClick={handleBack}><ArrowLeft size={13} /> Back</button>
                <h1 className="bizs-heading">Verify email</h1>
                <p className="bizs-sub">Code sent to <strong style={{ color: "#d97706" }}>{email}</strong></p>
                <SignupVerifyOtp email={email} onBack={handleBack} />
              </>
            )}
            <div className="bizs-footer">
              Already registered? <Link to="/business/login">Sign in</Link>
              {" · "}
              <Link to="/" style={{ color: "#a8a29e" }}>Home</Link>
            </div>
          </div>
        </div>

        <div className="bizs-right">
          <div className="bizs-right-pattern" /><div className="bizs-right-glow" />
          <div className="bizs-right-content">
            <div className="bizs-right-eyebrow">For Business Owners</div>
            <h2 className="bizs-right-title">Build your <span>green</span> brand</h2>
            <p className="bizs-right-desc">Join India's fastest growing platform for renewable energy businesses and talent.</p>
            <div className="bizs-perks">
              <div className="bizs-perk"><div className="bizs-perk-icon"><Zap size={16} color="#d97706" /></div><div><div className="bizs-perk-title">Go live in minutes</div><div className="bizs-perk-desc">Set up your company profile quickly with our guided flow</div></div></div>
              <div className="bizs-perk"><div className="bizs-perk-icon"><Users size={16} color="#d97706" /></div><div><div className="bizs-perk-title">Access 18,000+ professionals</div><div className="bizs-perk-desc">Tap into a pre-vetted pool of green energy talent</div></div></div>
              <div className="bizs-perk"><div className="bizs-perk-icon"><Shield size={16} color="#d97706" /></div><div><div className="bizs-perk-title">Verified business badge</div><div className="bizs-perk-desc">Build credibility with our platform verification</div></div></div>
            </div>
            <div className="bizs-free-badge">
              <div className="bizs-free-badge-title">✦ Free to get started</div>
              <div className="bizs-free-badge-desc">No credit card required. List your business at no cost.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessSignup;