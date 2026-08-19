const express = require("express");

const {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
  updateApplicationStatus,
  hireCandidate,
} = require("../controllers/applicationController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("candidate"),
  applyToJob
);
router.get(
  "/my",
  protect,
  authorizeRoles("candidate"),
  getMyApplications
);
router.get(
  "/recruiter",
  protect,
  authorizeRoles("recruiter"),
  getRecruiterApplications
);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("recruiter"),
  updateApplicationStatus
);
router.patch(
  "/:id/hire",
  protect,
  authorizeRoles("recruiter"),
  hireCandidate
);
module.exports = router;