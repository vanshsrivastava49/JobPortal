const Job = require("../models/Job");
const User = require("../models/User");
exports.createJob = async (req, res) => {
  try {
    console.log('CREATE JOB - Recruiter:', req.user.id);
    const recruiter = await User.findById(req.user.id).select('recruiterProfile');
    const businessId = recruiter.recruiterProfile?.linkedBusiness;
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Link to approved business first (Dashboard → Request Access)"
      });
    }
    const business = await User.findById(businessId).select('businessProfile');
    if (!business || business.businessProfile?.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: "Linked business not approved"
      });
    }
    const job = await Job.create({
      ...req.body,
      recruiter: req.user.id,
      business: businessId,
      status: "pending_business"
    });

    console.log('Job created:', job._id, 'Business:', businessId);
    
    res.json({
      success: true,
      message: "Job created! Awaiting business owner approval...",
      jobId: job._id
    });
    
  } catch (err) {
    console.error('CREATE JOB ERROR:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to create job" 
    });
  }
};

exports.getBusinessPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 
      business: req.user.id,
      status: "pending_business"
    })
    .populate("recruiter", "name email recruiterProfile.companyName")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (err) {
    console.error('GET PENDING JOBS ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

exports.businessApproveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOneAndUpdate(
      { 
        _id: jobId, 
        business: req.user.id,
        status: "pending_business"
      },
      { 
        status: "approved",
        approvedAt: new Date()
      },
      { new: true }
    ).populate("recruiter", "name recruiterProfile.companyName");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or already processed"
      });
    }

    res.json({
      success: true,
      message: "Job approved and LIVE!",
      job
    });
  } catch (err) {
    console.error('APPROVE JOB ERROR:', err);
    res.status(500).json({ success: false, message: "Approval failed" });
  }
};

exports.businessRejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOneAndUpdate(
      { 
        _id: jobId, 
        business: req.user.id,
        status: "pending_business"
      },
      { 
        status: "rejected_business",
        rejectedAt: new Date()
      },
      { new: true }
    ).populate("recruiter", "name recruiterProfile.companyName");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or already processed"
      });
    }

    res.json({
      success: true,
      message: "Job rejected",
      job
    });
  } catch (err) {
    console.error('REJECT JOB ERROR:', err);
    res.status(500).json({ success: false, message: "Rejection failed" });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .populate("business", "businessProfile.businessName status")
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (err) {
    console.error('MY JOBS ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

exports.getApprovedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" })
      .populate("business", "businessProfile.businessName businessProfile.images")
      .populate("recruiter", "recruiterProfile.companyName")
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (err) {
    console.error('APPROVED JOBS ERROR:', err);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};
exports.getPublicJobs = async (req, res) => {
  try {
    console.log('PUBLIC JOBS REQUEST - Page:', req.query.page, 'Limit:', req.query.limit);
    const allJobs = await Job.find({}).countDocuments();
    console.log(`TOTAL JOBS IN DB: ${allJobs}`);
    const statusCount = await Job.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log('JOBS BY STATUS:', JSON.stringify(statusCount, null, 2));
    const sampleJobs = await Job.find({}).limit(3);
    console.log('SAMPLE JOBS:', JSON.stringify(sampleJobs.map(j => ({
      _id: j._id,
      status: j.status,
      business: j.business,
      createdAt: j.createdAt
    })), null, 2));
    const jobs = await Job.find({ 
      status: { $in: ["approved", "pending_business"] }
    })
    .populate({
      path: 'business',
      select: 'businessProfile.businessName businessProfile.images status name'
    })
    .populate({
      path: 'recruiter', 
      select: 'name recruiterProfile.companyName'
    })
    .select('-__v')
    .sort({ createdAt: -1 })
    .limit(20);

    console.log(`PUBLIC JOBS FOUND: ${jobs.length}`);
    console.log('FIRST JOB:', jobs[0] ? jobs[0].title : 'NONE');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const total = await Job.countDocuments({ 
      status: { $in: ["approved", "pending_business"] } 
    });

    res.json({ 
      success: true, 
      jobs,
      count: jobs.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      debug: {
        allJobsCount: allJobs,
        statusCount,
        sampleJobsCount: sampleJobs.length
      }
    });
  } catch (err) {
    console.error('PUBLIC JOBS ERROR:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch public jobs",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};