const express = require("express");

const {
  scheduleInterview,
  getMyInterviews,
  updateInterviewStatus,
} = require("../controllers/interviewController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  scheduleInterview
);
router.get(
  "/my",
  protect,
  authorizeRoles("candidate"),
  getMyInterviews
);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("recruiter"),
  updateInterviewStatus
);

module.exports = router;