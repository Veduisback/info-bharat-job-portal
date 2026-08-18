const express = require("express");

const {
  scheduleInterview,
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

module.exports = router;