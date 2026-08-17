const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
} = require("../controllers/jobController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  createJob
);
router.get("/", getJobs);
router.get("/:id", getJobById);

module.exports = router;