const Candidate = require("../models/Candidate");
const cloudinary = require("../config/cloudinary");
const getProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      user: req.user._id,
    }).populate({
      path: "user",
      select: "name email role",
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    return res.status(200).json({
      candidate,
    });
  } catch (error) {
    console.error("Get candidate profile error:", error);

    return res.status(500).json({
      message: "Server error while fetching candidate profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    let candidate = await Candidate.findOne({
      user: req.user._id,
    });

    if (!candidate) {
      candidate = new Candidate({
        user: req.user._id,
      });
    }

    const allowedFields = [
      "phone",
      "dateOfBirth",
      "address",
      "city",
      "country",
      "skills",
      "education",
      "experience",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        candidate[field] = req.body[field];
      }
    });

    await candidate.save();

    const updatedCandidate = await Candidate.findById(candidate._id).populate({
      path: "user",
      select: "name email role",
    });

    return res.status(200).json({
      message: "Candidate profile updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Update candidate profile error:", error);

    return res.status(500).json({
      message: "Server error while updating candidate profile",
    });
  }
};
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF resume",
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

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "info-bharat/resumes",
          resource_type: "raw",
          public_id: `${req.user._id}-resume`,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    candidate.resume = {
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      uploadedAt: new Date(),
    };

    await candidate.save();

    return res.status(200).json({
      message: "Resume uploaded successfully",
      resume: candidate.resume,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    return res.status(500).json({
      message: "Server error while uploading resume",
    });
  }
};
module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
};