const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const {
  sendApplicationConfirmation,
  sendNewApplicationAlert,
  sendShortlistEmail,
  sendRoundPassedEmail,
  sendRoundRejectedEmail,
  sendRejectionEmail,
  sendHiredEmail,
  sendApplicationWithdrawnNotice,
} = require("../services/emailService");

/* =========================================================
   JOBSEEKER - SUBMIT APPLICATION
========================================================= */
exports.submitApplication = async (req, res) => {
  try {
    const jobseekerId = req.user.id;
    const { jobId, coverLetter, selectedSkills } = req.body;

    if (!jobId || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: "jobId and coverLetter are required",
      });
    }

    // Fetch jobseeker profile
    const jobseeker = await User.findById(jobseekerId).select("-password");
    if (!jobseeker || jobseeker.role !== "jobseeker") {
      return res.status(403).json({ success: false, message: "Jobseeker account required" });
    }

    // Must have resume uploaded
    const resumeUrl = jobseeker.jobSeekerProfile?.resume;
    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume before applying",
        code: "NO_RESUME",
      });
    }

    // Fetch job (must be approved and open)
    const job = await Job.findOne({ _id: jobId, status: "approved", isOpen: true })
      .populate("recruiter", "name email")
      .populate("business", "name businessProfile");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or no longer accepting applications",
      });
    }

    // Check duplicate
    const existing = await Application.findOne({ job: jobId, jobseeker: jobseekerId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
        code: "ALREADY_APPLIED",
      });
    }

    // Build applicant snapshot
    const profile = jobseeker.jobSeekerProfile || {};
    const applicantSnapshot = {
      fullName:
        profile.fullName ||
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
        jobseeker.name,
      email: jobseeker.email,
      mobile: profile.mobile || jobseeker.mobile || "",
      city: profile.city || "",
      education: profile.education || "",
      experience: profile.experience || "",
      linkedin: profile.linkedin || "",
      portfolio: profile.portfolio || "",
    };

    // Validate selectedSkills
    const validSelected = Array.isArray(selectedSkills)
      ? selectedSkills.filter((s) => typeof s === "string" && s.trim())
      : [];

    const application = await Application.create({
      job: jobId,
      jobseeker: jobseekerId,
      recruiter: job.recruiter._id,
      business: job.business._id,
      applicantSnapshot,
      selectedSkills: validSelected,
      coverLetter: coverLetter.trim(),
      resumeUrl,
      status: "applied",
    });

    const companyName =
      job.business?.businessProfile?.businessName || job.company || "the company";

    // Email jobseeker — confirmation
    sendApplicationConfirmation(
      jobseeker.email,
      applicantSnapshot.fullName || jobseeker.name,
      job.title,
      companyName
    ).catch(console.error);

    // Email recruiter — new application alert
    sendNewApplicationAlert(
      job.recruiter.email,
      job.recruiter.name,
      job.title,
      applicantSnapshot.fullName,
      applicantSnapshot.email
    ).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application: {
        _id: application._id,
        status: application.status,
        jobTitle: job.title,
        company: companyName,
        appliedAt: application.createdAt,
      },
    });
  } catch (err) {
    console.error("SUBMIT APPLICATION ERROR:", err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Already applied for this job" });
    }
    res
      .status(500)
      .json({ success: false, message: err.message || "Failed to submit application" });
  }
};

