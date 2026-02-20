const Job = require("../models/Job");
const User = require("../models/User");

/* ===============================
   RECRUITER POSTS JOB → PENDING BUSINESS
=============================== */
exports.createJob = async (req, res) => {
  try {
    console.log('🔥 CREATE JOB - Recruiter:', req.user.id);

    const recruiter = await User.findById(req.user.id).select('recruiterProfile');

    // ✅ Check business linkage
    const businessId = recruiter.recruiterProfile?.linkedBusiness;
    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "Link to an approved business first (Dashboard → Request Access)",
        code: "NO_BUSINESS_LINK"
      });
    }

    // ✅ Get business details
    const business = await User.findById(businessId).select('businessProfile name');
    if (!business || business.businessProfile?.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: "Linked business is not approved yet",
        code: "BUSINESS_NOT_APPROVED"
      });
    }

    // ✅ AUTO-FILL: Use business name (NOT recruiter input)
    const companyName = business.businessProfile?.businessName || business.name || "Unknown Company";

    const {
      title,
      location,
      type,
      description,
      skills,
      isPaid,
      stipend,
      stipendPeriod,
      rounds,
    } = req.body;

    // ✅ Validate required fields
    if (!title || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, location and description are required",
        code: "MISSING_FIELDS"
      });
    }

    // ✅ Validate skills array
    const skillsArray = Array.isArray(skills)
      ? skills.filter(s => typeof s === 'string' && s.trim())
      : typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    // ✅ Validate rounds
    const roundsArray = Array.isArray(rounds)
      ? rounds.map((r, i) => ({
          order: r.order || i + 1,
          type: r.type || 'other',
          title: r.title || '',
          description: r.description || '',
          duration: r.duration || '',
        }))
      : [];

    // ✅ Build job document
    const jobData = {
      title: title.trim(),
      company: companyName,
      location: location.trim(),
      type: type || 'Full Time',
      description: description.trim(),
      skills: skillsArray,
      isPaid: isPaid !== false,
      stipend: isPaid !== false ? (stipend || '').trim() : '',
      stipendPeriod: isPaid !== false ? (stipendPeriod || 'monthly') : '',
      rounds: roundsArray,
      recruiter: req.user.id,
      business: businessId,
      status: "pending_business"
    };

    const job = await Job.create(jobData);

    console.log('✅ Job created:', job._id, 'Company:', companyName);

    res.status(201).json({
      success: true,
      message: "Job created! Awaiting business owner approval.",
      job: {
        _id: job._id,
        title: job.title,
        company: companyName,
        status: job.status
      }
    });

  } catch (err) {
    console.error('❌ CREATE JOB ERROR:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map(e => e.message).join(', '),
        code: "VALIDATION_ERROR"
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create job",
      code: "SERVER_ERROR"
    });
  }
};

/* ===============================
   RECRUITER - UPDATE JOB
=============================== */
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, recruiter: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status === 'taken_down') {
      return res.status(400).json({ success: false, message: "Cannot edit a taken-down job. Repost it instead." });
    }

    const {
      title, location, type, description,
      skills, isPaid, stipend, stipendPeriod, rounds
    } = req.body;

    const skillsArray = Array.isArray(skills)
      ? skills.filter(s => s.trim())
      : typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : job.skills;

    const roundsArray = Array.isArray(rounds)
      ? rounds.map((r, i) => ({
          order: r.order || i + 1,
          type: r.type || 'other',
          title: r.title || '',
          description: r.description || '',
          duration: r.duration || '',
        }))
      : job.rounds;

    const updated = await Job.findByIdAndUpdate(
      jobId,
      {
        title: (title || job.title).trim(),
        location: (location || job.location).trim(),
        type: type || job.type,
        description: (description || job.description).trim(),
        skills: skillsArray,
        isPaid: isPaid !== undefined ? isPaid : job.isPaid,
        stipend: (isPaid !== false) ? (stipend || '').trim() : '',
        stipendPeriod: (isPaid !== false) ? (stipendPeriod || job.stipendPeriod) : '',
        rounds: roundsArray,
        // Re-submit for approval on edit
        status: job.status === 'approved' ? 'pending_business' : job.status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: updated.status === 'pending_business'
        ? "Job updated and resubmitted for business approval."
        : "Job updated successfully.",
      job: updated
    });

  } catch (err) {
    console.error('❌ UPDATE JOB ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to update job" });
  }
};

