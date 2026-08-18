const authRoutes = require("./routes/authRoutes");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
dotenv.config();
const candidateRoutes = require("./routes/candidateRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interviews", interviewRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Info Bharat Job Portal API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});