const fs = require("fs");
const path = require("path");
const Candidate = require("../models/Candidate");
const cloudinary = require("../config/cloudinary");

// =========================
// GET CANDIDATE PROFILE
// =========================

const getProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      user: req.user._id,
    }).populate("user", "name email role");

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate profile not found.",
      });
    }

    return res.status(200).json({
      candidate,
    });
  } catch (error) {
    console.error("Get candidate profile error:", error);

    return res.status(500).json({
      message: "Unable to load candidate profile.",
    });
  }
};

// =========================
// UPDATE CANDIDATE PROFILE
// =========================

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

    const {
      phone,
      dateOfBirth,
      address,
      city,
      country,
      skills,
      education,
      experience,
    } = req.body;

    if (phone !== undefined) {
      candidate.phone = phone;
    }

    if (dateOfBirth !== undefined) {
      candidate.dateOfBirth = dateOfBirth;
    }

    if (address !== undefined) {
      candidate.address = address;
    }

    if (city !== undefined) {
      candidate.city = city;
    }

    if (country !== undefined) {
      candidate.country = country;
    }

    if (skills !== undefined) {
      candidate.skills = Array.isArray(skills) ? skills : [];
    }

    if (education !== undefined) {
      candidate.education = Array.isArray(education)
        ? education
        : [];
    }

    if (experience !== undefined) {
      candidate.experience = Array.isArray(experience)
        ? experience
        : [];
    }

    await candidate.save();

    const updatedCandidate = await Candidate.findById(
      candidate._id,
    ).populate("user", "name email role");

    return res.status(200).json({
      message: "Profile updated successfully.",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Update candidate profile error:", error);

    return res.status(500).json({
      message: "Unable to update candidate profile.",
    });
  }
};

// =========================
// BUILD RESUME DOWNLOAD URL
// =========================

const buildDownloadUrl = (uploadResult, fileName) => {
  const publicId = uploadResult.public_id;

  const safeFileName = fileName
    .toLowerCase()
    .endsWith(".pdf")
    ? fileName
    : `${fileName}.pdf`;

  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload",
    secure: true,
    flags: `attachment:${safeFileName}`,
  });
};

// =========================
// UPLOAD RESUME
// =========================

const uploadResume = async (req, res) => {
  try {
    // -------------------------
    // CHECK FILE
    // -------------------------

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a PDF resume.",
      });
    }

    const originalName = req.file.originalname || "resume.pdf";

    // -------------------------
    // PDF VALIDATION
    // -------------------------

    if (
      req.file.mimetype !== "application/pdf" &&
      path.extname(originalName).toLowerCase() !== ".pdf"
    ) {
      return res.status(400).json({
        message: "Only PDF files are allowed.",
      });
    }

    // -------------------------
    // FILE SIZE
    // -------------------------

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Resume must be smaller than 5 MB.",
      });
    }

    // -------------------------
    // FIND / CREATE CANDIDATE
    // -------------------------

    let candidate = await Candidate.findOne({
      user: req.user._id,
    });

    if (!candidate) {
      candidate = new Candidate({
        user: req.user._id,
      });
    }

    // -------------------------
    // CREATE SAFE FILE NAME
    // -------------------------

    const extension = ".pdf";

    const baseName =
      path
        .basename(
          originalName,
          path.extname(originalName),
        )
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "resume";

    const fileName = originalName
      .toLowerCase()
      .endsWith(".pdf")
      ? originalName
      : `${originalName}.pdf`;

    // -------------------------
    // CLOUDINARY PUBLIC ID
    // -------------------------

    const publicId = `resumes/${req.user._id}/${Date.now()}-${baseName}${extension}`;

    let uploadResult;

    // =========================
    // MULTER DISK STORAGE
    // =========================

    if (req.file.path) {
      uploadResult = await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: "raw",
          type: "upload",
          public_id: publicId,
          overwrite: false,
          invalidate: true,
        },
      );
    }

    // =========================
    // MULTER MEMORY STORAGE
    // =========================

    else if (req.file.buffer) {
      uploadResult = await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                resource_type: "raw",
                type: "upload",
                public_id: publicId,
                overwrite: false,
                invalidate: true,
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              },
            );

          uploadStream.end(req.file.buffer);
        },
      );
    }

    // =========================
    // NO FILE DATA
    // =========================

    else {
      return res.status(400).json({
        message:
          "Unable to read the uploaded resume.",
      });
    }

    // -------------------------
    // DOWNLOAD URL
    // -------------------------

    const downloadUrl = buildDownloadUrl(
      uploadResult,
      fileName,
    );

    // -------------------------
    // SAVE RESUME
    // -------------------------

    candidate.resume = {
      fileName,
      fileUrl: uploadResult.secure_url,
      downloadUrl,
      publicId: uploadResult.public_id,
      resourceType: "raw",
      mimeType: "application/pdf",
    };

    await candidate.save();

    // -------------------------
    // DELETE TEMPORARY FILE
    // -------------------------

    if (req.file.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (fileError) {
        console.warn(
          "Temporary resume file cleanup failed:",
          fileError.message,
        );
      }
    }

    // -------------------------
    // SUCCESS
    // -------------------------

    return res.status(200).json({
      message: "Resume uploaded successfully.",
      resume: candidate.resume,
    });
  } catch (error) {
    console.error(
      "Resume upload error:",
      error,
    );

    // -------------------------
    // CLEANUP ON ERROR
    // -------------------------

    if (req.file?.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (_) {
        // Ignore cleanup errors.
      }
    }

    return res.status(500).json({
      message: "Unable to upload resume.",
    });
  }
};

// =========================
// EXPORTS
// =========================

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
};