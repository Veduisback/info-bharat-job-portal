const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      default: 60,
      min: 15,
    },

    interviewType: {
      type: String,
      enum: ["Online", "In-person", "Phone"],
      default: "Online",
    },

    meetingLink: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);