/* =========================================================
   JOBSEEKER - GET MY APPLICATIONS (with tracking info)
========================================================= */
exports.getMyApplications = async (req, res) => {
  try {
    const jobseekerId = req.user.id;

    const applications = await Application.find({ jobseeker: jobseekerId })
      .populate({
        path: "job",
        select: "title location type company skills rounds isOpen status",
        populate: {
          path: "business",
          select: "businessProfile.businessName name businessProfile.images",
        },
      })
      .populate("recruiter", "name email recruiterProfile.companyName")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications, count: applications.length });
  } catch (err) {
    console.error("GET MY APPLICATIONS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

/* =========================================================
   JOBSEEKER - WITHDRAW APPLICATION
========================================================= */
exports.withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const jobseekerId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      jobseeker: jobseekerId,
    })
      .populate("job", "title")
      .populate("recruiter", "name email");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (["rejected", "hired", "withdrawn"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that is already ${application.status}`,
      });
    }

    application.status = "withdrawn";
    application.withdrawnAt = new Date();
    await application.save();

    // Notify recruiter
    const jobseeker = await User.findById(jobseekerId).select(
      "name email jobSeekerProfile"
    );
    const applicantName =
      jobseeker?.jobSeekerProfile?.fullName || jobseeker?.name;

    sendApplicationWithdrawnNotice(
      application.recruiter.email,
      application.recruiter.name,
      application.job.title,
      applicantName
    ).catch(console.error);

    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("WITHDRAW APPLICATION ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to withdraw application" });
  }
};

/* =========================================================
   RECRUITER - GET APPLICATIONS FOR MY JOBS
========================================================= */
exports.getRecruiterApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { jobId, status } = req.query;

    const filter = { recruiter: recruiterId };
    if (jobId) filter.job = jobId;
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate("job", "title location type company")
      .populate("jobseeker", "name email jobSeekerProfile")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications, count: applications.length });
  } catch (err) {
    console.error("GET RECRUITER APPS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

/* =========================================================
   RECRUITER - GET SINGLE APPLICATION DETAIL
========================================================= */
exports.getApplicationDetail = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const recruiterId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      recruiter: recruiterId,
    })
      .populate("job", "title location type company skills rounds description")
      .populate("jobseeker", "name email jobSeekerProfile");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Mark as under_review on first open
    if (application.status === "applied") {
      application.status = "under_review";
      application.reviewedAt = new Date();
      await application.save();
    }

    res.json({ success: true, application });
  } catch (err) {
    console.error("GET APP DETAIL ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch application" });
  }
};

/* =========================================================
   RECRUITER - SHORTLIST APPLICANT
========================================================= */
exports.shortlistApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { note } = req.body;
    const recruiterId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      recruiter: recruiterId,
    })
      .populate("job", "title company rounds")
      .populate("jobseeker", "name email jobSeekerProfile");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status === "rejected") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot shortlist a rejected application" });
    }

    application.status = "shortlisted";
    application.shortlistedAt = new Date();
    application.currentRound = 1;

    // Add first round update if job has rounds
    const firstRound = application.job.rounds?.[0];
    if (firstRound) {
      application.roundUpdates.push({
        roundNumber: 1,
        roundTitle: firstRound.title || firstRound.type,
        roundType: firstRound.type,
        result: "scheduled",
        note:
          note ||
          `You have been shortlisted for ${application.job.title}. The first round is ${firstRound.title || firstRound.type}.`,
        updatedAt: new Date(),
      });
    }

    await application.save();

    const applicantName =
      application.jobseeker?.jobSeekerProfile?.fullName || application.jobseeker?.name;
    const companyName = application.job.company;

    sendShortlistEmail(
      application.jobseeker.email,
      applicantName,
      application.job.title,
      companyName,
      firstRound ? firstRound.title || firstRound.type : null,
      note
    ).catch(console.error);

    res.json({
      success: true,
      message: "Applicant shortlisted successfully",
      application,
    });
  } catch (err) {
    console.error("SHORTLIST ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to shortlist applicant" });
  }
};

/* =========================================================
   RECRUITER - UPDATE ROUND RESULT
========================================================= */
exports.updateRoundResult = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { roundNumber, result, note, advanceToNext } = req.body;
    const recruiterId = req.user.id;

    if (!["passed", "failed", "pending", "scheduled"].includes(result)) {
      return res.status(400).json({ success: false, message: "Invalid result value" });
    }

    const application = await Application.findOne({
      _id: applicationId,
      recruiter: recruiterId,
    })
      .populate("job", "title company rounds")
      .populate("jobseeker", "name email jobSeekerProfile");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const job = application.job;
    const rounds = job.rounds || [];
    const roundIndex = roundNumber - 1;
    const currentRoundData = rounds[roundIndex];

    // Update or push round update
    const existingUpdateIdx = application.roundUpdates.findIndex(
      (r) => r.roundNumber === roundNumber
    );

    const roundUpdate = {
      roundNumber,
      roundTitle:
        currentRoundData?.title || currentRoundData?.type || `Round ${roundNumber}`,
      roundType: currentRoundData?.type || "other",
      result,
      note: note || "",
      updatedAt: new Date(),
    };

    if (existingUpdateIdx >= 0) {
      application.roundUpdates[existingUpdateIdx] = roundUpdate;
    } else {
      application.roundUpdates.push(roundUpdate);
    }

    const applicantName =
      application.jobseeker?.jobSeekerProfile?.fullName || application.jobseeker?.name;
    const companyName = job.company;

    if (result === "failed") {
      application.status = "rejected";
      application.rejectedAt = new Date();
      application.rejectionReason = note || `Did not pass Round ${roundNumber}`;

      sendRoundRejectedEmail(
        application.jobseeker.email,
        applicantName,
        job.title,
        companyName,
        roundUpdate.roundTitle,
        note
      ).catch(console.error);
    } else if (result === "passed") {
      const nextRound = rounds[roundIndex + 1];

      if (advanceToNext && nextRound) {
        application.currentRound = roundNumber + 1;
        application.status = "round_update";

        application.roundUpdates.push({
          roundNumber: roundNumber + 1,
          roundTitle: nextRound.title || nextRound.type,
          roundType: nextRound.type,
          result: "scheduled",
          note: `You have advanced to Round ${roundNumber + 1}: ${nextRound.title || nextRound.type}`,
          updatedAt: new Date(),
        });

        sendRoundPassedEmail(
          application.jobseeker.email,
          applicantName,
          job.title,
          companyName,
          roundUpdate.roundTitle,
          nextRound.title || nextRound.type,
          roundNumber + 1,
          note
        ).catch(console.error);
      } else if (!nextRound) {
        application.status = "hired";
        application.hiredAt = new Date();

        sendHiredEmail(
          application.jobseeker.email,
          applicantName,
          job.title,
          companyName,
          note
        ).catch(console.error);
      }
    }

    await application.save();

    res.json({ success: true, message: "Round result updated", application });
  } catch (err) {
    console.error("UPDATE ROUND ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update round result" });
  }
};

/* =========================================================
   RECRUITER - REJECT APPLICANT OUTRIGHT
========================================================= */
exports.rejectApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;
    const recruiterId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      recruiter: recruiterId,
    })
      .populate("job", "title company")
      .populate("jobseeker", "name email jobSeekerProfile");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (["rejected", "hired", "withdrawn"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    application.status = "rejected";
    application.rejectedAt = new Date();
    application.rejectionReason = reason || "Not selected at this time";
    await application.save();

    const applicantName =
      application.jobseeker?.jobSeekerProfile?.fullName || application.jobseeker?.name;

    sendRejectionEmail(
      application.jobseeker.email,
      applicantName,
      application.job.title,
      application.job.company,
      reason
    ).catch(console.error);

    res.json({ success: true, message: "Applicant rejected", application });
  } catch (err) {
    console.error("REJECT APPLICANT ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to reject applicant" });
  }
};

/* =========================================================
   RECRUITER - UPDATE INTERNAL NOTES / RATING
========================================================= */
exports.updateApplicationNotes = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { internalNotes, recruiterRating } = req.body;
    const recruiterId = req.user.id;

    const application = await Application.findOneAndUpdate(
      { _id: applicationId, recruiter: recruiterId },
      {
        $set: {
          ...(internalNotes !== undefined && { internalNotes }),
          ...(recruiterRating !== undefined && { recruiterRating }),
        },
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, message: "Notes updated", application });
  } catch (err) {
    console.error("UPDATE NOTES ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update notes" });
  }
};

/* =========================================================
   ADMIN - ALL APPLICATIONS
========================================================= */
exports.getAllApplications = async (req, res) => {
  try {
    const { status, jobId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;

    const applications = await Application.find(filter)
      .populate("job", "title company location")
      .populate("jobseeker", "name email")
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ success: true, applications, count: applications.length });
  } catch (err) {
    console.error("ADMIN GET APPS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

/* =========================================================
   JOBSEEKER - CHECK IF ALREADY APPLIED
========================================================= */
exports.checkApplied = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobseekerId = req.user.id;

    const application = await Application.findOne({
      job: jobId,
      jobseeker: jobseekerId,
    }).select("status _id");

    res.json({
      success: true,
      applied: !!application,
      status: application?.status || null,
      applicationId: application?._id || null,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to check application status" });
  }
};