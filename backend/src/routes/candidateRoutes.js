const upload = require("../middleware/uploadMiddleware");
const express = require("express");

const {
  getProfile,
  updateProfile,
  uploadResume,
} = require("../controllers/candidateController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/profile",
  protect,
  authorizeRoles("candidate"),
  getProfile
);

router.put(
  "/profile",
  protect,
  authorizeRoles("candidate"),
  updateProfile
);
router.post(
  "/profile/resume",
  protect,
  authorizeRoles("candidate"),
  upload.single("resume"),
  uploadResume
);
module.exports = router;