const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { createJob, getJobs } = require("../controllers/job.controller");

router.get("/", getJobs);
router.post("/", auth, role("recruiter", "business"), createJob);

module.exports = router;
