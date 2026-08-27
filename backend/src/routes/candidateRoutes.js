const express = require("express");

const {
  getProfile,
  updateProfile,
  uploadResume,
} = require("../controllers/candidateController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =========================
// GET CANDIDATE PROFILE
// =========================

router.get(
  "/profile",
  protect,
  authorizeRoles("candidate"),
  getProfile,
);

// =========================
// UPDATE CANDIDATE PROFILE
// =========================

router.put(
  "/profile",
  protect,
  authorizeRoles("candidate"),
  updateProfile,
);

// =========================
// UPLOAD RESUME
// =========================

router.post(
  "/profile/resume",
  protect,
  authorizeRoles("candidate"),
  upload.single("resume"),
  uploadResume,
);

module.exports = router;