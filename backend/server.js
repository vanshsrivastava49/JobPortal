require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

const app = express();

// ✅ 1. FIXED SECURITY HEADERS (Solves the COOP / Google Auth error)
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    // crossOriginResourcePolicy: false, // Uncomment if S3 images break on the frontend
  })
);

// ✅ 2. FIXED CORS (Solves the XMLHttpRequest error)
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://green-jobs-alpha.vercel.app", // <-- Hardcoded your Vercel domain
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      // Remove trailing slashes just in case your .env has one
      const normalizedOrigin = origin ? origin.replace(/\/$/, "") : origin;

      if (!normalizedOrigin) return callback(null, true);
      
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parsers with payload limits (Prevents DoS)
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// DB connection
connectDB();

// Routes
app.use("/api/auth",         require("./routes/auth.routes"));
app.use("/api/profile",      require("./routes/profile.routes"));
app.use("/api/jobs",         require("./routes/job.routes"));
app.use("/api/admin",        require("./routes/admin.routes"));
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/ads",          require("./routes/ad.routes"));

app.get("/health", (req, res) => {
  res.json({ success: true, status: "OK", message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler — Masks internal errors in production
app.use((err, req, res, next) => {
  console.error("Error:", err); // Keep full stack trace in your server logs
  const isProd = process.env.NODE_ENV === "production";
  
  res.status(err.status || 500).json({ 
    success: false, 
    message: isProd ? "Something went wrong processing your request" : err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));