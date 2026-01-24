const Application = require("../models/Application");

exports.applyJob = async (req, res) => {
  const application = await Application.create({
    jobId: req.body.jobId,
    jobSeekerId: req.user.id,
    resumeUrl: req.body.resumeUrl
  });
  res.json(application);
};