import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar"; // adjust path as needed

export default function GreenJobsHomepage() {
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "Jennifer Paul",
      text: "GreenJobs made my transition into purpose-driven work much easier. The platform feels focused, calm, and very easy to use.",
    },
    {
      name: "Kavya Patel",
      text: "Uploading my details and exploring opportunities felt smooth. The process is simple and the interface is very clean.",
    },
    {
      name: "Deepak Verma",
      text: "A great platform for discovering meaningful roles. It feels more mission-led than a typical job portal.",
    },
  ];

  const sectionPad = { paddingLeft: "64px", paddingRight: "64px" };
  const innerWrap = { maxWidth: "1400px", margin: "0 auto" };

  return (
    <div style={{ minHeight: "100vh", width: "100%", backgroundColor: "#edf3f4", color: "#2f4630" }}>

      {/* ── Shared Navbar (shows Login + Sign Up when logged out) ── */}
      <Navbar />

      <main style={{ width: "100%" }}>

        {/* ── Hero / Search ── */}
        <section style={{ ...sectionPad, paddingTop: "80px", paddingBottom: "64px", textAlign: "center" }}>
          <div style={innerWrap}>
            <p style={{ fontSize: "14px", color: "#5b8f5a" }}>Realize your career dreams</p>
            <h2 style={{ marginTop: "8px", fontSize: "5rem", lineHeight: 1.1, color: "#415b41", fontFamily: "Georgia, Times New Roman, serif" }}>
              Discover your jobs here
            </h2>
            <div style={{ margin: "40px auto 0", width: "100%", maxWidth: "980px", display: "flex", flexDirection: "row", alignItems: "center", background: "white", border: "1px solid #cfcfcf", borderRadius: "9999px", padding: "12px 12px 12px 24px", boxShadow: "0 10px 24px rgba(0,0,0,0.08)" }}>
              <input type="text" placeholder="Search jobs, keyword or company" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "15px", color: "#444", padding: "8px 0", minWidth: 0 }} />
              <div style={{ width: "1px", height: "32px", background: "#d5d5d5", margin: "0 16px", flexShrink: 0 }} />
              <input type="text" placeholder="City or pincode" style={{ width: "220px", border: "none", outline: "none", background: "transparent", fontSize: "15px", color: "#444", padding: "8px 0", flexShrink: 0 }} />
              <button onClick={() => navigate("/jobs")} style={{ background: "#6c6c6c", border: "none", borderRadius: "9999px", padding: "12px 32px", fontSize: "15px", fontWeight: "500", color: "white", cursor: "pointer", flexShrink: 0, marginLeft: "8px" }}>
                Search
              </button>
            </div>
          </div>
        </section>

        {/* ── Tagline ── */}
        <section style={{ ...sectionPad, paddingTop: "80px", paddingBottom: "56px", textAlign: "center" }}>
          <div style={innerWrap}>
            <p style={{ fontSize: "14px", color: "#5b8f5a" }}>Your Career. Your Move. Your Future.</p>
            <h3 style={{ margin: "8px auto 0", maxWidth: "1000px", fontSize: "3.5rem", lineHeight: 1.2, color: "#415441", fontFamily: "Georgia, Times New Roman, serif" }}>
              Your Career. Your Move. Your Future.
            </h3>
            <p style={{ margin: "16px auto 0", maxWidth: "900px", fontSize: "16px", lineHeight: 1.8, color: "#4f5961" }}>
              Upload your portfolio, explore opportunities, and get hired faster. One job post on GreenJobs reaches 500+ skilled professionals.
            </p>
          </div>
        </section>

        {/* ── Mission Banner ── */}
        <section style={{ ...sectionPad, paddingBottom: "56px" }}>
          <div style={{ ...innerWrap, position: "relative", display: "flex", minHeight: "260px", overflow: "hidden", borderRadius: "6px", background: "linear-gradient(to right, #f3f6e9, #f3f3df, #dfe9f5)" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "8px", background: "#ffb000" }} />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 280px 40px 64px", width: "100%" }}>
              <div style={{ fontSize: "3rem", fontWeight: "800", textTransform: "uppercase", lineHeight: 1, color: "#171717" }}>MORE THAN JOBS.</div>
              <div style={{ marginTop: "8px", fontSize: "3rem", fontWeight: "800", textTransform: "uppercase", lineHeight: 1, color: "#74b437" }}>IT'S A MISSION.</div>
              <p style={{ marginTop: "16px", maxWidth: "420px", fontSize: "15px", lineHeight: 1.6, color: "#555" }}>
                Explore careers for passionate individuals with causes that matter and work that creates real impact.
              </p>
            </div>
            <div style={{ position: "absolute", right: "80px", top: 0, height: "100%", width: "32px", transform: "skewX(-24deg)", background: "#8ac43b" }} />
            <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "320px", display: "flex", alignItems: "center", gap: "16px", padding: "0 24px" }}>
              <div style={{ height: "120px", width: "76px", background: "#c7d7e2" }} />
              <div style={{ height: "150px", width: "100px", background: "#9fb8c9" }} />
              <div style={{ height: "120px", width: "72px", background: "#5b6d86" }} />
            </div>
          </div>
        </section>

        {/* ── Process Steps ── */}
        <section style={{ ...sectionPad, paddingTop: "32px", textAlign: "center" }}>
          <div style={innerWrap}>
            <p style={{ fontSize: "14px", color: "#5b8f5a" }}>Simple Process</p>
            <h3 style={{ marginTop: "8px", fontSize: "3.5rem", lineHeight: 1.2, color: "#415441", fontFamily: "Georgia, Times New Roman, serif" }}>
              Effortless Process<br />Optimal Results
            </h3>
          </div>
        </section>

        <section style={{ ...sectionPad, paddingTop: "40px", paddingBottom: "80px" }}>
          <div style={{ ...innerWrap, background: "#d7f7d6", padding: "56px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px" }}>
              {[
                { label: "Complete your\nprofile", img: "img 1" },
                { label: "Portfolio\nUpload", img: "img 2" },
                { label: "Scheduling\nInterview", img: "img 3" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px" }}>
                  <div style={{ height: "150px", width: "150px", background: "#c8c8c8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#333", flexShrink: 0 }}>
                    {step.img}
                  </div>
                  <div style={{ fontSize: "17px", lineHeight: 1.4, color: "#3b573b", whiteSpace: "pre-line" }}>{step.label}</div>
                  {i < 2 && <div style={{ fontSize: "22px", color: "#3b573b" }}>→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ ...sectionPad, paddingBottom: "64px", textAlign: "center" }}>
          <div style={innerWrap}>
            <p style={{ fontSize: "14px", color: "#5b8f5a" }}>Success Experience</p>
            <h3 style={{ marginTop: "8px", fontSize: "3rem", lineHeight: 1.2, color: "#415441", fontFamily: "Georgia, Times New Roman, serif" }}>
              Insights from GreenJobs users
            </h3>
            <div style={{ margin: "40px auto 0", maxWidth: "1220px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
              {testimonials.map((item) => (
                <div key={item.name} style={{ background: "#fff3f2", padding: "28px", textAlign: "left", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: "24px", color: "#f08148" }}>❝</div>
                  <p style={{ marginTop: "12px", minHeight: "150px", fontSize: "15px", lineHeight: 1.7, color: "#555" }}>{item.text}</p>
                  <div style={{ marginTop: "16px", fontSize: "15px", color: "#f39b41" }}>★★★★★</div>
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ height: "40px", width: "40px", borderRadius: "9999px", background: "#d8c3a5", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#444" }}>{item.name}</div>
                      <div style={{ fontSize: "12px", color: "#777" }}>GreenJobs User</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "20px", fontSize: "20px", letterSpacing: "6px", color: "#4a4a4a" }}>...</div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer style={{ width: "100%", background: "linear-gradient(to bottom, #4c4c4c, #242424)", padding: "48px 64px", color: "white" }}>
        <div style={{ ...innerWrap, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#4acc73" }}>Green Jobs</div>
            <p style={{ marginTop: "12px", fontSize: "13px", lineHeight: 1.7, color: "#d6d6d6" }}>Emerging workforce hub for impactful opportunities and sustainable careers.</p>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>Quick Links</div>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#d6d6d6" }}>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>Home</span>
              <span>About Us</span>
              <span>Blogs</span>
              <span>Contact Us</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>For Recruiters</div>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#d6d6d6" }}>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>Sign in</span>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/signup")}>Sign up</span>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/post-job")}>Post Jobs</span>
              <span>Feedback</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>For Job Seekers</div>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#d6d6d6" }}>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/jobs")}>Explore jobs</span>
              <span>Resources</span>
              <span>Tips &amp; Blogs</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>Contact</div>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", lineHeight: 1.6, color: "#d6d6d6" }}>
              <span>123 XYZ ROAD, NEW DELHI</span>
              <span>contact@greenjobs.in</span>
              <span>Mon–Sat 9 AM to 6 PM</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}