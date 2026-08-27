import { useEffect, useState } from "react";
import "./index.css";

// AFTER (Dynamic for Production & Localhost)
const API_URL = process.env.REACT_APP_API_URL || "https://info-bharat-job-portal.onrender.com/api";

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // AUTH
  // =========================

  const [authMode, setAuthMode] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [currentUser, setCurrentUser] = useState(null);

  // =========================
  // ADMIN
  // =========================

  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // =========================
  // CANDIDATE APPLICATIONS
  // =========================

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [showApplications, setShowApplications] = useState(false);

  // =========================
  // CANDIDATE PROFILE
  // =========================

  const [candidateProfile, setCandidateProfile] = useState(null);
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [candidateProfileLoading, setCandidateProfileLoading] = useState(false);
  const [candidateProfileSaving, setCandidateProfileSaving] = useState(false);
  const [candidateProfileError, setCandidateProfileError] = useState("");

  const [profileForm, setProfileForm] = useState({
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    country: "",
    skills: "",
    education: [],
    experience: [],
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // =========================
  // RECRUITER
  // =========================

  const [recruiterApplications, setRecruiterApplications] = useState([]);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [recruiterJobsLoading, setRecruiterJobsLoading] = useState(false);
  const [recruiterJobsError, setRecruiterJobsError] = useState("");
  const [recruiterApplicationsLoading, setRecruiterApplicationsLoading] =
    useState(false);
  const [recruiterApplicationsError, setRecruiterApplicationsError] =
    useState("");
  const [showRecruiterDashboard, setShowRecruiterDashboard] = useState(false);

  // =========================
  // POST JOB
  // =========================

  const [showPostJob, setShowPostJob] = useState(false);
  const [postJobLoading, setPostJobLoading] = useState(false);
  const [postJobError, setPostJobError] = useState("");
  // =========================
  // EDIT JOB
  // =========================

  const [editingJob, setEditingJob] = useState(null);
  const [editJobLoading, setEditJobLoading] = useState(false);
  const [editJobError, setEditJobError] = useState("");

  const [jobForm, setJobForm] = useState({
    title: "",
    companyName: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    experienceRequired: "",
    description: "",
    employmentType: "Full-time",
    openings: "1",
    applicationDeadline: "",
  });

  // =========================
  // CHECK EXISTING LOGIN
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid token");
        }

        return response.json();
      })
      .then((data) => {
        setCurrentUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        setCurrentUser(null);
      });
  }, []);

  // =========================
  // LOAD PUBLIC JOBS
  // =========================

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/jobs`);

      if (!response.ok) {
        throw new Error("Failed to load jobs");
      }

      const data = await response.json();

      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load jobs. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);

  // =========================
  // CANDIDATE APPLICATIONS
  // =========================

  const fetchApplications = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setApplicationsError("Please login first.");
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError("");

    try {
      const response = await fetch(`${API_URL}/applications/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setApplicationsError(data.message || "Unable to load applications.");
        return;
      }

      setApplications(data.applications || []);
    } catch (error) {
      console.error("Applications error:", error);
      setApplicationsError("Unable to connect to the server.");
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleApplicationsClick = async () => {
    setShowApplications(true);
    await fetchApplications();
  };

  // =========================
  // CANDIDATE PROFILE
  // =========================

  const fetchCandidateProfile = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setCandidateProfileError("Please login first.");
      return;
    }

    setCandidateProfileLoading(true);
    setCandidateProfileError("");

    try {
      const response = await fetch(`${API_URL}/candidates/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setCandidateProfileError(
          data.message || "Unable to load your profile.",
        );
        return;
      }

      const candidate = data.candidate;

      setCandidateProfile(candidate);

      setProfileForm({
        phone: candidate?.phone || "",
        dateOfBirth: candidate?.dateOfBirth
          ? new Date(candidate.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: candidate?.address || "",
        city: candidate?.city || "",
        country: candidate?.country || "",
        skills: candidate?.skills?.join(", ") || "",
        education: candidate?.education || [],
        experience: candidate?.experience || [],
      });
    } catch (error) {
      console.error("Candidate profile error:", error);
      setCandidateProfileError("Unable to connect to the server.");
    } finally {
      setCandidateProfileLoading(false);
    }
  };

  const handleCandidateProfile = async () => {
    setShowCandidateProfile(true);
    await fetchCandidateProfile();
  };

  // =========================
  // PROFILE FORM
  // =========================

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setProfileForm((previous) => {
      const education = [...previous.education];

      education[index] = {
        ...education[index],
        [field]: value,
      };

      return {
        ...previous,
        education,
      };
    });
  };

  const addEducation = () => {
    setProfileForm((previous) => ({
      ...previous,
      education: [
        ...previous.education,
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startYear: "",
          endYear: "",
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setProfileForm((previous) => ({
      ...previous,
      education: previous.education.filter(
        (_, educationIndex) => educationIndex !== index,
      ),
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setProfileForm((previous) => {
      const experience = [...previous.experience];

      experience[index] = {
        ...experience[index],
        [field]: value,
      };

      return {
        ...previous,
        experience,
      };
    });
  };

  const addExperience = () => {
    setProfileForm((previous) => ({
      ...previous,
      experience: [
        ...previous.experience,
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setProfileForm((previous) => ({
      ...previous,
      experience: previous.experience.filter(
        (_, experienceIndex) => experienceIndex !== index,
      ),
    }));
  };

  // =========================
  // SAVE CANDIDATE PROFILE
  // =========================

  const handleSaveCandidateProfile = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("authToken");

    if (!token) {
      setCandidateProfileError("Please login first.");
      return;
    }

    setCandidateProfileSaving(true);
    setCandidateProfileError("");

    try {
      const response = await fetch(`${API_URL}/candidates/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: profileForm.phone.trim(),
          dateOfBirth: profileForm.dateOfBirth || undefined,
          address: profileForm.address.trim(),
          city: profileForm.city.trim(),
          country: profileForm.country.trim(),
          skills: profileForm.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0),
          education: profileForm.education,
          experience: profileForm.experience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCandidateProfileError(data.message || "Unable to update profile.");
        return;
      }

      setCandidateProfile(data.candidate);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Save profile error:", error);
      setCandidateProfileError("Unable to connect to the server.");
    } finally {
      setCandidateProfileSaving(false);
    }
  };

  // =========================
  // RESUME UPLOAD
  // =========================

  const handleResumeUpload = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setCandidateProfileError("Please login first.");
      return;
    }

    if (!resumeFile) {
      setCandidateProfileError("Please select a PDF resume.");
      return;
    }

    if (resumeFile.type !== "application/pdf") {
      setCandidateProfileError("Only PDF files are allowed.");
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      setCandidateProfileError("Resume must be smaller than 5 MB.");
      return;
    }

    setResumeUploading(true);
    setCandidateProfileError("");

    try {
      const formData = new FormData();

      formData.append("resume", resumeFile);

      const response = await fetch(`${API_URL}/candidates/profile/resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setCandidateProfileError(data.message || "Unable to upload resume.");
        return;
      }

      setCandidateProfile((previous) => ({
        ...previous,
        resume: data.resume,
      }));

      setResumeFile(null);

      alert("Resume uploaded successfully!");
    } catch (error) {
      console.error("Resume upload error:", error);
      setCandidateProfileError("Unable to connect to the server.");
    } finally {
      setResumeUploading(false);
    }
  };

  // =========================
  // RECRUITER JOBS
  // =========================

  const fetchRecruiterJobs = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setRecruiterJobsError("Please login first.");
      return;
    }

    setRecruiterJobsLoading(true);
    setRecruiterJobsError("");

    try {
      const response = await fetch(`${API_URL}/jobs/recruiter`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setRecruiterJobsError(data.message || "Unable to load your jobs.");
        return;
      }

      setRecruiterJobs(data.jobs || []);
    } catch (error) {
      console.error("Recruiter jobs error:", error);
      setRecruiterJobsError("Unable to connect to the server.");
    } finally {
      setRecruiterJobsLoading(false);
    }
  };

  // =========================
  // RECRUITER APPLICATIONS
  // =========================

  const fetchRecruiterApplications = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setRecruiterApplicationsError("Please login first.");
      return;
    }

    setRecruiterApplicationsLoading(true);
    setRecruiterApplicationsError("");

    try {
      const response = await fetch(`${API_URL}/applications/recruiter`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setRecruiterApplicationsError(
          data.message || "Unable to load recruiter applications.",
        );
        return;
      }

      setRecruiterApplications(data.applications || []);
    } catch (error) {
      console.error("Recruiter applications error:", error);
      setRecruiterApplicationsError("Unable to connect to the server.");
    } finally {
      setRecruiterApplicationsLoading(false);
    }
  };

  const handleRecruiterDashboard = async () => {
    setShowRecruiterDashboard(true);

    await Promise.all([fetchRecruiterApplications(), fetchRecruiterJobs()]);
  };

  // =========================
  // POST JOB FORM
  // =========================

  const handleJobFormChange = (event) => {
    const { name, value } = event.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // POST NEW JOB
  // =========================

  const handlePostJob = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("authToken");

    if (!token) {
      setPostJobError("Please login first.");
      return;
    }

    if (currentUser?.role !== "recruiter") {
      setPostJobError("Only recruiter accounts can post jobs.");
      return;
    }

    const openings = Number(jobForm.openings);

    if (!Number.isInteger(openings) || openings < 1) {
      setPostJobError(
        "Number of openings must be a whole number greater than 0.",
      );
      return;
    }

    const salaryMin = Number(jobForm.salaryMin);
    const salaryMax = Number(jobForm.salaryMax);

    if (salaryMin < 0 || salaryMax < 0) {
      setPostJobError("Salary cannot be negative.");
      return;
    }

    if (salaryMax < salaryMin) {
      setPostJobError("Maximum salary cannot be less than minimum salary.");
      return;
    }

    setPostJobLoading(true);
    setPostJobError("");

    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: jobForm.title.trim(),
          companyName: jobForm.companyName.trim(),
          location: jobForm.location.trim(),
          salaryMin,
          salaryMax,
          skills: jobForm.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0),
          experienceRequired: jobForm.experienceRequired.trim(),
          description: jobForm.description.trim(),
          employmentType: jobForm.employmentType,
          openings,
          applicationDeadline: jobForm.applicationDeadline || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPostJobError(data.message || "Unable to post job.");
        return;
      }

      alert("Job posted successfully!");

      setJobForm({
        title: "",
        companyName: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        skills: "",
        experienceRequired: "",
        description: "",
        employmentType: "Full-time",
        openings: "1",
        applicationDeadline: "",
      });

      setShowPostJob(false);
      setPostJobError("");

      await fetchRecruiterJobs();
      await fetchJobs();
    } catch (error) {
      console.error("Post job error:", error);
      setPostJobError("Unable to connect to the server.");
    } finally {
      setPostJobLoading(false);
    }
  };

  // =========================
  // EDIT JOB
  // =========================

  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditJobError("");
    setJobForm({
      title: job.title || "",
      companyName: job.companyName || "",
      location: job.location || "",
      salaryMin: job.salaryMin ?? "",
      salaryMax: job.salaryMax ?? "",
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
      experienceRequired: job.experienceRequired || "",
      description: job.description || "",
      employmentType: job.employmentType || "Full-time",
      openings: String(job.openings ?? 1),
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split("T")[0] : "",
    });
  };

  const handleUpdateJob = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) { setEditJobError("Please login first."); return; }
    if (!editingJob) { setEditJobError("No job selected for editing."); return; }

    const openings = Number(jobForm.openings);
    const salaryMin = Number(jobForm.salaryMin);
    const salaryMax = Number(jobForm.salaryMax);

    if (!Number.isInteger(openings) || openings < 1) {
      setEditJobError("Number of openings must be a whole number greater than 0."); return;
    }
    if (salaryMin < 0 || salaryMax < 0) { setEditJobError("Salary cannot be negative."); return; }
    if (salaryMax < salaryMin) { setEditJobError("Maximum salary cannot be less than minimum salary."); return; }
    if (!jobForm.title.trim() || !jobForm.companyName.trim() || !jobForm.location.trim() || !jobForm.description.trim()) {
      setEditJobError("Title, company name, location and description are required."); return;
    }

    setEditJobLoading(true);
    setEditJobError("");
    try {
      const response = await fetch(`${API_URL}/jobs/${editingJob._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: jobForm.title.trim(),
          companyName: jobForm.companyName.trim(),
          location: jobForm.location.trim(),
          salaryMin, salaryMax,
          skills: jobForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
          experienceRequired: jobForm.experienceRequired.trim(),
          description: jobForm.description.trim(),
          employmentType: jobForm.employmentType,
          openings,
          applicationDeadline: jobForm.applicationDeadline || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) { setEditJobError(data.message || "Unable to update job."); return; }
      alert("Job updated successfully!");
      setEditingJob(null);
      setEditJobError("");
      await fetchRecruiterJobs();
      await fetchJobs();
    } catch (error) {
      console.error("Update job error:", error);
      setEditJobError("Unable to connect to the server.");
    } finally { setEditJobLoading(false); }
  };

  // =========================
  // CLOSE JOB POSTING
  // =========================

  const handleCloseJob = async (job) => {
    const token = localStorage.getItem("authToken");
    if (!token) { alert("Please login first."); return; }
    if (!job?._id) { alert("Invalid job."); return; }
    if (job.status === "closed") { alert("This job is already closed."); return; }
    if (!window.confirm(`Close "${job.title}"? Candidates will no longer be able to apply to this job.`)) return;

    try {
      const response = await fetch(`${API_URL}/jobs/${job._id}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message || "Unable to close job."); return; }
      alert("Job closed successfully!");
      await fetchRecruiterJobs();
      await fetchJobs();
    } catch (error) {
      console.error("Close job error:", error);
      alert("Unable to connect to the server.");
    }
  };

  // =========================
  // DELETE JOB
  // =========================

  const handleDeleteJob = async (job) => {
    const token = localStorage.getItem("authToken");
    if (!token) { alert("Please login first."); return; }
    if (!job?._id) { alert("Invalid job."); return; }
    if (!window.confirm(`Delete "${job.title}" permanently? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`${API_URL}/jobs/${job._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message || "Unable to delete job."); return; }
      alert("Job deleted successfully!");
      if (selectedJob?._id === job._id) setSelectedJob(null);
      await fetchRecruiterJobs();
      await fetchJobs();
    } catch (error) {
      console.error("Delete job error:", error);
      alert("Unable to connect to the server.");
    }
  };

  // =========================
  // UPDATE APPLICATION STATUS
  // =========================

  const updateApplicationStatus = async (applicationId, status) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update application.");
        return;
      }

      alert("Application status updated successfully.");

      await fetchRecruiterApplications();
      await fetchRecruiterJobs();
      await fetchJobs();
    } catch (error) {
      console.error("Status update error:", error);
      alert("Unable to connect to the server.");
    }
  };

  // =========================
  // HIRE CANDIDATE
  // =========================

  const hireCandidate = async (applicationId) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/applications/${applicationId}/hire`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to hire candidate.");
        return;
      }

      if (data.job?.slotsRemaining === 0) {
        alert(
          "Candidate hired successfully! All positions are now filled. The job is closed.",
        );
      } else {
        alert(
          `Candidate hired successfully! ${data.job?.slotsRemaining} slot${
            data.job?.slotsRemaining === 1 ? "" : "s"
          } left.`,
        );
      }

      await fetchRecruiterApplications();
      await fetchRecruiterJobs();
      await fetchJobs();
    } catch (error) {
      console.error("Hire error:", error);
      alert("Unable to connect to the server.");
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (event) => {
    event.preventDefault();

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("authToken", data.token);

      setCurrentUser(data.user);

      setLoginForm({
        email: "",
        password: "",
      });

      setAuthMode(null);
      setAuthError("");
    } catch (error) {
      console.error("Login error:", error);

      setAuthError(
        "Unable to connect to the server. Make sure the backend is running.",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // SIGN UP
  // =========================

  const handleSignup = async (event) => {
    event.preventDefault();

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupForm.name.trim(),
          email: signupForm.email.trim(),
          password: signupForm.password,
          role: "candidate",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.message || "Registration failed.");
        return;
      }

      localStorage.setItem("authToken", data.token);

      setCurrentUser(data.user);

      setSignupForm({
        name: "",
        email: "",
        password: "",
      });

      setAuthMode(null);
      setAuthError("");
    } catch (error) {
      console.error("Signup error:", error);

      setAuthError(
        "Unable to connect to the server. Make sure the backend is running.",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // ADMIN DASHBOARD
  // =========================

  const fetchAdminDashboard = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setAdminError("Please login as an administrator first.");
      return;
    }

    setAdminLoading(true);
    setAdminError("");

    try {
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load admin dashboard.");
      }

      setAdminDashboard(data);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setAdminError(
        error.message ||
          "Unable to load admin dashboard. Make sure the admin API is available.",
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminDashboard = async () => {
    if (currentUser?.role !== "admin") {
      setAuthMode("admin-login");
      setAuthError("");
      return;
    }

    setShowAdminDashboard(true);
    await fetchAdminDashboard();
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.message || "Admin login failed.");
        return;
      }

      if (data.user?.role !== "admin") {
        setAuthError("This account does not have administrator access.");
        return;
      }

      localStorage.setItem("authToken", data.token);
      setCurrentUser(data.user);
      setLoginForm({ email: "", password: "" });
      setAuthMode(null);
      setAuthError("");
      setShowAdminDashboard(true);

      // Load dashboard immediately after successful admin authentication.
      setTimeout(() => {
        fetchAdminDashboard();
      }, 0);
    } catch (error) {
      console.error("Admin login error:", error);
      setAuthError(
        "Unable to connect to the server. Make sure the backend is running.",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("authToken");

    setCurrentUser(null);
    setApplications([]);
    setRecruiterApplications([]);
    setRecruiterJobs([]);
    setCandidateProfile(null);

    setShowApplications(false);
    setShowCandidateProfile(false);
    setShowRecruiterDashboard(false);
    setShowAdminDashboard(false);
    setAdminDashboard(null);
    setAdminError("");
    setShowPostJob(false);
    setEditingJob(null);
    setEditJobError("");
    setSelectedJob(null);
  };

  // =========================
  // APPLY
  // =========================

  const handleApply = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setSelectedJob(null);
      setAuthMode("login");
      setAuthError("Please login as a candidate before applying.");
      return;
    }

    if (!selectedJob) {
      alert("No job selected.");
      return;
    }

    if (selectedJob.status === "closed") {
      alert("This job is closed and is no longer accepting applications.");
      return;
    }

    if (getSlotsLeft(selectedJob) <= 0) {
      alert("All positions for this job have been filled.");
      return;
    }

    if (currentUser?.role !== "candidate") {
      alert("Only candidate accounts can apply for jobs.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJob._id,
          coverLetter:
            "I am very interested in this position and would like to apply.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Application failed.");
        return;
      }

      alert("Application submitted successfully!");

      setSelectedJob(null);

      if (showApplications) {
        await fetchApplications();
      }
    } catch (error) {
      console.error("Application error:", error);
      alert("Unable to submit application.");
    }
  };

  // =========================
  // HELPER
  // =========================

  const getSlotsLeft = (job) => {
    const openings = Number(job?.openings || 0);
    const hired = Number(job?.hiredCount || 0);

    return Math.max(openings - hired, 0);
  };

  // =========================
  // RESUME HELPERS
  // =========================

  const getResumeFileName = (fileName) => {
    const safeName = fileName || "resume.pdf";

    return safeName.toLowerCase().endsWith(".pdf")
      ? safeName
      : `${safeName}.pdf`;
  };

  const downloadResume = async (resume) => {
    if (!resume?.fileUrl) {
      alert("Resume is not available.");
      return;
    }

    try {
      const response = await fetch(resume.fileUrl);

      if (!response.ok) {
        throw new Error("Unable to download resume");
      }

      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = getResumeFileName(resume.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Resume download error:", error);

      // Fallback: open the PDF directly if the browser blocks the fetch.
      window.open(resume.fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="app">
      {/* NAVBAR */}

      <header className="navbar">
        <div className="logo">
          <span className="logo-mark">IB</span>
          <span>Info Bharat</span>
        </div>

        <nav>
          <a href="#jobs">Jobs</a>
          <a href="#about">About</a>

          {currentUser?.role === "candidate" && (
            <>
              <button className="login-btn" onClick={handleApplicationsClick}>
                My Applications
              </button>

              <button className="login-btn" onClick={handleCandidateProfile}>
                My Profile
              </button>
            </>
          )}

          {currentUser?.role === "recruiter" && (
            <button className="login-btn" onClick={handleRecruiterDashboard}>
              Recruiter Dashboard
            </button>
          )}

          {!currentUser && (
            <button
              className="admin-nav-btn"
              onClick={() => {
                setAuthMode("admin-login");
                setAuthError("");
              }}
            >
              Admin Portal
            </button>
          )}

          {currentUser?.role === "admin" && (
            <button className="admin-nav-btn" onClick={handleAdminDashboard}>
              Admin Dashboard
            </button>
          )}

          {currentUser ? (
            <>
              <span className="welcome-text">Hi, {currentUser.name}</span>

              <button className="login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
              >
                Login
              </button>

              <button
                className="signup-btn"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* HERO */}

        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">INFO BHARAT JOB PORTAL</p>

            <h1>
              Find your next
              <span> opportunity.</span>
            </h1>

            <p className="hero-text">
              Discover great jobs, apply with your profile, and take the next
              step in your career.
            </p>

            <a href="#jobs" className="hero-btn">
              Explore Jobs →
            </a>
          </div>
        </section>

        {/* JOBS */}

        <section className="jobs-section" id="jobs">
          <div className="section-heading">
            <div>
              <p className="eyebrow">JOB POSITIONS</p>
              <h2>Latest Jobs</h2>
            </div>

            <span className="job-count">
              {loading ? "Loading..." : `${jobs.length} jobs`}
            </span>
          </div>

          {loading && <div className="message">Loading available jobs...</div>}

          {error && <div className="message error">{error}</div>}

          {!loading && !error && jobs.length === 0 && (
            <div className="message">No jobs available right now.</div>
          )}

          <div className="jobs-grid">
            {jobs.map((job) => {
              const slotsLeft = getSlotsLeft(job);
              const isClosed = job.status === "closed" || slotsLeft === 0;

              return (
                <article
                  className={`job-card ${isClosed ? "closed-job" : ""}`}
                  key={job._id}
                >
                  <div className="job-top">
                    <div className="company-icon">
                      {job.companyName?.charAt(0) || "I"}
                    </div>

                    <span className="status">
                      {isClosed ? "Closed" : "Open"}
                    </span>
                  </div>

                  <h3>{job.title}</h3>

                  <p className="company">{job.companyName}</p>

                  <div className="job-info">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.employmentType}</span>
                  </div>

                  {job.experienceRequired && (
                    <p className="experience">
                      Experience: {job.experienceRequired}
                    </p>
                  )}

                  <div
                    className={`job-slots ${
                      slotsLeft === 0 ? "full" : slotsLeft === 1 ? "last" : ""
                    }`}
                  >
                    {slotsLeft === 0
                      ? "🔒 All positions filled"
                      : `👥 ${slotsLeft} slot${
                          slotsLeft === 1 ? "" : "s"
                        } left`}
                  </div>

                  {job.skills?.length > 0 && (
                    <div className="skills">
                      {job.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  )}

                  <div className="job-bottom">
                    <div>
                      {job.salaryMin && job.salaryMax ? (
                        <strong>
                          ₹{(job.salaryMin / 100000).toFixed(1)}L – ₹
                          {(job.salaryMax / 100000).toFixed(1)}L
                        </strong>
                      ) : (
                        <strong>Salary not specified</strong>
                      )}
                    </div>

                    <button
                      className="apply-btn"
                      onClick={() => !isClosed && setSelectedJob(job)}
                      disabled={isClosed}
                    >
                      {isClosed ? "Job Closed" : "View Job"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ABOUT */}

        <section className="about" id="about">
          <p className="eyebrow">WHY INFO BHARAT</p>

          <h2>Build your career with confidence.</h2>

          <p>
            Search jobs, manage your applications, upload your resume, and
            connect with recruiters through one simple platform.
          </p>
        </section>
      </main>

      {/* FOOTER */}

      <footer>
        <span>© 2026 Info Bharat</span>
        <span>Job Portal</span>
      </footer>

      {/* JOB DETAILS */}

      {selectedJob && (
        <div className="job-modal">
          <div className="job-modal-content">
            <button className="close-btn" onClick={() => setSelectedJob(null)}>
              ×
            </button>

            <p className="eyebrow">JOB DETAILS</p>

            <h2>{selectedJob.title}</h2>

            <p className="company">{selectedJob.companyName}</p>

            <div
              className={`job-slots ${
                getSlotsLeft(selectedJob) === 0
                  ? "full"
                  : getSlotsLeft(selectedJob) === 1
                    ? "last"
                    : ""
              }`}
            >
              {getSlotsLeft(selectedJob) === 0
                ? "🔒 All positions filled"
                : `👥 ${getSlotsLeft(selectedJob)} slot${
                    getSlotsLeft(selectedJob) === 1 ? "" : "s"
                  } left`}
            </div>

            {selectedJob.status === "closed" && (
              <div className="message error">
                This job is closed because all available positions have been
                filled.
              </div>
            )}

            <div className="job-details">
              <p>📍 {selectedJob.location}</p>

              <p>💼 {selectedJob.employmentType}</p>

              {selectedJob.experienceRequired && (
                <p>🎓 {selectedJob.experienceRequired}</p>
              )}

              {selectedJob.salaryMin && selectedJob.salaryMax && (
                <p>
                  💰 ₹{(selectedJob.salaryMin / 100000).toFixed(1)}L – ₹
                  {(selectedJob.salaryMax / 100000).toFixed(1)}L
                </p>
              )}

              <p>👥 Openings: {selectedJob.openings}</p>
            </div>

            <h3>Skills</h3>

            <div className="skills">
              {selectedJob.skills?.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <h3>Job Description</h3>

            <p className="description">{selectedJob.description}</p>

            {selectedJob.applicationDeadline && (
              <p className="deadline">
                Application deadline:{" "}
                {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
              </p>
            )}

            {selectedJob.status === "closed" ||
            getSlotsLeft(selectedJob) === 0 ? (
              <button className="apply-now-btn" disabled>
                Job Closed
              </button>
            ) : (
              <button className="apply-now-btn" onClick={handleApply}>
                Apply Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}

      {authMode && (
        <div className="job-modal">
          <div className="job-modal-content auth-modal">
            <button
              className="close-btn"
              onClick={() => {
                setAuthMode(null);
                setAuthError("");
              }}
            >
              ×
            </button>

            {authMode === "admin-login" ? (
              <>
                <p className="eyebrow">ADMINISTRATION</p>

                <h2>Admin Portal</h2>

                <p className="auth-subtitle">
                  Sign in with an administrator account to view portal activity.
                </p>

                <form onSubmit={handleAdminLogin}>
                  <label>Admin Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm({
                        ...loginForm,
                        email: event.target.value,
                      })
                    }
                    placeholder="Enter admin email"
                    autoComplete="username"
                    required
                  />

                  <label>Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm({
                        ...loginForm,
                        password: event.target.value,
                      })
                    }
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    required
                  />

                  {authError && <div className="auth-error">{authError}</div>}

                  <button
                    type="submit"
                    className="admin-primary-btn"
                    disabled={authLoading}
                  >
                    {authLoading ? "Signing in..." : "Enter Admin Portal"}
                  </button>
                </form>

                <p className="auth-switch">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                  >
                    ← Back to regular login
                  </button>
                </p>
              </>
            ) : authMode === "login" ? (
              <>
                <p className="eyebrow">WELCOME BACK</p>

                <h2>Login</h2>

                <p className="auth-subtitle">
                  Login to your Info Bharat account.
                </p>

                <form onSubmit={handleLogin}>
                  <label>Email</label>

                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm({
                        ...loginForm,
                        email: event.target.value,
                      })
                    }
                    placeholder="Enter your email"
                    required
                  />

                  <label>Password</label>

                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm({
                        ...loginForm,
                        password: event.target.value,
                      })
                    }
                    placeholder="Enter your password"
                    required
                  />

                  {authError && <div className="auth-error">{authError}</div>}

                  <button
                    type="submit"
                    className="apply-now-btn"
                    disabled={authLoading}
                  >
                    {authLoading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <p className="auth-switch">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError("");
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow">JOIN INFO BHARAT</p>

                <h2>Create Account</h2>

                <p className="auth-subtitle">Create a candidate account.</p>

                <form onSubmit={handleSignup}>
                  <label>Full Name</label>

                  <input
                    type="text"
                    value={signupForm.name}
                    onChange={(event) =>
                      setSignupForm({
                        ...signupForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Enter your full name"
                    required
                  />

                  <label>Email</label>

                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(event) =>
                      setSignupForm({
                        ...signupForm,
                        email: event.target.value,
                      })
                    }
                    placeholder="Enter your email"
                    required
                  />

                  <label>Password</label>

                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(event) =>
                      setSignupForm({
                        ...signupForm,
                        password: event.target.value,
                      })
                    }
                    placeholder="Create a password"
                    minLength={6}
                    required
                  />

                  {authError && <div className="auth-error">{authError}</div>}

                  <button
                    type="submit"
                    className="apply-now-btn"
                    disabled={authLoading}
                  >
                    {authLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                  >
                    Login
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* CANDIDATE APPLICATIONS */}

      {showApplications && (
        <div className="job-modal">
          <div className="job-modal-content applications-modal">
            <button
              className="close-btn"
              onClick={() => setShowApplications(false)}
            >
              ×
            </button>

            <p className="eyebrow">CANDIDATE DASHBOARD</p>

            <h2>My Applications</h2>

            <div className="applications-header">
              <p>
                {applications.length} application
                {applications.length !== 1 ? "s" : ""}
              </p>

              <button
                className="apply-btn"
                onClick={fetchApplications}
                disabled={applicationsLoading}
              >
                {applicationsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {applicationsLoading && applications.length === 0 && (
              <div className="message">Loading your applications...</div>
            )}

            {applicationsError && (
              <div className="message error">{applicationsError}</div>
            )}

            {!applicationsLoading &&
              !applicationsError &&
              applications.length === 0 && (
                <div className="message">
                  You haven't applied for any jobs yet.
                </div>
              )}

            <div className="applications-list">
              {applications.map((application) => {
                const job = application.job;

                return (
                  <div className="application-card" key={application._id}>
                    <div className="application-main">
                      <div>
                        <h3>{job?.title || "Job no longer available"}</h3>

                        <p className="company">
                          {job?.companyName || "Unknown company"}
                        </p>
                      </div>

                      <span className="application-status">
                        {application.status || "Applied"}
                      </span>
                    </div>

                    <div className="application-info">
                      {job?.location && <span>📍 {job.location}</span>}

                      {job?.employmentType && (
                        <span>💼 {job.employmentType}</span>
                      )}

                      {job?.status === "closed" && <span>🔒 Job Closed</span>}
                    </div>

                    <div className="application-footer">
                      <span>
                        Applied:{" "}
                        {application.createdAt
                          ? new Date(application.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE PROFILE */}

      {showCandidateProfile && (
        <div className="job-modal">
          <div className="job-modal-content applications-modal">
            <button
              className="close-btn"
              onClick={() => {
                setShowCandidateProfile(false);
                setCandidateProfileError("");
              }}
            >
              ×
            </button>

            <p className="eyebrow">CANDIDATE PROFILE</p>

            <h2>My Profile</h2>

            {candidateProfileLoading ? (
              <div className="message">Loading your profile...</div>
            ) : (
              <>
                {candidateProfileError && (
                  <div className="message error">{candidateProfileError}</div>
                )}

                <form onSubmit={handleSaveCandidateProfile}>
                  <label>Phone</label>

                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileFormChange}
                    placeholder="Enter your phone number"
                  />

                  <label>Date of Birth</label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileForm.dateOfBirth}
                    onChange={handleProfileFormChange}
                  />

                  <label>Address</label>

                  <input
                    type="text"
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileFormChange}
                    placeholder="Enter your address"
                  />

                  <div className="form-row">
                    <div>
                      <label>City</label>

                      <input
                        type="text"
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileFormChange}
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label>Country</label>

                      <input
                        type="text"
                        name="country"
                        value={profileForm.country}
                        onChange={handleProfileFormChange}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <label>Skills</label>

                  <input
                    type="text"
                    name="skills"
                    value={profileForm.skills}
                    onChange={handleProfileFormChange}
                    placeholder="React, JavaScript, Node.js"
                  />

                  <small>Separate skills with commas.</small>

                  {/* EDUCATION */}

                  <div className="profile-section-header">
                    <div>
                      <h3>Education</h3>
                      <p>Add your educational qualifications.</p>
                    </div>

                    <button
                      type="button"
                      className="apply-btn"
                      onClick={addEducation}
                    >
                      + Add Education
                    </button>
                  </div>

                  {profileForm.education.map((education, index) => (
                    <div className="profile-item" key={index}>
                      <div className="profile-item-header">
                        <strong>Education {index + 1}</strong>

                        <button
                          type="button"
                          className="login-btn"
                          onClick={() => removeEducation(index)}
                        >
                          Remove
                        </button>
                      </div>

                      <label>Institution</label>

                      <input
                        type="text"
                        value={education.institution || ""}
                        onChange={(event) =>
                          handleEducationChange(
                            index,
                            "institution",
                            event.target.value,
                          )
                        }
                        placeholder="University / College"
                      />

                      <label>Degree</label>

                      <input
                        type="text"
                        value={education.degree || ""}
                        onChange={(event) =>
                          handleEducationChange(
                            index,
                            "degree",
                            event.target.value,
                          )
                        }
                        placeholder="B.Tech / B.Sc / MBA"
                      />

                      <label>Field of Study</label>

                      <input
                        type="text"
                        value={education.fieldOfStudy || ""}
                        onChange={(event) =>
                          handleEducationChange(
                            index,
                            "fieldOfStudy",
                            event.target.value,
                          )
                        }
                        placeholder="Computer Science"
                      />

                      <div className="form-row">
                        <div>
                          <label>Start Year</label>

                          <input
                            type="text"
                            value={education.startYear || ""}
                            onChange={(event) =>
                              handleEducationChange(
                                index,
                                "startYear",
                                event.target.value,
                              )
                            }
                            placeholder="2022"
                          />
                        </div>

                        <div>
                          <label>End Year</label>

                          <input
                            type="text"
                            value={education.endYear || ""}
                            onChange={(event) =>
                              handleEducationChange(
                                index,
                                "endYear",
                                event.target.value,
                              )
                            }
                            placeholder="2026"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* EXPERIENCE */}

                  <div className="profile-section-header">
                    <div>
                      <h3>Experience</h3>
                      <p>Add your professional experience.</p>
                    </div>

                    <button
                      type="button"
                      className="apply-btn"
                      onClick={addExperience}
                    >
                      + Add Experience
                    </button>
                  </div>

                  {profileForm.experience.map((experience, index) => (
                    <div className="profile-item" key={index}>
                      <div className="profile-item-header">
                        <strong>Experience {index + 1}</strong>

                        <button
                          type="button"
                          className="login-btn"
                          onClick={() => removeExperience(index)}
                        >
                          Remove
                        </button>
                      </div>

                      <label>Company</label>

                      <input
                        type="text"
                        value={experience.company || ""}
                        onChange={(event) =>
                          handleExperienceChange(
                            index,
                            "company",
                            event.target.value,
                          )
                        }
                        placeholder="Company name"
                      />

                      <label>Position</label>

                      <input
                        type="text"
                        value={experience.position || ""}
                        onChange={(event) =>
                          handleExperienceChange(
                            index,
                            "position",
                            event.target.value,
                          )
                        }
                        placeholder="Software Developer"
                      />

                      <div className="form-row">
                        <div>
                          <label>Start Date</label>

                          <input
                            type="date"
                            value={experience.startDate || ""}
                            onChange={(event) =>
                              handleExperienceChange(
                                index,
                                "startDate",
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div>
                          <label>End Date</label>

                          <input
                            type="date"
                            value={experience.endDate || ""}
                            onChange={(event) =>
                              handleExperienceChange(
                                index,
                                "endDate",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <label>Description</label>

                      <textarea
                        value={experience.description || ""}
                        onChange={(event) =>
                          handleExperienceChange(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Describe your responsibilities..."
                        rows="4"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="apply-now-btn"
                    disabled={candidateProfileSaving}
                  >
                    {candidateProfileSaving
                      ? "Saving Profile..."
                      : "Save Profile"}
                  </button>
                </form>

                {/* RESUME */}

                <div className="resume-section">
                  <div className="profile-section-header">
                    <div>
                      <h3>Resume</h3>

                      <p>Upload your latest PDF resume. Maximum size: 5 MB.</p>
                    </div>
                  </div>

                  {candidateProfile?.resume?.fileName && (
                    <div className="resume-current">
                      <span>
                        📄 {getResumeFileName(candidateProfile.resume.fileName)}
                      </span>

                      {candidateProfile.resume.fileUrl && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "14px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="apply-btn"
                            onClick={() =>
                              downloadResume(candidateProfile.resume)
                            }
                          >
                            Download PDF
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(event) => {
                      setResumeFile(event.target.files?.[0] || null);
                      setCandidateProfileError("");
                    }}
                  />

                  {resumeFile && (
                    <p className="resume-selected">
                      Selected: {resumeFile.name}
                    </p>
                  )}

                  <button
                    type="button"
                    className="apply-btn"
                    onClick={handleResumeUpload}
                    disabled={resumeUploading}
                  >
                    {resumeUploading ? "Uploading Resume..." : "Upload Resume"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================
          ADMIN DASHBOARD
      ========================= */}

      {showAdminDashboard && currentUser?.role === "admin" && (
        <div className="admin-page">
          <div className="admin-shell">
            <div className="admin-header">
              <div>
                <p className="admin-kicker">INFO BHARAT • ADMINISTRATION</p>
                <h1>Admin Dashboard</h1>
                <p>Monitor candidates, recruiters, jobs and application activity.</p>
              </div>

              <div className="admin-header-actions">
                <button
                  className="admin-secondary-btn"
                  onClick={fetchAdminDashboard}
                  disabled={adminLoading}
                >
                  {adminLoading ? "Refreshing..." : "↻ Refresh"}
                </button>
                <button
                  className="admin-secondary-btn"
                  onClick={() => setShowAdminDashboard(false)}
                >
                  Close
                </button>
              </div>
            </div>

            {adminError && (
              <div className="admin-error-box">
                <strong>Admin data unavailable</strong>
                <span>{adminError}</span>
              </div>
            )}

            {adminLoading && !adminDashboard ? (
              <div className="admin-loading">Loading administrator analytics...</div>
            ) : (
              <>
                <div className="admin-stat-grid">
                  {[
                    ["Candidates", adminDashboard?.stats?.candidates ?? 0, "👤"],
                    ["Recruiters", adminDashboard?.stats?.recruiters ?? 0, "🏢"],
                    ["Jobs Posted", adminDashboard?.stats?.jobs ?? 0, "💼"],
                    ["Applications", adminDashboard?.stats?.applications ?? 0, "📄"],
                    ["Hired", adminDashboard?.stats?.hired ?? 0, "✓"],
                  ].map(([label, value, icon]) => (
                    <div className="admin-stat-card" key={label}>
                      <div className="admin-stat-icon">{icon}</div>
                      <div>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-chart-grid">
                  <section className="admin-panel">
                    <div className="admin-panel-title">
                      <div>
                        <span className="admin-kicker">APPLICATION PIPELINE</span>
                        <h2>Application Status</h2>
                      </div>
                    </div>

                    {(() => {
                      const statuses = adminDashboard?.applicationStats || {};
                      const items = [
                        ["Applied", Number(statuses.Applied || 0)],
                        ["Shortlisted", Number(statuses.Shortlisted || 0)],
                        ["Interview", Number(statuses.Interview || 0)],
                        ["Hired", Number(statuses.Hired || 0)],
                        ["Rejected", Number(statuses.Rejected || 0)],
                      ];
                      const max = Math.max(...items.map(([, value]) => value), 1);

                      return (
                        <div className="admin-bars">
                          {items.map(([label, value]) => (
                            <div className="admin-bar-row" key={label}>
                              <span>{label}</span>
                              <div className="admin-bar-track">
                                <div
                                  className="admin-bar-fill"
                                  style={{ width: `${(value / max) * 100}%` }}
                                />
                              </div>
                              <strong>{value}</strong>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-title">
                      <div>
                        <span className="admin-kicker">USER MIX</span>
                        <h2>Platform Users</h2>
                      </div>
                    </div>

                    {(() => {
                      const candidates = Number(adminDashboard?.stats?.candidates || 0);
                      const recruiters = Number(adminDashboard?.stats?.recruiters || 0);
                      const total = Math.max(candidates + recruiters, 1);

                      return (
                        <div className="admin-user-chart">
                          <div className="admin-donut" style={{ "--candidate-pct": `${(candidates / total) * 100}%` }}>
                            <div>
                              <strong>{candidates + recruiters}</strong>
                              <span>Total Users</span>
                            </div>
                          </div>
                          <div className="admin-legend">
                            <div><i className="candidate-dot" /> Candidates <strong>{candidates}</strong></div>
                            <div><i className="recruiter-dot" /> Recruiters <strong>{recruiters}</strong></div>
                          </div>
                        </div>
                      );
                    })()}
                  </section>
                </div>

                <section className="admin-panel admin-activity-panel">
                  <div className="admin-panel-title">
                    <div>
                      <span className="admin-kicker">RECENT ACTIVITY</span>
                      <h2>Portal Activity</h2>
                    </div>
                    <span className="admin-activity-count">
                      {(adminDashboard?.activity || []).length} events
                    </span>
                  </div>

                  {(adminDashboard?.activity || []).length === 0 ? (
                    <div className="admin-empty">No recent activity available.</div>
                  ) : (
                    <div className="admin-activity-list">
                      {adminDashboard.activity.map((item, index) => (
                        <div className="admin-activity-item" key={item._id || index}>
                          <div className="admin-activity-dot" />
                          <div>
                            <strong>{item.action || "Activity"}</strong>
                            <p>{item.description || item.message || "Portal activity recorded."}</p>
                          </div>
                          <time>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "Recently"}
                          </time>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      )}

      {/* RECRUITER DASHBOARD */}

      {showRecruiterDashboard && (
        <div className="job-modal">
          <div className="job-modal-content recruiter-modal">
            <button
              className="close-btn"
              onClick={() => setShowRecruiterDashboard(false)}
            >
              ×
            </button>

            <p className="eyebrow">RECRUITER DASHBOARD</p>

            <h2>Recruiter Dashboard</h2>

            {/* POST NEW JOB */}

            <div className="post-job-header">
              <div>
                <h3>Manage Jobs</h3>

                <p>Create and manage your job postings.</p>
              </div>

              <button
                className="apply-now-btn"
                onClick={() => {
                  setShowPostJob(true);
                  setPostJobError("");
                }}
              >
                + Post New Job
              </button>
            </div>

            {/* MY JOBS */}

            <div className="recruiter-jobs-section">
              <div className="applications-header">
                <div>
                  <h3>My Jobs</h3>

                  <p>
                    {recruiterJobs.length} job
                    {recruiterJobs.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <button
                  className="apply-btn"
                  onClick={fetchRecruiterJobs}
                  disabled={recruiterJobsLoading}
                >
                  {recruiterJobsLoading ? "Refreshing..." : "Refresh Jobs"}
                </button>
              </div>

              {recruiterJobsError && (
                <div className="message error">{recruiterJobsError}</div>
              )}

              {recruiterJobsLoading && recruiterJobs.length === 0 && (
                <div className="message">Loading your jobs...</div>
              )}

              {!recruiterJobsLoading &&
                !recruiterJobsError &&
                recruiterJobs.length === 0 && (
                  <div className="message">
                    You haven't posted any jobs yet.
                  </div>
                )}

              <div className="applications-list">
                {recruiterJobs.map((job) => {
                  const slotsLeft = getSlotsLeft(job);

                  const isClosed = job.status === "closed" || slotsLeft === 0;

                  return (
                    <div className="application-card" key={job._id}>
                      <div className="application-main">
                        <div>
                          <h3>{job.title}</h3>

                          <p className="company">{job.companyName}</p>
                        </div>

                        <span className="application-status">
                          {isClosed ? "Closed" : "Open"}
                        </span>
                      </div>

                      <div className="application-info">
                        <span>📍 {job.location}</span>

                        <span>💼 {job.employmentType}</span>

                        {job.salaryMin && job.salaryMax && (
                          <span>
                            💰 ₹{(job.salaryMin / 100000).toFixed(1)}L – ₹
                            {(job.salaryMax / 100000).toFixed(1)}L
                          </span>
                        )}
                      </div>

                      <div className="recruiter-slot-info">
                        <span
                          className={`recruiter-slot-badge ${
                            slotsLeft === 0
                              ? "full"
                              : slotsLeft === 1
                                ? "warning"
                                : ""
                          }`}
                        >
                          👥 {job.hiredCount || 0} / {job.openings || 0} hired
                        </span>

                        <span
                          className={`recruiter-slot-badge ${
                            slotsLeft === 0
                              ? "full"
                              : slotsLeft === 1
                                ? "warning"
                                : ""
                          }`}
                        >
                          {slotsLeft === 0
                            ? "🔒 All positions filled"
                            : `${slotsLeft} slot${
                                slotsLeft === 1 ? "" : "s"
                              } left`}
                        </span>
                      </div>

                      {job.skills?.length > 0 && (
                        <div className="skills">
                          {job.skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      )}

                      <div className="recruiter-actions job-management-actions">
                        <button type="button" className="apply-btn" onClick={() => handleEditJob(job)}>Edit Job</button>
                        {!isClosed && (
                          <button type="button" className="login-btn" onClick={() => handleCloseJob(job)}>Close Job</button>
                        )}
                        <button type="button" className="login-btn delete-job-btn" onClick={() => handleDeleteJob(job)}>Delete Job</button>
                      </div>

                      <div className="application-footer">
                        <span>
                          Posted:{" "}
                          {job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>

                        <span>Status: {isClosed ? "Closed" : "Open"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr />

            {/* RECRUITER APPLICATIONS */}

            <div className="applications-header">
              <p>
                {recruiterApplications.length} applicant
                {recruiterApplications.length !== 1 ? "s" : ""}
              </p>

              <button
                className="apply-btn"
                onClick={fetchRecruiterApplications}
                disabled={recruiterApplicationsLoading}
              >
                {recruiterApplicationsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {recruiterApplicationsLoading &&
              recruiterApplications.length === 0 && (
                <div className="message">Loading applications...</div>
              )}

            {recruiterApplicationsError && (
              <div className="message error">{recruiterApplicationsError}</div>
            )}

            {!recruiterApplicationsLoading &&
              !recruiterApplicationsError &&
              recruiterApplications.length === 0 && (
                <div className="message">No applications received yet.</div>
              )}

            <div className="applications-list">
              {recruiterApplications.map((application) => {
                const job = application.job;
                const candidate = application.candidate;
                const candidateUser = candidate?.user;

                const status = application.status || "Applied";

                return (
                  <div
                    className="application-card recruiter-application"
                    key={application._id}
                  >
                    <div className="application-main">
                      <div>
                        <h3>{candidateUser?.name || "Candidate"}</h3>

                        <p className="company">
                          {candidateUser?.email || "Email unavailable"}
                        </p>
                      </div>

                      <span className="application-status">{status}</span>
                    </div>

                    <div className="application-info">
                      <span>💼 {job?.title || "Unknown job"}</span>

                      {job?.companyName && <span>🏢 {job.companyName}</span>}

                      {candidate?.city && <span>📍 {candidate.city}</span>}
                    </div>

                    {candidate?.skills?.length > 0 && (
                      <div className="skills">
                        {candidate.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    )}

                    {candidate?.resume?.fileUrl && (
                      <div
                        className="application-footer"
                        style={{
                          marginTop: "16px",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className="apply-btn"
                          onClick={() => downloadResume(candidate.resume)}
                        >
                          Download PDF
                        </button>
                      </div>
                    )}

                    <div className="application-footer">
                      <span>
                        Applied:{" "}
                        {application.createdAt
                          ? new Date(application.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="recruiter-actions">
                      {status !== "Shortlisted" &&
                        status !== "Rejected" &&
                        status !== "Hired" && (
                          <>
                            <button
                              className="apply-btn"
                              onClick={() =>
                                updateApplicationStatus(
                                  application._id,
                                  "Shortlisted",
                                )
                              }
                            >
                              Shortlist
                            </button>

                            <button
                              className="login-btn"
                              onClick={() =>
                                updateApplicationStatus(
                                  application._id,
                                  "Rejected",
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                      {status === "Shortlisted" && (
                        <>
                          <button
                            className="apply-btn"
                            onClick={() =>
                              updateApplicationStatus(
                                application._id,
                                "Interview",
                              )
                            }
                          >
                            Move to Interview
                          </button>

                          <button
                            className="login-btn"
                            onClick={() =>
                              updateApplicationStatus(
                                application._id,
                                "Rejected",
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {status === "Interview" && (
                        <>
                          <button
                            className="apply-btn"
                            onClick={() => hireCandidate(application._id)}
                          >
                            Hire Candidate
                          </button>

                          <button
                            className="login-btn"
                            onClick={() =>
                              updateApplicationStatus(
                                application._id,
                                "Rejected",
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {status === "Rejected" && (
                        <span>Application rejected</span>
                      )}

                      {status === "Hired" && <span>🎉 Candidate hired</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EDIT JOB MODAL */}

      {editingJob && (
        <div className="job-modal">
          <div className="job-modal-content post-job-modal">
            <button className="close-btn" onClick={() => { setEditingJob(null); setEditJobError(""); }}>×</button>
            <p className="eyebrow">RECRUITER</p>
            <h2>Edit Job</h2>
            <p className="auth-subtitle">Update the details of your job posting.</p>
            <form onSubmit={handleUpdateJob}>
              <label>Job Title</label>
              <input type="text" name="title" value={jobForm.title} onChange={handleJobFormChange} required />
              <label>Company Name</label>
              <input type="text" name="companyName" value={jobForm.companyName} onChange={handleJobFormChange} required />
              <label>Location</label>
              <input type="text" name="location" value={jobForm.location} onChange={handleJobFormChange} required />
              <label>Employment Type</label>
              <select name="employmentType" value={jobForm.employmentType} onChange={handleJobFormChange} required>
                <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option><option value="Remote">Remote</option>
              </select>
              <div className="form-row">
                <div><label>Minimum Salary</label><input type="number" name="salaryMin" value={jobForm.salaryMin} onChange={handleJobFormChange} min="0" required /></div>
                <div><label>Maximum Salary</label><input type="number" name="salaryMax" value={jobForm.salaryMax} onChange={handleJobFormChange} min="0" required /></div>
              </div>
              <label>Number of Openings</label>
              <input type="number" name="openings" value={jobForm.openings} onChange={handleJobFormChange} min="1" step="1" required />
              <small>Openings cannot be lower than the number of candidates already hired.</small>
              <label>Experience Required</label>
              <input type="text" name="experienceRequired" value={jobForm.experienceRequired} onChange={handleJobFormChange} required />
              <label>Skills</label>
              <input type="text" name="skills" value={jobForm.skills} onChange={handleJobFormChange} required />
              <small>Separate skills with commas.</small>
              <label>Job Description</label>
              <textarea name="description" value={jobForm.description} onChange={handleJobFormChange} rows="6" required />
              <label>Application Deadline</label>
              <input type="date" name="applicationDeadline" value={jobForm.applicationDeadline} onChange={handleJobFormChange} />
              {editJobError && <div className="auth-error">{editJobError}</div>}
              <button type="submit" className="apply-now-btn" disabled={editJobLoading}>{editJobLoading ? "Saving Changes..." : "Save Changes"}</button>
            </form>
          </div>
        </div>
      )}

      {/* POST NEW JOB MODAL */}

      {showPostJob && (
        <div className="job-modal">
          <div className="job-modal-content post-job-modal">
            <button
              className="close-btn"
              onClick={() => {
                setShowPostJob(false);
                setPostJobError("");
              }}
            >
              ×
            </button>

            <p className="eyebrow">RECRUITER</p>

            <h2>Post New Job</h2>

            <p className="auth-subtitle">Add a new position to Info Bharat.</p>

            <form onSubmit={handlePostJob}>
              <label>Job Title</label>

              <input
                type="text"
                name="title"
                value={jobForm.title}
                onChange={handleJobFormChange}
                placeholder="e.g. Frontend Developer"
                required
              />

              <label>Company Name</label>

              <input
                type="text"
                name="companyName"
                value={jobForm.companyName}
                onChange={handleJobFormChange}
                placeholder="e.g. Info Bharat Technologies"
                required
              />

              <label>Location</label>

              <input
                type="text"
                name="location"
                value={jobForm.location}
                onChange={handleJobFormChange}
                placeholder="e.g. Kolkata / Remote"
                required
              />

              <label>Employment Type</label>

              <select
                name="employmentType"
                value={jobForm.employmentType}
                onChange={handleJobFormChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>

              <div className="form-row">
                <div>
                  <label>Minimum Salary</label>

                  <input
                    type="number"
                    name="salaryMin"
                    value={jobForm.salaryMin}
                    onChange={handleJobFormChange}
                    placeholder="300000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label>Maximum Salary</label>

                  <input
                    type="number"
                    name="salaryMax"
                    value={jobForm.salaryMax}
                    onChange={handleJobFormChange}
                    placeholder="600000"
                    min="0"
                    required
                  />
                </div>
              </div>

              <label>Number of Openings</label>

              <input
                type="number"
                name="openings"
                value={jobForm.openings}
                onChange={handleJobFormChange}
                min="1"
                step="1"
                placeholder="e.g. 3"
                required
              />

              <small>
                Enter how many candidates you want to hire for this position.
              </small>

              <label>Experience Required</label>

              <input
                type="text"
                name="experienceRequired"
                value={jobForm.experienceRequired}
                onChange={handleJobFormChange}
                placeholder="e.g. 1-3 years"
                required
              />

              <label>Skills</label>

              <input
                type="text"
                name="skills"
                value={jobForm.skills}
                onChange={handleJobFormChange}
                placeholder="React, JavaScript, CSS, Node.js"
                required
              />

              <small>Separate skills with commas.</small>

              <label>Job Description</label>

              <textarea
                name="description"
                value={jobForm.description}
                onChange={handleJobFormChange}
                placeholder="Describe the role, responsibilities and requirements..."
                rows="6"
                required
              />

              <label>Application Deadline</label>

              <input
                type="date"
                name="applicationDeadline"
                value={jobForm.applicationDeadline}
                onChange={handleJobFormChange}
              />

              {postJobError && <div className="auth-error">{postJobError}</div>}

              <button
                type="submit"
                className="apply-now-btn"
                disabled={postJobLoading}
              >
                {postJobLoading ? "Posting Job..." : "Post Job"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
