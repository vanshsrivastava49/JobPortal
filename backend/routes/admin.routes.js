const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const adminController = require("../controllers/admin.controller");

const adminOnly = [auth, role("admin")];

// Stats
router.get("/stats", adminOnly, adminController.getStats);

// Users
router.get("/users", adminOnly, adminController.getUsers);
router.get("/users/:id", adminOnly, adminController.getUserById);
router.delete("/users/:id", adminOnly, adminController.deleteUser);

// Jobs
router.get("/jobs", adminOnly, adminController.getJobs);
router.patch("/jobs/:id/status", adminOnly, adminController.updateJobStatus);
router.delete("/jobs/:id", adminOnly, adminController.deleteJob);

// Businesses
router.get("/businesses", adminOnly, adminController.getBusinesses);
router.patch("/businesses/:id/approve", adminOnly, adminController.approveBusiness);
router.patch("/businesses/:id/reject", adminOnly, adminController.rejectBusiness);
router.patch("/businesses/:id/revoke", adminOnly, adminController.revokeBusiness);

module.exports = router;