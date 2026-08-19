const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");
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
      .populate(
        "job",
        "title companyName location employmentType"
      )
      .populate({
        path: "candidate",
        select: "phone city country skills education experience resume",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get recruiter applications error:", error);

    return res.status(500).json({
      message: "Server error while fetching recruiter applications",
    });
  }
};
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Rejected",
      "Interview",
      "Hired",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
        allowedStatuses,
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

    const application = await Application.findById(req.params.id)
      .populate("job", "recruiter title companyName")
      .populate("candidate", "user");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (
      application.job.recruiter.toString() !==
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
    });
  }
};
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

    const application = await Application.findById(req.params.id)
      .populate("job", "recruiter title companyName");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (
      application.job.recruiter.toString() !==
      recruiter._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to hire this candidate",
      });
    }

    if (application.status !== "Interview") {
      return res.status(400).json({
        message: "Candidate must be in the Interview stage before hiring",
      });
    }

    application.status = "Hired";
    await application.save();

    return res.status(200).json({
      message: "Candidate hired successfully",
      application,
    });
  } catch (error) {
    console.error("Hire candidate error:", error);

    return res.status(500).json({
      message: "Server error while hiring candidate",
    });
  }
};
module.exports = {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
  updateApplicationStatus,
  hireCandidate,
};