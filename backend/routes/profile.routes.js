const router = require("express").Router();
const auth = require("../middleware/auth");

const uploadResume = require("../middleware/uploadResume");
const uploadImage = require("../middleware/uploadImage");

const {
  completeProfile,
  getMyProfile,
  uploadResume: uploadResumeCtrl,
  uploadLogo,
  uploadBusinessImages
} = require("../controllers/profile.controller");

/* =========================
   PROFILE ROUTES
========================= */

// Complete profile
router.post("/complete", auth, completeProfile);

// Get profile
router.get("/me", auth, getMyProfile);

/* ========= RESUME ========= */
router.post(
  "/upload-resume",
  auth,
  uploadResume.single("resume"),
  uploadResumeCtrl
);

/* ========= RECRUITER LOGO ========= */
router.post(
  "/upload-logo",
  auth,
  uploadImage.single("logo"),
  uploadLogo
);

/* ========= BUSINESS IMAGES ========= */
router.post(
  "/upload-business-images",
  auth,
  uploadImage.array("images", 5),
  uploadBusinessImages
);

module.exports = router;
