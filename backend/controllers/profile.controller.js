const User = require("../models/User");
const RecruiterBusinessLink = require("../models/RecruiterBusinessLink");
const s3 = require("../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

const calculateProgress = (requiredFields, data) => {
  const filled = requiredFields.filter(
    f => data[f] && data[f].toString().trim() !== ""
  ).length;
  return Math.round((filled / requiredFields.length) * 100);
};

exports.completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const data = req.body;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let required = [];
    let progress = 0;

    if (user.role === "jobseeker") {
      required = ["fullName", "mobile", "city", "education", "skills", "experience", "resume"];
      progress = calculateProgress(required, data);
      if (progress < 100) return res.status(400).json({ success: false, message: "Fill all required fields" });
      await User.updateOne({ _id: user._id }, { $set: { jobSeekerProfile: { ...user.jobSeekerProfile, ...data }, profileCompleted: true, profileProgress: progress } });
    }

    if (user.role === "recruiter") {
      required = ["companyName", "companyWebsite", "companyDescription", "companyLocation", "contactNumber", "companyLogo", "industryType"];
      progress = calculateProgress(required, data);
      if (progress < 100) return res.status(400).json({ success: false, message: "Fill all required fields" });
      await User.updateOne({ _id: user._id }, { $set: { recruiterProfile: { ...user.recruiterProfile, ...data }, profileCompleted: true, profileProgress: progress } });
    }

    if (user.role === "business") {
      required = ["businessName", "category", "address", "contactDetails", "description", "images"];
      progress = calculateProgress(required, data);
      if (!data.images || !Array.isArray(data.images) || data.images.length < 1) {
        return res.status(400).json({ success: false, message: "At least one image URL required" });
      }
      await User.updateOne({ _id: user._id }, { $set: { businessProfile: { ...user.businessProfile, ...data, status: "pending" }, profileCompleted: true, profileProgress: progress } });
    }

    if (user.role === "admin") {
      progress = 100;
      await User.updateOne({ _id: user._id }, { $set: { profileCompleted: true, profileProgress: 100 } });
    }

    const updatedUser = await User.findById(user._id).select("-password");
    res.json({ success: true, message: "Profile completed successfully", user: updatedUser, progress });

  } catch (err) {
    console.error('COMPLETE PROFILE ERROR:', err);
    res.status(500).json({ success: false, message: err.message || "Profile update failed" });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error('GET PROFILE ERROR:', err);
    res.status(500).json({ success: false, message: "Profile fetch failed" });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No resume file uploaded (check field name='resume')" });

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "jobseeker") return res.status(403).json({ success: false, message: "Jobseeker profile required" });

    const oldResume = user.jobSeekerProfile?.resume;
    if (oldResume) {
      try {
        const url = new URL(oldResume);
        const key = decodeURIComponent(url.pathname.substring(1));
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: key }));
      } catch (e) { console.warn('Skip old resume delete:', e.message); }
    }

    const resumeUrl = req.file.location;
    await User.updateOne({ _id: user._id }, { $set: { "jobSeekerProfile.resume": resumeUrl, profileProgress: 100, profileCompleted: true } });
    res.json({ success: true, resumeUrl, message: "Resume uploaded successfully" });

  } catch (err) {
    console.error('RESUME ERROR:', err);
    res.status(500).json({ success: false, message: err.message || "Resume upload failed" });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No logo file uploaded (check field name='logo')" });

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "recruiter") return res.status(403).json({ success: false, message: "Recruiter profile required" });

    const oldLogo = user.recruiterProfile?.companyLogo;
    if (oldLogo) {
      try {
        const url = new URL(oldLogo);
        const key = decodeURIComponent(url.pathname.substring(1));
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: key }));
      } catch (e) { console.warn('Skip old logo delete:', e.message); }
    }

    const logoUrl = req.file.location;
    await User.updateOne({ _id: user._id }, { $set: { "recruiterProfile.companyLogo": logoUrl, profileProgress: 100, profileCompleted: true } });
    res.json({ success: true, logoUrl, message: "Logo uploaded successfully" });

  } catch (err) {
    console.error('LOGO ERROR:', err);
    res.status(500).json({ success: false, message: err.message || "Logo upload failed" });
  }
};

exports.uploadBusinessImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: "No images uploaded (check field name='images')" });

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "business") return res.status(403).json({ success: false, message: "Business profile required" });

    const newUrls = req.files.map(file => file.location);
    const existingImages = user.businessProfile?.images || [];
    const allImages = [...existingImages, ...newUrls];

    await User.updateOne({ _id: user._id }, { $set: { "businessProfile.images": allImages, "businessProfile.status": "pending", profileProgress: 100, profileCompleted: true } });
    res.json({ success: true, images: newUrls, totalImages: allImages.length, message: `${newUrls.length} images uploaded successfully` });

  } catch (err) {
    console.error('BUSINESS IMAGES ERROR:', err);
    res.status(500).json({ success: false, message: err.message || "Business images upload failed" });
  }
};

