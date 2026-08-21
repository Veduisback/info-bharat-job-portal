const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");
const Application = require("../models/Application");

// =========================
// CREATE JOB
// =========================

const createJob = async (req, res) => {
  try {
    const {
      title,
      companyName,
      location,
      salaryMin,
      salaryMax,
      skills,
      experienceRequired,
      description,
      employmentType,
      openings,
      applicationDeadline,
    } = req.body;

    if (
      !title ||
      !companyName ||
      !location ||
      !description
    ) {
      return res.status(400).json({
        message:
          "Title, company name, location and description are required",
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

    const numberOfOpenings = Number(openings);

    if (
      !Number.isInteger(numberOfOpenings) ||
      numberOfOpenings < 1
    ) {
      return res.status(400).json({
        message:
          "Number of openings must be a whole number greater than 0",
      });
    }

    const job = await Job.create({
      recruiter: recruiter._id,
      title,
      companyName,
      location,
      salaryMin,
      salaryMax,
      skills,
      experienceRequired,
      description,
      employmentType,
      openings: numberOfOpenings,
      applicationDeadline,
      status: "open",
    });

    return res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    return res.status(500).json({
      message: "Server error while creating job",
    });
  }
};

// =========================
// GET PUBLIC JOBS
// ONLY OPEN JOBS WITH SLOTS
// =========================

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      status: "open",
    })
      .populate(
        "recruiter",
        "companyName phone city country"
      )
      .sort({ createdAt: -1 });

    const jobsWithSlots = [];

    for (const job of jobs) {
      const hiredCount =
        await Application.countDocuments({
          job: job._id,
          status: "Hired",
        });

      const slotsRemaining = Math.max(
        job.openings - hiredCount,
        0
      );

      // Only show jobs that still have openings
      if (slotsRemaining > 0) {
        jobsWithSlots.push({
          ...job.toObject(),
          hiredCount,
          slotsRemaining,
        });
      }
    }

    return res.status(200).json({
      count: jobsWithSlots.length,
      jobs: jobsWithSlots,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      message: "Server error while fetching jobs",
    });
  }
};

// =========================
// GET SINGLE JOB
// =========================

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "companyName phone city country"
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const hiredCount =
      await Application.countDocuments({
        job: job._id,
        status: "Hired",
      });

    const slotsRemaining = Math.max(
      job.openings - hiredCount,
      0
    );

    return res.status(200).json({
      job: {
        ...job.toObject(),
        hiredCount,
        slotsRemaining,
      },
    });
  } catch (error) {
    console.error("Get job error:", error);

    return res.status(500).json({
      message: "Server error while fetching job",
    });
  }
};

// =========================
// GET RECRUITER JOBS
// =========================

const getRecruiterJobs = async (req, res) => {
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
    }).sort({ createdAt: -1 });

    const jobsWithSlots = await Promise.all(
      jobs.map(async (job) => {
        const hiredCount =
          await Application.countDocuments({
            job: job._id,
            status: "Hired",
          });

        const slotsRemaining = Math.max(
          job.openings - hiredCount,
          0
        );

        return {
          ...job.toObject(),
          hiredCount,
          slotsRemaining,
        };
      })
    );

    return res.status(200).json({
      count: jobsWithSlots.length,
      jobs: jobsWithSlots,
    });
  } catch (error) {
    console.error(
      "Get recruiter jobs error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching recruiter jobs",
    });
  }
};

// =========================
// UPDATE JOB
// =========================

const updateJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({
      user: req.user._id,
    });

    if (!recruiter) {
      return res.status(404).json({
        message: "Recruiter profile not found",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      job.recruiter.toString() !==
      recruiter._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this job",
      });
    }

    const allowedFields = [
      "title",
      "companyName",
      "location",
      "salaryMin",
      "salaryMax",
      "skills",
      "experienceRequired",
      "description",
      "employmentType",
      "openings",
      "applicationDeadline",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    const hiredCount =
      await Application.countDocuments({
        job: job._id,
        status: "Hired",
      });

    if (req.body.openings !== undefined) {
      const numberOfOpenings = Number(
        req.body.openings
      );

      if (
        !Number.isInteger(numberOfOpenings) ||
        numberOfOpenings < 1
      ) {
        return res.status(400).json({
          message:
            "Openings must be a whole number greater than 0",
        });
      }

      if (numberOfOpenings < hiredCount) {
        return res.status(400).json({
          message:
            "Openings cannot be less than candidates already hired",
          hiredCount,
        });
      }

      job.openings = numberOfOpenings;
    }

    // Automatically determine status
    if (hiredCount >= job.openings) {
      job.status = "closed";
    } else {
      job.status = "open";
    }

    await job.save();

    return res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("Update job error:", error);

    return res.status(500).json({
      message: "Server error while updating job",
    });
  }
};

// =========================
// CLOSE JOB MANUALLY
// =========================

const closeJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({
      user: req.user._id,
    });

    if (!recruiter) {
      return res.status(404).json({
        message: "Recruiter profile not found",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      job.recruiter.toString() !==
      recruiter._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to close this job",
      });
    }

    job.status = "closed";

    await job.save();

    return res.status(200).json({
      message: "Job closed successfully",
      job,
    });
  } catch (error) {
    console.error("Close job error:", error);

    return res.status(500).json({
      message: "Server error while closing job",
    });
  }
};

// =========================
// DELETE JOB
// =========================

const deleteJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({
      user: req.user._id,
    });

    if (!recruiter) {
      return res.status(404).json({
        message: "Recruiter profile not found",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      job.recruiter.toString() !==
      recruiter._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    return res.status(500).json({
      message: "Server error while deleting job",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getRecruiterJobs,
  updateJob,
  closeJob,
  deleteJob,
};