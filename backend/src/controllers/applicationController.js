const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");

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

    const job = await Job.findOne({
      _id: jobId,
      status: "open",
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or job is closed",
      });
    }

    const existingApplication = await Application.findOne({
      job: job._id,
      candidate: candidate._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied to this job",
      });
    }

    const application = await Application.create({
      job: job._id,
      candidate: candidate._id,
      coverLetter,
    });

    const populatedApplication = await Application.findById(
      application._id
    )
      .populate("job", "title companyName location")
      .populate(
        "candidate",
        "phone city country skills resume"
      );

    return res.status(201).json({
      message: "Application submitted successfully",
      application: populatedApplication,
    });
  } catch (error) {
    console.error("Apply to job error:", error);

    return res.status(500).json({
      message: "Server error while applying to job",
    });
  }
};
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
      .populate(
        "job",
        "title companyName location salaryMin salaryMax employmentType status applicationDeadline"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error);

    return res.status(500).json({
      message: "Server error while fetching applications",
    });
  }
};
module.exports = {
  applyToJob,
  getMyApplications,
};