const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  closeJob,
  deleteJob,
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
router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  updateJob
);
router.patch(
  "/:id/close",
  protect,
  authorizeRoles("recruiter"),
  closeJob
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  deleteJob
);
module.exports = router;