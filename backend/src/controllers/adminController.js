const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const Job = require("../models/Job");
const Application = require("../models/Application");

const getAdminDashboard = async (req, res) => {
  try {
    // Make sure only admins can access this endpoint
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Administrator access required.",
      });
    }

    const [
      candidates,
      recruiters,
      jobs,
      applications,
      hired,
    ] = await Promise.all([
      Candidate.countDocuments(),
      Recruiter.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: "Hired" }),
    ]);

    // Application status statistics
    const statusResults = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const applicationStats = {
      Applied: 0,
      Shortlisted: 0,
      Interview: 0,
      Hired: 0,
      Rejected: 0,
    };

    statusResults.forEach((item) => {
      if (item._id) {
        applicationStats[item._id] = item.count;
      }
    });

    // Recent users
    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Convert users into activity records
    const activity = recentUsers.map((user) => ({
      _id: user._id,
      action:
        user.role === "candidate"
          ? "Candidate registered"
          : user.role === "recruiter"
            ? "Recruiter registered"
            : "User registered",
      description: `${user.name || "User"} created an account.`,
      createdAt: user.createdAt,
    }));

    res.json({
      stats: {
        candidates,
        recruiters,
        jobs,
        applications,
        hired,
      },

      applicationStats,

      activity,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      message: "Unable to load admin dashboard.",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
};