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
    const {
      search,
      location,
      employmentType,
      minSalary,
      maxSalary,
      experienceRequired,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      status: "open",
    };

    // Search by job title, company name, description, or skills
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    // Location filter
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Employment type filter
    if (employmentType) {
      filter.employmentType = employmentType;
    }

    // Experience filter
    if (experienceRequired) {
      filter.experienceRequired = {
        $regex: experienceRequired,
        $options: "i",
      };
    }

    // Salary filters
    if (minSalary) {
      filter.salaryMax = {
        $gte: Number(minSalary),
      };
    }

    if (maxSalary) {
      filter.salaryMin = {
        $lte: Number(maxSalary),
      };
    }

    // Pagination
    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (currentPage - 1) * itemsPerPage;

    const totalJobs = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate({
        path: "recruiter",
        select: "companyName companyDescription",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage);

    const totalPages = Math.ceil(totalJobs / itemsPerPage);

    return res.status(200).json({
      count: jobs.length,
      totalJobs,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      message: "Server error while fetching jobs",
    });
  }
};
const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      status: "open",
    }).populate({
      path: "recruiter",
      select: "companyName companyDescription",
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.status(200).json({
      job,
    });
  } catch (error) {
    console.error("Get job details error:", error);

    return res.status(500).json({
      message: "Server error while fetching job details",
    });
  }
};
module.exports = {
  createJob,
  getJobs,
  getJobById,
};