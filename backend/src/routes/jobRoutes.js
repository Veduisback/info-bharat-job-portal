const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  closeJob,
  deleteJob,
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Create job
router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  createJob
);

// Get all jobs
router.get("/", getJobs);

// Get single job
router.get("/:id", getJobById);

// Update job
router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  updateJob
);

// Close job
router.patch(
  "/:id/close",
  protect,
  authorizeRoles("recruiter"),
  closeJob
);

// Delete job
router.delete(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  deleteJob
);

module.exports = router;