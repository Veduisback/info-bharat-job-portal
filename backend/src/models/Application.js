const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    coverLetter: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Rejected",
        "Interview",
        "Hired",
      ],
      default: "Applied",
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index(
  { job: 1, candidate: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);