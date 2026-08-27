const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getAdminDashboard } = require("../controllers/adminController");

// ADMIN DASHBOARD
router.get(
  "/dashboard",
  authMiddleware,
  getAdminDashboard
);

module.exports = router;