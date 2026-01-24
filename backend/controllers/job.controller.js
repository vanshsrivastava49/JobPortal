const Job = require("../models/Job");
exports.createJob = async (req, res) => {
  const job = await Job.create({
    ...req.body,
    createdBy: req.user.id
  });
  res.json(job);
};
exports.getJobs = async (req, res) => {
  const jobs = await Job.find({ isActive: true }).populate("companyId");
  res.json(jobs);
};