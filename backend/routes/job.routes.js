const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createJob,
  getMyJobs,
  getPendingJobs,
  approveJob,
  rejectJob,
  getApprovedJobs,
} = require("../controllers/job.controller");

/* ===============================
   RECRUITER
=============================== */
router.post("/", auth, role("recruiter"), createJob);
router.get("/my", auth, role("recruiter"), getMyJobs);

/* ===============================
   ADMIN
=============================== */
router.get("/pending", auth, role("admin"), getPendingJobs);
router.patch("/approve/:id", auth, role("admin"), approveJob);
router.patch("/reject/:id", auth, role("admin"), rejectJob);

/* ===============================
   JOBSEEKER
=============================== */
router.get("/approved", auth, getApprovedJobs);

module.exports = router;
