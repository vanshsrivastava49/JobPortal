const Company = require("../models/Company");

exports.verifyCompany = async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { verified: true },
    { new: true }
  );
  res.json(company);
};
