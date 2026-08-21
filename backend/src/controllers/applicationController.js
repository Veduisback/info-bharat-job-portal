const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");

// =========================
// APPLY TO JOB
// =========================

const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required",
      });
    }

    const candidate = await Candidate.findOne({
      user: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        message: "This job is no longer accepting applications",
      });
    }

    // Check if candidate already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: candidate._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      job: jobId,
      candidate: candidate._id,
      coverLetter: coverLetter || "",
      status: "Applied",
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Apply to job error:", error);

    return res.status(500).json({
      message: "Server error while applying for job",
      error: error.message,
    });
  }
};

// =========================
// GET MY APPLICATIONS
// =========================

const getMyApplications = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      user: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    const applications = await Application.find({
      candidate: candidate._id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error);

    return res.status(500).json({
      message: "Server error while fetching applications",
      error: error.message,
    });
  }
};

// =========================
// GET RECRUITER APPLICATIONS
// =========================

const getRecruiterApplications = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({
      user: req.user._id,
    });

    if (!recruiter) {
      return res.status(404).json({
        message: "Recruiter profile not found",
      });
    }

    const jobs = await Job.find({
      recruiter: recruiter._id,
    }).select("_id");

    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({
      job: { $in: jobIds },
    })
      .populate("candidate")
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error("Get recruiter applications error:", error);

    return res.status(500).json({
      message: "Server error while fetching recruiter applications",
      error: error.message,
    });
  }
};

// =========================
// UPDATE APPLICATION STATUS
// =========================

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const recruiter = await Recruiter.findOne({
      user: req.user._id,
    });

    if (!recruiter) {
      return res.status(404).json({
        message: "Recruiter profile not found",
      });
    }

    const application = await Application.findById(
      req.params.id
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const job = application.job;

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Make sure recruiter owns this job
    if (
      job.recruiter.toString() !==
      recruiter._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to update this application",
      });
    }

    application.status = status;

    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error);

    return res.status(500).json({
      message: "Server error while updating application status",
      error: error.message,
    });
  }
};

// =========================
// HIRE CANDIDATE
// =========================

const hireCandidate = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({
      user: req.user._id,
    });

    if (!recruiter) {
      return res.status(404).json({
        message: "Recruiter profile not found",
      });
    }

    const application = await Application.findById(
      req.params.id
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const job = application.job;

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Make sure this recruiter owns the job
    if (
      job.recruiter.toString() !==
      recruiter._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to hire for this job",
      });
    }

    // Don't hire the same candidate twice
    if (application.status === "Hired") {
      return res.status(400).json({
        message: "This candidate has already been hired",
      });
    }

    // Don't hire after job is closed
    if (job.status === "closed") {
      return res.status(400).json({
        message:
          "This job is already closed because all openings have been filled",
      });
    }

    // Count currently hired candidates
    const hiredCount = await Application.countDocuments({
      job: job._id,
      status: "Hired",
    });

    // Check available slots
    if (hiredCount >= job.openings) {
      job.status = "closed";
      await job.save();

      return res.status(400).json({
        message:
          "All openings for this job have already been filled",
      });
    }

    // Hire candidate
    application.status = "Hired";
    await application.save();

    // Calculate new count
    const newHiredCount =
      await Application.countDocuments({
        job: job._id,
        status: "Hired",
      });

    const slotsRemaining = Math.max(
      job.openings - newHiredCount,
      0
    );

    // Close only when ALL openings are filled
    if (newHiredCount >= job.openings) {
      job.status = "closed";
    } else {
      job.status = "open";
    }

    await job.save();

    return res.status(200).json({
      message:
        job.status === "closed"
          ? "Candidate hired successfully and all job openings are filled. Job closed."
          : "Candidate hired successfully",
      application,
      job: {
        _id: job._id,
        openings: job.openings,
        hiredCount: newHiredCount,
        slotsRemaining,
        status: job.status,
      },
    });
  } catch (error) {
    console.error("Hire candidate error:", error);

    return res.status(500).json({
      message: "Server error while hiring candidate",
      error: error.message,
    });
  }
};

// =========================
// EXPORT CONTROLLERS
// =========================

module.exports = {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
  updateApplicationStatus,
  hireCandidate,
};