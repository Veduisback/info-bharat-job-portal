const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to the same MongoDB used by the main application
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    // Change these if you want different admin credentials
    const email = "admin@infobharat.com";
    const password = "Admin@12345";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists.");
      console.log("Email:", email);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await User.create({
      name: "Info Bharat Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("\n=================================");
    console.log("ADMIN CREATED SUCCESSFULLY");
    console.log("=================================");
    console.log("Email:", admin.email);
    console.log("Password:", password);
    console.log("Role:", admin.role);
    console.log("=================================\n");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error creating admin:", error.message);
    await mongoose.disconnect();
  }
};

createAdmin();