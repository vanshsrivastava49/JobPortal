const User = require("../models/User");
const Job  = require("../models/Job");
const RecruiterBusinessLink = require("../models/RecruiterBusinessLink");

/* =========================================================
   ADMIN STATS
========================================================= */
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      jobseekers,
      recruiters,
      businesses,
      admins,
      approvedBusinesses,
      pendingBusinesses,
      rejectedBusinesses,
      liveJobs,
      pendingJobs,
      rejectedJobs,
      profilesCompleted,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "jobseeker" }),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "business" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "business", "businessProfile.status": "approved" }),
      User.countDocuments({ role: "business", "businessProfile.status": "pending" }),
      User.countDocuments({ role: "business", "businessProfile.status": "rejected" }),
      Job.countDocuments({ status: "approved" }),
      Job.countDocuments({ status: "pending_business" }),
      Job.countDocuments({ status: "rejected_business" }),
      User.countDocuments({ profileCompleted: true }),
    ]);

    res.json({
      success: true,
      totalUsers,
      jobseekers,
      recruiters,
      businesses,
      admins,
      approvedBusinesses,
      pendingBusinesses,
      rejectedBusinesses,
      liveJobs,
      pendingJobs,
      rejectedJobs,
      profilesCompleted,
    });
  } catch (err) {
    console.error("GET STATS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

/* =========================================================
   GET ALL USERS
========================================================= */
exports.getUsers = async (req, res) => {
  try {
    const { role: roleFilter, search } = req.query;
    const query = {};

    if (roleFilter && ["jobseeker", "recruiter", "business", "admin"].includes(roleFilter)) {
      query.role = roleFilter;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(1000);

    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

/* =========================================================
   GET USER BY ID
========================================================= */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

/* =========================================================
   DELETE USER
========================================================= */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete admin accounts" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `User "${user.name}" deleted successfully` });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

/* =========================================================
   GET ALL JOBS
========================================================= */
exports.getJobs = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
      .populate("recruiter", "name email")
      .populate("business", "name businessProfile")
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ success: true, jobs });
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

/* =========================================================
   UPDATE JOB STATUS (FIXED LOGIC)
========================================================= */
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["approved", "rejected_business", "pending_business"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    // 🔥 IMPORTANT FIX:
    // If job was revoked and admin approves → send back to business
    if (job.status === "revoked" && status === "approved") {
      job.status = "pending_business";
      job.approvedAt = null;
    } else {
      job.status = status;
      if (status === "approved") job.approvedAt = new Date();
    }

    await job.save();

    res.json({
      success: true,
      message: `Job status updated to "${job.status}"`,
      job,
    });
  } catch (err) {
    console.error("UPDATE JOB STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update job status" });
  }
};

/* =========================================================
   DELETE JOB
========================================================= */
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.json({ success: true, message: `Job "${job.title}" deleted` });
  } catch (err) {
    console.error("DELETE JOB ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};
/* =========================================================
   APPROVE BUSINESS (RESTORE JOBS IF PREVIOUSLY REVOKED)
========================================================= */
exports.approveBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Approve the business
    const business = await User.findOneAndUpdate(
      { _id: id, role: "business" },
      { "businessProfile.status": "approved", "businessProfile.verified": true },
      { new: true }
    ).select("-password");

    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    // 2️⃣ Find all recruiters linked to this business
    const linkedRecruiters = await User.find({
      role: "recruiter",
      "recruiterProfile.linkedBusiness": id,
    }).select("_id name");

    const recruiterIds = linkedRecruiters.map(r => r._id);
    let jobsRestored = 0;

    if (recruiterIds.length > 0) {
      // 3️⃣ Restore previously revoked jobs to pending_business
      const jobResult = await Job.updateMany(
        {
          recruiter: { $in: recruiterIds },
          status: "revoked", // only previously revoked jobs
        },
        { $set: { status: "pending_business" } } // send back to pending phase
      );

      jobsRestored = jobResult.modifiedCount;
    }

    res.json({
      success: true,
      message: `"${business.businessProfile?.businessName}" approved successfully. ${jobsRestored} previously revoked job(s) restored to pending.`,
      business,
      jobsRestored,
    });
  } catch (err) {
    console.error("APPROVE BUSINESS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to approve business" });
  }
};