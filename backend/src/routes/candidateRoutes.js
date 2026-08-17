const express = require("express");

const {
  getProfile,
  updateProfile,
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

module.exports = router;