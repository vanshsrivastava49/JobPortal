const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadResume");

const {
  completeProfile,
  getMyProfile,
  uploadResume
} = require("../controllers/profile.controller");

/* =========================
   PROFILE ROUTES
========================= */

// Complete profile
router.post("/complete", auth, completeProfile);

// Get logged-in profile
router.get("/me", auth, getMyProfile);

// Upload resume to S3
router.post(
  "/upload-resume",
  auth,
  upload.single("resume"),
  uploadResume
);

module.exports = router;
