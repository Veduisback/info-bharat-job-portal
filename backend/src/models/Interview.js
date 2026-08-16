const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    interviewType: {
      type: String,
      enum: ["Online", "In-person", "Phone"],
      default: "Online",
    },

    location: {
      type: String,
      trim: true,
    },

    meetingLink: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Passed", "Failed"],
      default: "Scheduled",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);