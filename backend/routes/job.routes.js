const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { 
  createJob, updateJob, takedownJob, getJobById,
  getBusinessPendingJobs, businessApproveJob, businessRejectJob,
  getMyJobs, getApprovedJobs, getPublicJobs, getPublicJobById,
  toggleJobStatus
} = require('../controllers/job.controller');

// ─── PUBLIC (no auth) ───────────────────────────────────────
router.get('/public',        getPublicJobs);
router.get('/public/:jobId', getPublicJobById);

// ─── NAMED STATIC ROUTES FIRST ─────────────────────────────
router.get('/',        getApprovedJobs);
router.get('/pending', auth, role('business'),  getBusinessPendingJobs);
router.get('/my',      auth, role('recruiter'), getMyJobs);

// ─── DYNAMIC :jobId ROUTES ─────────────────────────────────
// Recruiter actions
router.post('/',                        auth, role('recruiter'), createJob);
router.get('/:jobId',                   auth, role('recruiter'), getJobById);
router.patch('/:jobId',                 auth, role('recruiter'), updateJob);
router.patch('/:jobId/toggle-status',   auth, role('recruiter'), toggleJobStatus);
router.patch('/:jobId/takedown',        auth, role('recruiter'), takedownJob);

// Business actions  
router.patch('/:jobId/business-approve', auth, role('business'), businessApproveJob);
router.patch('/:jobId/business-reject',  auth, role('business'), businessRejectJob);

module.exports = router;