const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const generateToken = require("../utils/generateToken");

// =========================
// REGISTER USER
// CANDIDATE OR RECRUITER
// =========================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "candidate",
      companyName,
      companyDescription,
      companyWebsite,
      companyLocation,
      phone,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    if (!["candidate", "recruiter"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account role",
      });
    }

    if (role === "recruiter" && !companyName?.trim()) {
      return res.status(400).json({
        message: "Company name is required for recruiter registration",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    try {
      if (role === "candidate") {
        await Candidate.create({ user: user._id });
      } else {
        await Recruiter.create({
          user: user._id,
          companyName: companyName.trim(),
          companyDescription: companyDescription?.trim() || "",
          companyWebsite: companyWebsite?.trim() || "",
          companyLocation: companyLocation?.trim() || "",
          phone: phone?.trim() || "",
        });
      }
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      message:
        role === "recruiter"
          ? "Recruiter registration successful"
          : "Candidate registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// =========================
// LOGIN USER
// =========================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