/* ===============================
   RECRUITER - TAKE DOWN LIVE JOB
=============================== */
exports.takedownJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOneAndUpdate(
      {
        _id: jobId,
        recruiter: req.user.id,
        status: "approved"
      },
      {
        status: "taken_down",
        takenDownAt: new Date()
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found, not live, or you don't have permission"
      });
    }

    console.log('✅ Job taken down:', job._id);

    res.json({
      success: true,
      message: "Job taken offline successfully. It is no longer visible to job seekers.",
      job: { _id: job._id, title: job.title, status: job.status }
    });

  } catch (err) {
    console.error('❌ TAKEDOWN JOB ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to take down job" });
  }
};

/* ===============================
   RECRUITER - GET SINGLE JOB (for edit page)
=============================== */
exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, recruiter: req.user.id })
      .populate('business', 'businessProfile.businessName name');

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, job });
  } catch (err) {
    console.error('❌ GET JOB ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to fetch job" });
  }
};

/* ===============================
   BUSINESS OWNER - PENDING JOBS
=============================== */
exports.getBusinessPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      business: req.user.id,
      status: "pending_business"
    })
      .populate("recruiter", "name email recruiterProfile.companyName")
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs, count: jobs.length });
  } catch (err) {
    console.error('❌ GET PENDING JOBS ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

/* ===============================
   BUSINESS OWNER - APPROVE JOB → LIVE
=============================== */
exports.businessApproveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOneAndUpdate(
      { _id: jobId, business: req.user.id, status: "pending_business" },
      { status: "approved", approvedAt: new Date() },
      { new: true }
    ).populate("recruiter", "name recruiterProfile.companyName");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found or already processed" });
    }

    res.json({ success: true, message: "Job approved and LIVE!", job });
  } catch (err) {
    console.error('❌ APPROVE JOB ERROR:', err);
    res.status(500).json({ success: false, message: "Approval failed" });
  }
};

/* ===============================
   BUSINESS OWNER - REJECT JOB
=============================== */
exports.businessRejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOneAndUpdate(
      { _id: jobId, business: req.user.id, status: "pending_business" },
      { status: "rejected_business", rejectedAt: new Date() },
      { new: true }
    ).populate("recruiter", "name recruiterProfile.companyName");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found or already processed" });
    }

    res.json({ success: true, message: "Job rejected", job });
  } catch (err) {
    console.error('❌ REJECT JOB ERROR:', err);
    res.status(500).json({ success: false, message: "Rejection failed" });
  }
};

/* ===============================
   RECRUITER - MY JOBS
=============================== */
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .populate("business", "businessProfile.businessName status")
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (err) {
    console.error('❌ MY JOBS ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

/* ===============================
   JOBSEEKERS - LIVE JOBS (authenticated)
=============================== */
exports.getApprovedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" })
      .populate("business", "businessProfile.businessName businessProfile.images")
      .populate("recruiter", "recruiterProfile.companyName")
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (err) {
    console.error('❌ APPROVED JOBS ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

/* ===============================
   PUBLIC - LIVE JOBS (no auth, paginated)
=============================== */
exports.getPublicJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Optional filters
    const filter = { status: "approved" };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.location) filter.location = new RegExp(req.query.location, 'i');
    if (req.query.isPaid !== undefined) filter.isPaid = req.query.isPaid === 'true';
    if (req.query.skill) filter.skills = { $in: [new RegExp(req.query.skill, 'i')] };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate({
          path: 'business',
          select: 'businessProfile.businessName businessProfile.images name'
        })
        .populate({
          path: 'recruiter',
          select: 'name recruiterProfile.companyName'
        })
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter)
    ]);

    res.json({
      success: true,
      jobs,
      count: jobs.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });
  } catch (err) {
    console.error('❌ PUBLIC JOBS ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to fetch public jobs" });
  }
};
/* ===============================
   PUBLIC - SINGLE LIVE JOB (no auth)
=============================== */
exports.getPublicJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate ObjectId
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid job ID' 
      });
    }

    const job = await Job.findOne({ 
      _id: jobId, 
      status: 'approved'  // Only public approved jobs
    })
    .populate('business', 'businessProfile.businessName businessProfile.images name')
    .populate('recruiter', 'recruiterProfile.companyName name')
    .select('-__v');

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found or not live' 
      });
    }

    res.json({ 
      success: true, 
      job 
    });
  } catch (err) {
    console.error('❌ PUBLIC JOB DETAIL ERROR:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
