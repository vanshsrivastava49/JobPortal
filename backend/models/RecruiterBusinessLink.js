const mongoose = require('mongoose');

const recruiterBusinessLinkSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectedReason: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('RecruiterBusinessLink', recruiterBusinessLinkSchema);
