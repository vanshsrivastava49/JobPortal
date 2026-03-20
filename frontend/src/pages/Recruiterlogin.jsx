import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Loader, ArrowLeft, BarChart2, Users, Zap, Target } from "lucide-react";
import toast from "react-hot-toast";
import { sendOTP, verifyOTP } from "../api/authApi";
import GoogleSignIn from "../components/Auth/GoogleSignIn";
import ReCAPTCHA from "react-google-recaptcha";
import Navbar from "../components/common/Navbar";

const RecruiterLogin = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/recruiter/dashboard" replace />;

  const handleOtpChange = (val, idx) => {
    const digits = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp]; next[idx] = digits; setOtp(next);
    if (digits && idx < 5) document.getElementById(`otp-rec-${idx + 1}`)?.focus();
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) document.getElementById(`otp-rec-${idx - 1}`)?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    document.getElementById(`otp-rec-${Math.min(pasted.length, 5)}`)?.focus();
  };
  const otpString = otp.join("");

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    if (!captchaToken && import.meta.env.VITE_RECAPTCHA_SITE_KEY) { toast.error("Please complete the captcha"); return; }
    setLoading(true);
    try {
      const res = await sendOTP(email, "login", captchaToken || "dev");
      if (res.success) { toast.success("OTP sent!"); setStep("verify"); }
      else toast.error(res.message || "Failed to send OTP");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to send OTP"); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpString.length !== 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      const res = await verifyOTP(email, otpString, null, null, null, "login");
      if (res.success) { toast.success("Welcome back!"); login(res.user, res.token); navigate("/recruiter/dashboard"); }
      else toast.error(res.message || "Invalid OTP");
    } catch (err) { toast.error(err.response?.data?.message || "Invalid OTP"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .rec-page {
          min-height: calc(100vh - 82px);
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #eff6ff;
        }

        .rec-left {
          flex: 1; min-width: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px; overflow-y: auto; background: #eff6ff;
        }

        .rec-form-box {
          width: 100%; max-width: 420px; margin: 0 auto;
          animation: recUp 0.45s ease both;
        }
        @keyframes recUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        .rec-wordmark {
          font-size: 20px; font-weight: 800; color: #1e3a5f;
          margin-bottom: 32px; display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.4px;
        }
        .rec-wordmark-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; margin-top: 2px; flex-shrink: 0; }

        .rec-role-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 28px; }
        .rec-chip {
          padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700;
          border: 1px solid #e5e7eb; background: white; color: #9ca3af;
          text-decoration: none; transition: all 0.15s; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .rec-chip:hover { border-color: #3b82f6; color: #2563eb; }
        .rec-chip.active { border-color: #3b82f6; color: #1d4ed8; background: #eff6ff; }

        .rec-heading { font-size: 28px; font-weight: 800; color: #1e3a5f; margin-bottom: 6px; letter-spacing: -0.5px; }
        .rec-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; line-height: 1.6; font-weight: 400; }
        .rec-sub strong { color: #1d4ed8; font-weight: 700; }

        .rec-label { font-size: 12px; font-weight: 700; color: #475569; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; display: block; }

        .rec-input-wrap { position: relative; margin-bottom: 18px; }
        .rec-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .rec-input {
          width: 100%; padding: 13px 16px 13px 44px;
          background: white; border: 1.5px solid #dbeafe; border-radius: 10px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          color: #1e3a5f; outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .rec-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .rec-input:disabled { opacity: 0.6; background: #f0f9ff; }
        .rec-input::placeholder { color: #94a3b8; }

        .rec-otp-row {
          display: grid; grid-template-columns: repeat(6, 1fr);
          gap: 8px; width: 100%; margin-bottom: 16px; box-sizing: border-box;
        }
        .rec-otp-box {
          width: 100%; aspect-ratio: 1/1; max-height: 60px;
          background: white; border: 1.5px solid #dbeafe; border-radius: 10px;
          font-size: 22px; font-weight: 800; font-family: 'Inter', sans-serif;
          color: #1e3a5f; text-align: center; outline: none;
          transition: all 0.18s; padding: 0; box-sizing: border-box;
        }
        .rec-otp-box:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); background: #eff6ff; }
        .rec-otp-box:not(:placeholder-shown) { background: #eff6ff; }

        .rec-otp-hint { font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 20px; }
        .rec-otp-hint button { background: none; border: none; color: #3b82f6; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 12px; padding: 0; }
        .rec-otp-hint button:hover { text-decoration: underline; }

        .rec-captcha { display: flex; justify-content: center; margin-bottom: 18px; }

        .rec-btn {
          width: 100%; padding: 14px;
          background: #1d4ed8; color: white; border: none; border-radius: 10px;
          font-size: 15px; font-weight: 700; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-sizing: border-box; box-shadow: 0 3px 12px rgba(29,78,216,0.3);
          letter-spacing: 0.1px;
        }
        .rec-btn:hover:not(:disabled) { background: #1e40af; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(29,78,216,0.35); }
        .rec-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

        .rec-divider { text-align: center; position: relative; margin: 20px 0; }
        .rec-divider::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #dbeafe; }
        .rec-divider span { background: #eff6ff; padding: 0 14px; font-size: 11px; color: #94a3b8; position: relative; letter-spacing: 0.06em; text-transform: uppercase; }

        .rec-footer { text-align: center; margin-top: 28px; font-size: 13px; color: #64748b; }
        .rec-footer a { color: #3b82f6; font-weight: 700; text-decoration: none; }
        .rec-footer a:hover { text-decoration: underline; }

        .rec-back { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; margin-bottom: 24px; padding: 0; font-family: 'Inter', sans-serif; transition: color 0.15s; font-weight: 500; }
        .rec-back:hover { color: #1e3a5f; }

        /* ── RIGHT brand panel ── */
        .rec-right {
          width: 42%; flex-shrink: 0;
          background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
          display: flex; flex-direction: column; justify-content: center;
          padding: 64px 56px; position: relative; overflow: hidden;
        }
        .rec-right-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px); background-size: 40px 40px; }
        .rec-right-glow { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%); top: -80px; right: -80px; pointer-events: none; }
        .rec-right-content { position: relative; z-index: 2; }
        .rec-right-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #60a5fa; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .rec-right-eyebrow::after { content: ''; flex: 1; height: 1px; background: rgba(96,165,250,0.3); max-width: 60px; }
        .rec-right-title { font-size: 38px; font-weight: 800; line-height: 1.15; color: white; margin-bottom: 24px; letter-spacing: -1px; }
        .rec-right-title span { color: #60a5fa; }
        .rec-right-desc { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.8; margin-bottom: 40px; max-width: 320px; }
        .rec-features { display: flex; flex-direction: column; gap: 18px; }
        .rec-feature { display: flex; align-items: flex-start; gap: 14px; }
        .rec-feature-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rec-feature-title { font-size: 13px; font-weight: 700; color: white; margin-bottom: 3px; }
        .rec-feature-desc { font-size: 12px; color: rgba(255,255,255,0.4); }

        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 900px) { .rec-right { display: none; } }
        @media (max-width: 520px) { .rec-left { padding: 32px 20px; } }
        @media (max-width: 400px) { .rec-otp-row { gap: 6px; } .rec-otp-box { font-size: 18px; border-radius: 8px; } }
      `}</style>

      <Navbar />
      <div className="rec-page">
        <div className="rec-left">
          <div className="rec-form-box">
            <div className="rec-wordmark">
              <BarChart2 size={20} color="#3b82f6" />
              GreenJobs Recruiter
              <div className="rec-wordmark-dot" />
            </div>
            <div className="rec-role-row">
              <Link to="/login" className="rec-chip">Job Seeker</Link>
              <span className="rec-chip active">Recruiter</span>
              <Link to="/business/login" className="rec-chip">Business</Link>
              <Link to="/admin/login" className="rec-chip">Admin</Link>
            </div>
            {step === "email" ? (
              <>
                <h1 className="rec-heading">Recruiter Sign In</h1>
                <p className="rec-sub">Access your hiring dashboard and manage candidates.</p>
                <form onSubmit={handleSendOtp}>
                  <label className="rec-label">Work Email</label>
                  <div className="rec-input-wrap">
                    <Mail size={17} className="rec-input-icon" />
                    <input type="email" className="rec-input" placeholder="recruiter@company.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                  </div>
                  {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
                    <div className="rec-captcha"><ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={setCaptchaToken} /></div>
                  )}
                  <button className="rec-btn" disabled={loading}>
                    {loading ? <><Loader size={15} className="spinner" /> Sending OTP...</> : "Send OTP →"}
                  </button>
                  <div className="rec-divider"><span>or</span></div>
                  <GoogleSignIn />
                </form>
              </>
            ) : (
              <>
                <button className="rec-back" type="button" onClick={() => { setStep("email"); setOtp(["","","","","",""]); }}>
                  <ArrowLeft size={14} /> Back to email
                </button>
                <h1 className="rec-heading">Enter OTP</h1>
                <p className="rec-sub">We sent a 6-digit code to<br /><strong>{email}</strong></p>
                <form onSubmit={handleVerifyOtp}>
                  <div className="rec-otp-row">
                    {otp.map((digit, i) => (
                      <input key={i} id={`otp-rec-${i}`} className="rec-otp-box"
                        type="text" inputMode="numeric" maxLength={1} value={digit} placeholder="·"
                        onChange={e => handleOtpChange(e.target.value, i)}
                        onKeyDown={e => handleOtpKey(e, i)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        disabled={loading} autoFocus={i === 0} />
                    ))}
                  </div>
                  <p className="rec-otp-hint">Didn't receive it? <button type="button" onClick={handleSendOtp}>Resend OTP</button></p>
                  <button className="rec-btn" disabled={loading || otpString.length !== 6}>
                    {loading ? <><Loader size={15} className="spinner" /> Verifying...</> : "Verify & Enter →"}
                  </button>
                </form>
              </>
            )}
            <div className="rec-footer">
              New recruiter? <Link to="/signup?role=recruiter">Create account</Link>
              {" · "}
              <Link to="/" style={{ color: "#94a3b8" }}>Home</Link>
            </div>
          </div>
        </div>

        <div className="rec-right">
          <div className="rec-right-grid" /><div className="rec-right-glow" />
          <div className="rec-right-content">
            <div className="rec-right-eyebrow">For Recruiters</div>
            <h2 className="rec-right-title">Hire <span>smarter</span> in green energy</h2>
            <p className="rec-right-desc">Post jobs, review applications, and build your renewable energy team with India's leading green hiring platform.</p>
            <div className="rec-features">
              <div className="rec-feature"><div className="rec-feature-icon"><Users size={16} color="#60a5fa" /></div><div><div className="rec-feature-title">Verified Talent Pool</div><div className="rec-feature-desc">Access pre-screened green energy professionals</div></div></div>
              <div className="rec-feature"><div className="rec-feature-icon"><Zap size={16} color="#60a5fa" /></div><div><div className="rec-feature-title">Fast Hiring</div><div className="rec-feature-desc">Post a job and get applications within 24 hours</div></div></div>
              <div className="rec-feature"><div className="rec-feature-icon"><Target size={16} color="#60a5fa" /></div><div><div className="rec-feature-title">Targeted Reach</div><div className="rec-feature-desc">Connect with candidates matched to your roles</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecruiterLogin;