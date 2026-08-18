const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Recruiter = require("../models/Recruiter");

const scheduleInterview = async (req, res) => {
  try {
    const {
      applicationId,
      scheduledAt,
      duration,
      interviewType,
      meetingLink,
      location,
      notes,
    } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({
        message: "Application ID and scheduled time are required",
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

    const application = await Application.findById(applicationId)
      .populate("job", "recruiter title companyName")
      .populate("candidate");

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
        message: "You are not authorized to schedule an interview for this application",
      });
    }

    if (application.status !== "Shortlisted") {
      return res.status(400).json({
        message: "Only shortlisted candidates can be scheduled for an interview",
      });
    }

    const existingInterview = await Interview.findOne({
      application: application._id,
    });

    if (existingInterview) {
      return res.status(409).json({
        message: "An interview is already scheduled for this application",
      });
    }

    const interview = await Interview.create({
      application: application._id,
      recruiter: recruiter._id,
      candidate: application.candidate._id,
      scheduledAt,
      duration,
      interviewType,
      meetingLink,
      location,
      notes,
    });

    application.status = "Interview";
    await application.save();

    const populatedInterview = await Interview.findById(interview._id)
      .populate("application", "status coverLetter")
      .populate("candidate")
      .populate("recruiter");

    return res.status(201).json({
      message: "Interview scheduled successfully",
      interview: populatedInterview,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);

    return res.status(500).json({
      message: "Server error while scheduling interview",
    });
  }
};

module.exports = {
  scheduleInterview,
};