const Job = require("../models/Job");

/* ===============================
   RECRUITER POSTS JOB
=============================== */
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      recruiter: req.user.id,
      status: "pending",
    });

    res.json({
      success: true,
      message: "Job submitted for approval",
      job,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};

/* ===============================
   RECRUITER JOBS
=============================== */
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

/* ===============================
   ADMIN — VIEW PENDING JOBS
=============================== */
exports.getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "pending" })
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending jobs",
    });
  }
};

/* ===============================
   ADMIN APPROVE
=============================== */
exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job approved",
      job,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Approval failed",
    });
  }
};

/* ===============================
   ADMIN REJECT
=============================== */
exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job rejected",
      job,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Rejection failed",
    });
  }
};

/* ===============================
   JOBSEEKER — SEE LIVE JOBS
=============================== */
exports.getApprovedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" })
      .populate("recruiter", "name recruiterProfile.companyName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};