exports.getPendingBusinesses = async (req, res) => {
  try {
    const list = await User.find({ role: "business", "businessProfile.status": "pending" }).select("name email businessProfile");
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.approveBusiness = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { "businessProfile.status": "approved" }, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.rejectBusiness = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { "businessProfile.status": "rejected" }, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getApprovedBusinesses = async (req, res) => {
  try {
    const list = await User.find({ role: "business", "businessProfile.status": "approved" }).select("businessProfile name");
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.requestBusinessLink = async (req, res) => {
  try {
    const { businessId } = req.body;
    const recruiterId = req.user.id;

    if (!businessId) return res.status(400).json({ success: false, message: "Business ID is required" });

    const existingLink = await RecruiterBusinessLink.findOne({
      recruiter: recruiterId,
      business: businessId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingLink) {
      if (existingLink.status === 'approved') return res.json({ success: true, message: "Already linked to this business", status: 'approved' });
      if (existingLink.status === 'pending') return res.status(400).json({ success: false, message: "Request already pending ⏳" });
    }

    const business = await User.findById(businessId);
    if (!business || business.role !== 'business' || business.businessProfile?.status !== 'approved') {
      return res.status(400).json({ success: false, message: "Invalid or unapproved business" });
    }

    const oldLink = await RecruiterBusinessLink.findOne({
      recruiter: recruiterId,
      business: businessId,
      status: { $in: ['rejected', 'unlinked', 'removed_by_business'] }
    });

    if (oldLink) {
      oldLink.status = 'pending';
      oldLink.requestedAt = new Date();
      oldLink.approvedAt = null;
      oldLink.rejectedAt = null;
      oldLink.rejectedReason = null;
      oldLink.unlinkedAt = null;
      oldLink.removedAt = null;
      await oldLink.save();
      return res.json({ success: true, message: "Link request sent successfully!", status: 'pending', requestId: oldLink._id });
    }

    const linkRequest = new RecruiterBusinessLink({ recruiter: recruiterId, business: businessId, status: 'pending' });
    await linkRequest.save();
    res.json({ success: true, message: "Link request sent successfully!", status: 'pending', requestId: linkRequest._id });

  } catch (err) {
    console.error("Request link ERROR:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to send request" });
  }
};

exports.getPendingRecruiters = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let requests = [];

    if (user.role === 'business') {
      requests = await RecruiterBusinessLink.find({ business: userId, status: 'pending' })
        .populate('recruiter', 'name email recruiterProfile')
        .sort({ requestedAt: -1 });
    } else if (user.role === 'recruiter') {
      requests = await RecruiterBusinessLink.find({ recruiter: userId, status: 'pending' })
        .populate('business', 'name businessProfile')
        .sort({ requestedAt: -1 });
    }

    res.json(requests);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getLinkedRecruiters = async (req, res) => {
  try {
    const businessId = req.user.id;
    const user = await User.findById(businessId);

    if (!user || user.role !== 'business') {
      return res.status(403).json({ success: false, message: "Business account required" });
    }

    const approvedLinks = await RecruiterBusinessLink.find({ business: businessId, status: 'approved' })
      .populate('recruiter', 'name email recruiterProfile')
      .sort({ approvedAt: -1 });

    const recruiters = approvedLinks.map(link => link.recruiter).filter(Boolean);
    res.json(recruiters);

  } catch (err) {
    console.error("Get linked recruiters ERROR:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

exports.approveRecruiterLink = async (req, res) => {
  try {
    const { requestId } = req.params;
    const businessId = req.user.id;

    const linkRequest = await RecruiterBusinessLink.findOne({
      _id: requestId,
      business: businessId,
      status: 'pending'
    }).populate('recruiter');

    if (!linkRequest) {
      return res.status(404).json({ success: false, message: "Request not found or already processed" });
    }

    const business = await User.findById(businessId).select('businessProfile name role');
    if (!business || business.role !== 'business') {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const syncedCompanyDetails = {
      "recruiterProfile.linkedBusiness": businessId,
      "recruiterProfile.companyName": business.businessProfile?.businessName || business.name || "Unknown Company",
      "recruiterProfile.companyWebsite": business.businessProfile?.contactDetails || "",
      "recruiterProfile.companyLocation": business.businessProfile?.address || "",
      "recruiterProfile.companyDescription": business.businessProfile?.description || "",
    };

    // 1. Approve the link
    linkRequest.status = 'approved';
    linkRequest.approvedAt = new Date();
    await linkRequest.save();

    // 2. Re-link recruiter and sync company details
    await User.findByIdAndUpdate(linkRequest.recruiter._id, { $set: syncedCompanyDetails });

    // 3. ✅ Restore previously revoked jobs back to pending_business
    const Job = require("../models/Job");
    const restoredJobs = await Job.updateMany(
      {
        recruiter: linkRequest.recruiter._id,
        business: businessId,
        status: "revoked",
      },
      {
        $set: {
          status: "pending_business",
          business: businessId,  // ensure business ref is correct
        }
      }
    );

    res.json({
      success: true,
      message: `${linkRequest.recruiter.name} linked successfully! ${restoredJobs.modifiedCount} previously revoked job(s) restored for your review.`,
      recruiter: linkRequest.recruiter,
      syncedCompanyName: syncedCompanyDetails["recruiterProfile.companyName"],
      jobsRestored: restoredJobs.modifiedCount,
    });

  } catch (err) {
    console.error("Approve recruiter ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.rejectRecruiterLink = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const businessId = req.user.id;

    const linkRequest = await RecruiterBusinessLink.findOne({ _id: requestId, business: businessId, status: 'pending' });
    if (!linkRequest) return res.status(404).json({ success: false, message: "Request not found or already processed" });

    linkRequest.status = 'rejected';
    linkRequest.rejectedAt = new Date();
    linkRequest.rejectedReason = reason || 'No reason provided';
    await linkRequest.save();

    res.json({ success: true, message: "Recruiter request rejected" });

  } catch (err) {
    console.error("Reject recruiter ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.linkRecruiterToBusiness = async (req, res) => {
  try {
    const { businessId } = req.body;
    if (!businessId || !req.user.id) return res.status(400).json({ success: false, message: "Missing businessId or user ID" });

    const recruiter = await User.findById(req.user.id);
    if (!recruiter || recruiter.role !== "recruiter") return res.status(403).json({ success: false, message: "Recruiter account required" });

    if (recruiter.recruiterProfile?.linkedBusiness) {
      return res.status(400).json({ success: false, message: "Already linked to a business. Please unlink first." });
    }

    const business = await User.findById(businessId);
    if (!business || business.role !== "business" || business.businessProfile?.status !== "approved") {
      return res.status(400).json({ success: false, message: "Invalid or unapproved business" });
    }

    await RecruiterBusinessLink.findOneAndUpdate(
      { recruiter: req.user.id, business: businessId },
      { recruiter: req.user.id, business: businessId, status: 'approved', approvedAt: new Date() },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user.id, { $set: { "recruiterProfile.linkedBusiness": businessId } });

    res.json({ success: true, message: "Successfully linked to business!", linkedBusiness: businessId });

  } catch (err) {
    console.error("Link business ERROR:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

exports.unlinkRecruiterBusiness = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const recruiter = await User.findById(recruiterId);

    if (!recruiter || recruiter.role !== 'recruiter') return res.status(403).json({ success: false, message: "Recruiter account required" });

    const linkedBusinessId = recruiter.recruiterProfile?.linkedBusiness;
    if (!linkedBusinessId) return res.status(400).json({ success: false, message: "No business currently linked" });

    await User.findByIdAndUpdate(recruiterId, { $unset: { "recruiterProfile.linkedBusiness": "" } });

    await RecruiterBusinessLink.updateMany(
      { recruiter: recruiterId, business: linkedBusinessId, status: 'approved' },
      { $set: { status: 'unlinked', unlinkedAt: new Date() } }
    );

    res.json({ success: true, message: "Business unlinked successfully.", unlinkedBusinessId: linkedBusinessId });

  } catch (err) {
    console.error("Unlink business ERROR:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

exports.removeRecruiterFromBusiness = async (req, res) => {
  try {
    const businessId = req.user.id;
    const recruiterId = req.params.recruiterId;

    if (!recruiterId) return res.status(400).json({ success: false, message: "Recruiter ID missing" });

    const business = await User.findById(businessId);
    if (!business || business.role !== 'business') return res.status(403).json({ success: false, message: "Business account required" });

    const recruiter = await User.findById(recruiterId);
    if (!recruiter || recruiter.role !== 'recruiter') return res.status(404).json({ success: false, message: "Recruiter not found" });

    const linkedBusinessId = recruiter.recruiterProfile?.linkedBusiness?.toString();
    if (linkedBusinessId !== businessId) return res.status(400).json({ success: false, message: "This recruiter is not linked to your business" });

    await User.findByIdAndUpdate(recruiterId, { $unset: { "recruiterProfile.linkedBusiness": "" } });

    await RecruiterBusinessLink.updateMany(
      { recruiter: recruiterId, business: businessId, status: 'approved' },
      { $set: { status: 'removed_by_business', removedAt: new Date() } }
    );

    res.json({ success: true, message: "Recruiter removed successfully", recruiterId });

  } catch (err) {
    console.error("Remove recruiter ERROR:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

exports.getLinkedBusinessDetails = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const recruiter = await User.findById(recruiterId);

    if (!recruiter || recruiter.role !== 'recruiter') return res.status(403).json({ success: false, message: "Recruiter account required" });

    const linkedBusinessId = recruiter.recruiterProfile?.linkedBusiness;
    if (!linkedBusinessId) return res.json({ success: true, linked: false, business: null });

    const business = await User.findById(linkedBusinessId).select('name businessProfile');
    if (!business) return res.json({ success: true, linked: false, business: null });

    res.json({
      success: true,
      linked: true,
      business: {
        _id: business._id,
        name: business.businessProfile?.businessName || business.name,
        location: business.businessProfile?.address,
        category: business.businessProfile?.category,
        description: business.businessProfile?.description,
        contactDetails: business.businessProfile?.contactDetails
      }
    });

  } catch (err) {
    console.error("Get linked business ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = exports;