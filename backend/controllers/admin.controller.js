const User = require("../models/User");
const Job  = require("../models/Job");
const RecruiterBusinessLink = require("../models/RecruiterBusinessLink");
const email = require("../services/emailService");

/* =========================================================
   ADMIN STATS
========================================================= */
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers, jobseekers, recruiters, businesses, admins,
      approvedBusinesses, pendingBusinesses, rejectedBusinesses,
      liveJobs, pendingJobs, rejectedJobs, profilesCompleted,
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
      totalUsers, jobseekers, recruiters, businesses, admins,
      approvedBusinesses, pendingBusinesses, rejectedBusinesses,
      liveJobs, pendingJobs, rejectedJobs, profilesCompleted,
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
        { title:    { $regex: search, $options: "i" } },
        { company:  { $regex: search, $options: "i" } },
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
   UPDATE JOB STATUS
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

    if (job.status === "revoked" && status === "approved") {
      job.status = "pending_business";
      job.approvedAt = null;
    } else {
      job.status = status;
      if (status === "approved") job.approvedAt = new Date();
    }

    await job.save();

    res.json({ success: true, message: `Job status updated to "${job.status}"`, job });
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
   APPROVE BUSINESS
   - Sends welcome-back re-approval email if business was
     previously revoked (status was "pending" after revoke)
   - Sends normal first-approval email otherwise
========================================================= */
exports.approveBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch full business BEFORE updating (includes email which may be stripped by select("-password"))
    const businessBefore = await User.findOne({ _id: id, role: "business" });
    if (!businessBefore) return res.status(404).json({ success: false, message: "Business not found" });

    // Detect re-approval: check if this business was ever revoked by looking for
    // removed_by_business links OR if the business had a previous approved status
    // that was reset. We also check the businessProfile directly as a fallback.
    const wasRevoked = await RecruiterBusinessLink.exists({
      business: id,
      status: "removed_by_business",
    });

    // Update status
    const business = await User.findOneAndUpdate(
      { _id: id, role: "business" },
      { "businessProfile.status": "approved", "businessProfile.verified": true },
      { new: true }
    );

    const linkedRecruiters = await User.find({
      role: "recruiter",
      "recruiterProfile.linkedBusiness": id,
    }).select("_id name");

    const recruiterIds = linkedRecruiters.map(r => r._id);
    let jobsRestored = 0;

    if (recruiterIds.length > 0) {
      const jobResult = await Job.updateMany(
        { recruiter: { $in: recruiterIds }, status: "revoked" },
        { $set: { status: "pending_business" } }
      );
      jobsRestored = jobResult.modifiedCount;
    }

    const businessName = businessBefore.businessProfile?.businessName || businessBefore.name;
    const ownerEmail   = businessBefore.email;
    const ownerName    = businessBefore.name;

    console.log(`📧 Sending approval email to: ${ownerEmail} | wasRevoked: ${!!wasRevoked}`);

    // ✅ Send the right email — use businessBefore data to guarantee email is present
    if (wasRevoked) {
      await email.sendBusinessReApprovedEmail(
        ownerEmail,
        ownerName,
        businessName,
        jobsRestored
      ).catch(err => console.error("❌ Re-approval email failed:", err));
    } else {
      await email.sendBusinessApprovedEmail(
        ownerEmail,
        ownerName,
        businessName
      ).catch(err => console.error("❌ Approval email failed:", err));
    }

    console.log(`✅ Approval email sent to ${ownerEmail}`);

    res.json({
      success: true,
      message: `"${businessName}" approved successfully. ${jobsRestored} previously revoked job(s) restored to pending.`,
      business,
      jobsRestored,
    });
  } catch (err) {
    console.error("APPROVE BUSINESS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to approve business" });
  }
};

/* =========================================================
   GET ALL BUSINESSES
========================================================= */
exports.getBusinesses = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { role: "business" };

    if (status) query["businessProfile.status"] = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "businessProfile.businessName": { $regex: search, $options: "i" } },
      ];
    }

    const businesses = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ success: true, businesses });
  } catch (err) {
    console.error("GET BUSINESSES ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch businesses" });
  }
};

/* =========================================================
   REJECT BUSINESS
========================================================= */
exports.rejectBusiness = async (req, res) => {
  try {
    const { reason } = req.body;

    const business = await User.findOneAndUpdate(
      { _id: req.params.id, role: "business" },
      { "businessProfile.status": "rejected", "businessProfile.verified": false },
      { new: true }
    ).select("-password");

    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    const businessName = business.businessProfile?.businessName || business.name;

    // ✅ Email business owner — rejected
    email.sendBusinessRejectedEmail(
      business.email,
      business.name,
      businessName,
      reason
    ).catch(console.error);

    res.json({
      success: true,
      message: `"${businessName}" rejected.`,
      business,
    });
  } catch (err) {
    console.error("REJECT BUSINESS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to reject business" });
  }
};

/* =========================================================
   REVOKE BUSINESS
========================================================= */
exports.revokeBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Reset business back to pending
    const business = await User.findOneAndUpdate(
      { _id: id, role: "business" },
      { "businessProfile.status": "pending", "businessProfile.verified": false },
      { new: true }
    ).select("-password");

    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    const businessName = business.businessProfile?.businessName || business.name;

    // 2. Find all recruiters linked to this business
    const linkedRecruiters = await User.find({
      role: "recruiter",
      "recruiterProfile.linkedBusiness": id,
    }).select("_id name email");

    const recruiterIds = linkedRecruiters.map(r => r._id);
    let jobsRevoked = 0;

    if (recruiterIds.length > 0) {
      // 3. Revoke their active/pending jobs
      const jobResult = await Job.updateMany(
        {
          recruiter: { $in: recruiterIds },
          status: { $in: ["approved", "pending_business"] },
        },
        { $set: { status: "revoked" } }
      );
      jobsRevoked = jobResult.modifiedCount;

      // 4. Unlink recruiters
      await User.updateMany(
        { _id: { $in: recruiterIds } },
        { $unset: { "recruiterProfile.linkedBusiness": "" } }
      );

      // 5. Mark links as removed_by_business (this flag is used to detect re-approval later)
      await RecruiterBusinessLink.updateMany(
        { recruiter: { $in: recruiterIds }, business: id, status: "approved" },
        { $set: { status: "removed_by_business", removedAt: new Date() } }
      );

      // ✅ Email each affected recruiter — jobs paused + unlinked
      linkedRecruiters.forEach(recruiter => {
        email.sendRecruiterJobsRevokedEmail(
          recruiter.email,
          recruiter.name,
          businessName,
          jobsRevoked
        ).catch(console.error);
      });
    }

    // ✅ Email business owner — revoked
    email.sendBusinessRevokedEmail(
      business.email,
      business.name,
      businessName
    ).catch(console.error);

    res.json({
      success: true,
      message: `"${businessName}" revoked. ${recruiterIds.length} recruiter(s) unlinked, ${jobsRevoked} job(s) revoked.`,
      business,
      jobsRevoked,
      recruitersUnlinked: recruiterIds.length,
    });
  } catch (err) {
    console.error("REVOKE BUSINESS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to revoke business" });
  }
};