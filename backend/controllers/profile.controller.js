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
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let required = [];
    let progress = 0;

    /* ===== JOBSEEKER ===== */
    if (user.role === "jobseeker") {
      required = [
        "fullName", "mobile", "city",
        "education", "skills",
        "experience", "resume"
      ];
      progress = calculateProgress(required, data);

      if (progress < 100) {
        return res.status(400).json({
          success: false,
          message: "Fill all required fields"
        });
      }
      
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            jobSeekerProfile: {
              ...user.jobSeekerProfile,
              ...data
            },
            profileCompleted: true,
            profileProgress: progress
          }
        }
      );
    }

    if (user.role === "recruiter") {
      required = [
        "companyName", "companyWebsite",
        "companyDescription", "companyLocation",
        "contactNumber", "companyLogo",
        "industryType"
      ];
      progress = calculateProgress(required, data);

      if (progress < 100) {
        return res.status(400).json({
          success: false,
          message: "Fill all required fields"
        });
      }
      
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            recruiterProfile: {
              ...user.recruiterProfile,
              ...data
            },
            profileCompleted: true,
            profileProgress: progress
          }
        }
      );
    }

    if (user.role === "business") {
      required = [
        "businessName", "category",
        "address", "contactDetails",
        "description", "images"
      ];
      progress = calculateProgress(required, data);

      if (!data.images || !Array.isArray(data.images) || data.images.length < 1) {
        return res.status(400).json({
          success: false,
          message: "At least one image URL required"
        });
      }

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            businessProfile: {
              ...user.businessProfile,
              ...data,
              status: "pending"
            },
            profileCompleted: true,
            profileProgress: progress
          }
        }
      );
    }

    if (user.role === "admin") {
      progress = 100;
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            profileCompleted: true,
            profileProgress: 100
          }
        }
      );
    }

    const updatedUser = await User.findById(user._id).select("-password");
    
    res.json({
      success: true,
      message: "Profile completed successfully",
      user: updatedUser,
      progress
    });

  } catch (err) {
    console.error('COMPLETE PROFILE ERROR:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Profile update failed"
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('GET PROFILE ERROR:', err);
    res.status(500).json({ success: false, message: "Profile fetch failed" });
  }
};
exports.uploadResume = async (req, res) => {
  try {
    console.log('RESUME UPLOAD HIT - req.file:', !!req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded (check field name='resume')"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "jobseeker") {
      return res.status(403).json({
        success: false,
        message: "Jobseeker profile required"
      });
    }
    const oldResume = user.jobSeekerProfile?.resume;
    if (oldResume) {
      try {
        const url = new URL(oldResume);
        const key = decodeURIComponent(url.pathname.substring(1));
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key
        }));
        console.log('Old resume deleted');
      } catch (e) {
        console.warn('Skip old resume delete:', e.message);
      }
    }
    const resumeUrl = req.file.location;
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          "jobSeekerProfile.resume": resumeUrl,
          profileProgress: 100,
          profileCompleted: true
        }
      }
    );

    console.log('Resume saved:', resumeUrl);
    res.json({
      success: true,
      resumeUrl,
      message: "Resume uploaded successfully"
    });

  } catch (err) {
    console.error('RESUME ERROR:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Resume upload failed"
    });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    console.log('LOGO UPLOAD HIT - req.file:', !!req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo file uploaded (check field name='logo')"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Recruiter profile required"
      });
    }
    const oldLogo = user.recruiterProfile?.companyLogo;
    if (oldLogo) {
      try {
        const url = new URL(oldLogo);
        const key = decodeURIComponent(url.pathname.substring(1));
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key
        }));
        console.log('Old logo deleted');
      } catch (e) {
        console.warn('Skip old logo delete:', e.message);
      }
    }

    const logoUrl = req.file.location;
    
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          "recruiterProfile.companyLogo": logoUrl,
          profileProgress: 100,
          profileCompleted: true
        }
      }
    );

    console.log('Logo saved:', logoUrl);
    res.json({
      success: true,
      logoUrl,
      message: "Logo uploaded successfully"
    });

  } catch (err) {
    console.error('LOGO ERROR:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Logo upload failed"
    });
  }
};
exports.uploadBusinessImages = async (req, res) => {
  try {
    console.log('BUSINESS IMAGES HIT - req.files:', req.files?.length || 0);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded (check field name='images')"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "business") {
      return res.status(403).json({
        success: false,
        message: "Business profile required"
      });
    }

    const newUrls = req.files.map(file => file.location);
    const existingImages = user.businessProfile?.images || [];
    const allImages = [...existingImages, ...newUrls];

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          "businessProfile.images": allImages,
          "businessProfile.status": "pending",
          profileProgress: 100,
          profileCompleted: true
        }
      }
    );

    console.log('Business images saved:', newUrls.length, 'Total:', allImages.length);
    res.json({
      success: true,
      images: newUrls,
      totalImages: allImages.length,
      message: `${newUrls.length} images uploaded successfully`
    });

  } catch (err) {
    console.error('BUSINESS IMAGES ERROR:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Business images upload failed"
    });
  }
};
exports.getPendingBusinesses = async (req, res) => {
  try {
    const list = await User.find({
      role: "business",
      "businessProfile.status": "pending"
    }).select("name email businessProfile");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.approveBusiness = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { "businessProfile.status": "approved" },
      { new: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.rejectBusiness = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { "businessProfile.status": "rejected" },
      { new: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getApprovedBusinesses = async (req, res) => {
  try {
    const list = await User.find({
      role: "business",
      "businessProfile.status": "approved"
    }).select("businessProfile name");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.requestBusinessLink = async (req, res) => {
  try {
    console.log("🔥 REQUEST ROUTE HIT");
    const { businessId } = req.body;
    const recruiterId = req.user.id;

    const existingLink = await RecruiterBusinessLink.findOne({
      recruiter: recruiterId,
      business: businessId
    });

    if (existingLink) {
      if (existingLink.status === 'approved') {
        return res.json({
          success: true,
          message: "Already linked",
          status: 'approved'
        });
      }
      if (existingLink.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: "Request already pending ⏳"
        });
      }
    }

    const business = await User.findById(businessId);
    if (!business || business.role !== 'business' || business.businessProfile?.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: "Invalid business"
      });
    }

    const linkRequest = new RecruiterBusinessLink({
      recruiter: recruiterId,
      business: businessId
    });
    await linkRequest.save();

    res.json({
      success: true,
      message: "Link request sent!",
      status: 'pending',
      requestId: linkRequest._id
    });

  } catch (err) {
    console.error("Request link ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingRecruiters = async (req, res) => {
  try {
    const businessId = req.user.id;
    const requests = await RecruiterBusinessLink.find({
      business: businessId,
      status: 'pending'
    })
    .populate('recruiter', 'name email recruiterProfile')
    .sort({ requestedAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    linkRequest.status = 'approved';
    linkRequest.approvedAt = new Date();
    await linkRequest.save();

    await User.findByIdAndUpdate(linkRequest.recruiter._id, {
      $set: { "recruiterProfile.linkedBusiness": businessId }
    });

    res.json({
      success: true,
      message: `${linkRequest.recruiter.name} linked to your business!`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.rejectRecruiterLink = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const businessId = req.user.id;

    const linkRequest = await RecruiterBusinessLink.findOne({
      _id: requestId,
      business: businessId,
      status: 'pending'
    });

    if (!linkRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    linkRequest.status = 'rejected';
    linkRequest.rejectedAt = new Date();
    linkRequest.rejectedReason = reason || 'No reason provided';
    await linkRequest.save();

    res.json({
      success: true,
      message: "Recruiter request rejected"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.linkRecruiterToBusiness = async (req, res) => {
  try {
    console.log("ROUTE HIT - /api/profile/recruiter/link-business");
    const { businessId } = req.body;
    
    if (!businessId || !req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Missing businessId or user ID"
      });
    }

    const recruiter = await User.findById(req.user.id);
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Recruiter not found"
      });
    }

    if (recruiter.recruiterProfile?.linkedBusiness) {
      return res.status(400).json({
        success: false,
        message: "Already linked to a business. Unlink first."
      });
    }

    const business = await User.findById(businessId);
    if (!business || business.role !== "business" || business.businessProfile?.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid or unapproved business"
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $set: { "recruiterProfile.linkedBusiness": businessId }
    });

    console.log("Successfully linked recruiter to business:", businessId);
    res.json({
      success: true,
      message: "Successfully linked to business! Can now post jobs.",
      linkedBusiness: businessId
    });

  } catch (err) {
    console.error("Link business ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message 
    });
  }
};

exports.unlinkRecruiterBusiness = async (req, res) => {
  try {
    console.log("Unlink business called");
    
    if (!req.user.id) {
      return res.status(400).json({
        success: false,
        message: "User ID missing"
      });
    }
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { "recruiterProfile.linkedBusiness": 1 }
    });

    console.log("Business unlinked successfully");
    res.json({
      success: true,
      message: "Business unlinked successfully"
    });

  } catch (err) {
    console.error("Unlink business ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message 
    });
  }
};
