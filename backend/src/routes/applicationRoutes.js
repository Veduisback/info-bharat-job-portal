const express = require("express");

const {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
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
module.exports = router;