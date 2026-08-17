const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");

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
      applicationDeadline,
    } = req.body;

    if (!title || !companyName || !location || !description) {
      return res.status(400).json({
        message:
          "Title, company name, location, and description are required",
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

    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      Number(salaryMin) > Number(salaryMax)
    ) {
      return res.status(400).json({
        message: "Minimum salary cannot be greater than maximum salary",
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
      applicationDeadline,
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

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "Open" })
      .populate({
        path: "recruiter",
        select: "companyName companyDescription",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      message: "Server error while fetching jobs",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
};