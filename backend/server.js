require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const allowedOrigins = ["http://localhost:5173"];

// ✅ 1. CORS first — before any routes
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ 2. Body parsers — before any routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. DB connection
connectDB();

// ✅ 4. All routes (after middleware is ready)
app.use("/api/auth",    require("./routes/auth.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/jobs",    require("./routes/job.routes"));
app.use("/api/admin",   require("./routes/admin.routes")); // /api/admin/users  /api/admin/stats

app.get("/health", (req, res) => {
  res.json({ success: true, status: "OK", message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));