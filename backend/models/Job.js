const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Job title is required"],
    trim: true 
  },
  company: String,
  description: { 
    type: String, 
    required: [true, "Job description is required"] 
  },
  location: { 
    type: String, 
    required: [true, "Location is required"] 
  },
  salary: String,
  type: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote']
  },
  skills: [String],
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
    enum: ['pending_business', 'approved', 'rejected_business'],
    default: 'pending_business'
  },
  approvedAt: Date,
  rejectedAt: Date,
  rejectedReason: String
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Job', jobSchema);
