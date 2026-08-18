const express = require("express");

const {
  applyToJob,
  getMyApplications,
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
module.exports = router;