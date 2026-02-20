const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Job  = require("../models/Job");
const RecruiterBusinessLink = require("../models/RecruiterBusinessLink");
const sendEmail = require("../utils/sendEmail");  // ✅ ADD THIS
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// ─── helper so every route is [auth, isAdmin] ────────────────────────────────
const adminOnly = [auth, role("admin")];

// ============================================================================
// GET /api/admin/stats
// Returns all platform counts in one call
// ============================================================================
router.get("/stats", adminOnly, async (req, res) => {
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
      User.countDocuments({ role: "business"  }),
      User.countDocuments({ role: "admin"     }),
      User.countDocuments({ role: "business", "businessProfile.status": "approved" }),
      User.countDocuments({ role: "business", "businessProfile.status": "pending"  }),
      User.countDocuments({ role: "business", "businessProfile.status": "rejected" }),
      Job.countDocuments({ status: "approved"         }),
      Job.countDocuments({ status: "pending_business" }),
      Job.countDocuments({ status: "rejected_business"}),
      User.countDocuments({ profileCompleted: true    }),
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
});

// ============================================================================
// GET /api/admin/users
// All users — optional ?role= filter  ?search= filter
// ============================================================================
router.get("/users", adminOnly, async (req, res) => {
  try {
    const { role: roleFilter, search } = req.query;

    const query = {};

    if (roleFilter && ["jobseeker", "recruiter", "business", "admin"].includes(roleFilter)) {
      query.role = roleFilter;
    }

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(1000);

    res.json(users);
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// ============================================================================
// GET /api/admin/users/:id
// Single user detail
// ============================================================================
router.get("/users/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
});

// ============================================================================
// DELETE /api/admin/users/:id
// Delete a user account
// ============================================================================
router.delete("/users/:id", adminOnly, async (req, res) => {
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
});

// ============================================================================
// GET /api/admin/jobs
// All jobs with optional ?status= filter and ?search=
// ============================================================================
router.get("/jobs", adminOnly, async (req, res) => {
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
      .populate("business",  "name businessProfile")
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ success: true, jobs });
  } catch (err) {
    console.error("GET ALL JOBS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
});

// ============================================================================
// PATCH /api/admin/jobs/:id/status
// Admin can force-approve or force-reject any job
// Body: { status: "approved" | "rejected_business" }
// ============================================================================
router.patch("/jobs/:id/status", adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["approved", "rejected_business", "pending_business"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.json({ success: true, message: `Job status updated to "${status}"`, job });
  } catch (err) {
    console.error("UPDATE JOB STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update job status" });
  }
});

// ============================================================================
// DELETE /api/admin/jobs/:id
// Hard-delete a job listing
// ============================================================================
router.delete("/jobs/:id", adminOnly, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.json({ success: true, message: `Job "${job.title}" deleted` });
  } catch (err) {
    console.error("DELETE JOB ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
});

// ============================================================================
// GET /api/admin/businesses
// All businesses (approved + pending + rejected) with optional ?status= filter
// ============================================================================
router.get("/businesses", adminOnly, async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = { role: "business" };
    if (status) query["businessProfile.status"] = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "businessProfile.businessName": { $regex: search, $options: "i" } },
        { "businessProfile.category":     { $regex: search, $options: "i" } },
      ];
    }

    const businesses = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, businesses });
  } catch (err) {
    console.error("GET ALL BUSINESSES ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch businesses" });
  }
});

// ============================================================================
// PATCH /api/admin/businesses/:id/approve
// Approve a business
// ============================================================================
router.patch("/businesses/:id/approve", adminOnly, async (req, res) => {
  try {
    const business = await User.findOneAndUpdate(
      { _id: req.params.id, role: "business" },
      { "businessProfile.status": "approved", "businessProfile.verified": true },
      { new: true }
    ).select("-password");

    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    res.json({
      success: true,
      message: `"${business.businessProfile?.businessName}" approved successfully`,
      business,
    });
  } catch (err) {
    console.error("APPROVE BUSINESS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to approve business" });
  }
});

// ============================================================================
// PATCH /api/admin/businesses/:id/reject
// Reject a business  Body: { reason: "..." }
// ============================================================================
router.patch("/businesses/:id/reject", adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;

    const business = await User.findOneAndUpdate(
      { _id: req.params.id, role: "business" },
      {
        "businessProfile.status":         "rejected",
        "businessProfile.rejectedReason": reason || "No reason provided",
      },
      { new: true }
    ).select("-password");

    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    res.json({
      success: true,
      message: `"${business.businessProfile?.businessName}" rejected`,
      business,
    });
  } catch (err) {
    console.error("REJECT BUSINESS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to reject business" });
  }
});

router.patch("/businesses/:id/revoke", adminOnly, async (req, res) => {
  try {
    console.log("🔥 REVOKE ROUTE HIT");

    const businessId = req.params.id;

    const business = await User.findOne({
      _id: businessId,
      role: "business",
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.businessProfile?.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved businesses can be revoked",
      });
    }

    // 1️⃣ Reset business status
    business.businessProfile.status = "pending";
    business.businessProfile.verified = false;
    await business.save();

    // 2️⃣ Remove linked recruiters
    await User.updateMany(
      { role: "recruiter", "recruiterProfile.linkedBusiness": businessId },
      { $unset: { "recruiterProfile.linkedBusiness": "" } }
    );

    // 3️⃣ Update link records
    await RecruiterBusinessLink.updateMany(
      { business: businessId, status: "approved" },
      {
        $set: {
          status: "removed_by_business",
          removedAt: new Date(),
        },
      }
    );

    // 4️⃣ SEND EMAIL
    console.log("📧 Sending revoke email to:", business.email);

    await sendEmail({
      to: business.email,
      subject: "⚠️ Business Verification Revoked",
      html: `
        <h2>Hello ${business.name},</h2>
        <p>Your business <strong>${business.businessProfile?.businessName}</strong> verification has been revoked by admin.</p>
        <p>Your account is now set back to <strong>Pending</strong>.</p>
        <p>Please update your details and re-apply.</p>
      `,
    });

    console.log("✅ Revocation email sent successfully");

    res.json({
      success: true,
      message: "Business verification revoked successfully",
    });

  } catch (err) {
    console.error("❌ REVOKE BUSINESS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to revoke business",
    });
  }
});
module.exports = router;