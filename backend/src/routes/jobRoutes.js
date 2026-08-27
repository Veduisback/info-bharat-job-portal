const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
  getRecruiterJobs,
  updateJob,
  closeJob,
  deleteJob,
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// CREATE JOB
// =========================

router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  createJob
);

// =========================
// GET ALL PUBLIC JOBS
// =========================

router.get("/", getJobs);

// =========================
// GET RECRUITER'S JOBS
// IMPORTANT: BEFORE /:id
// =========================

router.get(
  "/recruiter",
  protect,
  authorizeRoles("recruiter"),
  getRecruiterJobs
);

// =========================
// GET SINGLE JOB
// =========================

router.get("/:id", getJobById);

// =========================
// UPDATE JOB
// =========================

router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  updateJob
);

// =========================
// CLOSE JOB
// =========================

router.patch(
  "/:id/close",
  protect,
  authorizeRoles("recruiter"),
  closeJob
);

// =========================
// DELETE JOB
// =========================

router.delete(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  deleteJob
);

module.exports = router;