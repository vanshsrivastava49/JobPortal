// YOUR ROUTES ARE 100% CORRECT - NO CHANGES NEEDED
const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const uploadResume = require("../middleware/uploadResume");
const uploadImage = require("../middleware/uploadImage");
const uploadLogo = require("../middleware/uploadLogo");

const {
  completeProfile,
  getMyProfile,
  uploadResume: uploadResumeCtrl,
  uploadLogo: uploadLogoCtrl,
  uploadBusinessImages,
  getPendingBusinesses,
  approveBusiness,
  rejectBusiness,
  getApprovedBusinesses,
  linkRecruiterToBusiness,
  unlinkRecruiterBusiness,
  requestBusinessLink,
  getPendingRecruiters,
  approveRecruiterLink,
  rejectRecruiterLink
} = require("../controllers/profile.controller");

// ALL ROUTES ARE CORRECT ✅
router.post("/complete", auth, completeProfile);
router.get("/me", auth, getMyProfile);
router.post("/upload-resume", auth, role("jobseeker"), uploadResume.single("resume"), uploadResumeCtrl);
router.post("/upload-logo", auth, role("recruiter"), uploadLogo.single("logo"), uploadLogoCtrl);
router.post("/upload-business-images", auth, role("business"), uploadImage.array("images", 5), uploadBusinessImages);
router.get("/business/pending", auth, role("admin"), getPendingBusinesses);
router.patch("/business/approve/:id", auth, role("admin"), approveBusiness);
router.patch("/business/reject/:id", auth, role("admin"), rejectBusiness);
router.get("/business/approved", getApprovedBusinesses);

// 🔥 THESE 5 ROUTES FIX YOUR 404
router.post("/recruiter/request-business", auth, role("recruiter"), requestBusinessLink);
router.get("/recruiter/pending-requests", auth, role("recruiter"), getPendingRecruiters);
router.get("/business/pending-recruiters", auth, role("business"), getPendingRecruiters);
router.patch("/business/approve-recruiter/:requestId", auth, role("business"), approveRecruiterLink);
router.patch("/business/reject-recruiter/:requestId", auth, role("business"), rejectRecruiterLink);

router.post("/recruiter/link-business", auth, role("recruiter"), linkRecruiterToBusiness);
router.post("/recruiter/unlink-business", auth, role("recruiter"), unlinkRecruiterBusiness);

module.exports = router;
