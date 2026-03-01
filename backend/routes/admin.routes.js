const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const {
  submitApplication,
  getMyApplications,
  withdrawApplication,
  getRecruiterApplications,
  getApplicationDetail,
  shortlistApplicant,
  updateRoundResult,
  rejectApplicant,
  updateApplicationNotes,
  getAllApplications,
  checkApplied,
} = require("../controllers/application.controller");

// ── Jobseeker routes ────────────────────────────────────────
router.post("/",                              protect, authorizeRoles("jobseeker"),         submitApplication);
router.get("/my",                             protect, authorizeRoles("jobseeker"),         getMyApplications);
router.get("/check/:jobId",                   protect, authorizeRoles("jobseeker"),         checkApplied);
router.patch("/:applicationId/withdraw",      protect, authorizeRoles("jobseeker"),         withdrawApplication);

// ── Recruiter routes ────────────────────────────────────────
router.get("/recruiter",                      protect, authorizeRoles("recruiter"),         getRecruiterApplications);
router.patch("/:applicationId/shortlist",     protect, authorizeRoles("recruiter"),         shortlistApplicant);
router.patch("/:applicationId/round-result",  protect, authorizeRoles("recruiter"),         updateRoundResult);
router.patch("/:applicationId/reject",        protect, authorizeRoles("recruiter"),         rejectApplicant);
router.patch("/:applicationId/notes",         protect, authorizeRoles("recruiter"),         updateApplicationNotes);

// ── Admin routes ────────────────────────────────────────────
router.get("/admin/all",                      protect, authorizeRoles("admin"),             getAllApplications);

// ── Shared (recruiter + admin) ──────────────────────────────
router.get("/:applicationId",                 protect, authorizeRoles("recruiter", "admin"), getApplicationDetail);

module.exports = router;