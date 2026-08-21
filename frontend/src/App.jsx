import { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://localhost:5000/api";

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
  // CANDIDATE APPLICATIONS
  // =========================

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [showApplications, setShowApplications] = useState(false);

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

    await Promise.all([
      fetchRecruiterApplications(),
      fetchRecruiterJobs(),
    ]);
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
      setPostJobError("Number of openings must be a whole number greater than 0.");
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
          applicationDeadline:
            jobForm.applicationDeadline || undefined,
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
        openings: "1",
        skills: "",
        experienceRequired: "",
        description: "",
        employmentType: "Full-time",
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

      if (data.slotsLeft === 0) {
        alert(
          "Candidate hired successfully! All positions are now filled. The job is closed.",
        );
      } else {
        alert(
          `Candidate hired successfully! ${data.slotsLeft} slot${
            data.slotsLeft === 1 ? "" : "s"
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
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("authToken");

    setCurrentUser(null);
    setApplications([]);
    setRecruiterApplications([]);
    setRecruiterJobs([]);

    setShowApplications(false);
    setShowRecruiterDashboard(false);
    setShowPostJob(false);
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
            <button className="login-btn" onClick={handleApplicationsClick}>
              My Applications
            </button>
          )}

          {currentUser?.role === "recruiter" && (
            <button className="login-btn" onClick={handleRecruiterDashboard}>
              Recruiter Dashboard
            </button>
          )}

          {currentUser ? (
            <>
              <span className="welcome-text">
                Hi, {currentUser.name}
              </span>

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

          {loading && (
            <div className="message">
              Loading available jobs...
            </div>
          )}

          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="message">
              No jobs available right now.
            </div>
          )}

          <div className="jobs-grid">
            {jobs.map((job) => {
              const slotsLeft = getSlotsLeft(job);
              const isClosed =
                job.status === "closed" || slotsLeft === 0;

              return (
                <article
                  className={`job-card ${
                    isClosed ? "closed-job" : ""
                  }`}
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

                  <p className="company">
                    {job.companyName}
                  </p>

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
                      slotsLeft === 0
                        ? "full"
                        : slotsLeft === 1
                          ? "last"
                          : ""
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
                      onClick={() =>
                        !isClosed && setSelectedJob(job)
                      }
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
            Search jobs, manage your applications, upload your resume,
            and connect with recruiters through one simple platform.
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
            <button
              className="close-btn"
              onClick={() => setSelectedJob(null)}
            >
              ×
            </button>

            <p className="eyebrow">JOB DETAILS</p>

            <h2>{selectedJob.title}</h2>

            <p className="company">
              {selectedJob.companyName}
            </p>

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
                    getSlotsLeft(selectedJob) === 1
                      ? ""
                      : "s"
                  } left`}
            </div>

            {selectedJob.status === "closed" && (
              <div className="message error">
                This job is closed because all available positions
                have been filled.
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

              <p>
                👥 Openings: {selectedJob.openings}
              </p>
            </div>

            <h3>Skills</h3>

            <div className="skills">
              {selectedJob.skills?.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <h3>Job Description</h3>

            <p className="description">
              {selectedJob.description}
            </p>

            {selectedJob.applicationDeadline && (
              <p className="deadline">
                Application deadline:{" "}
                {new Date(
                  selectedJob.applicationDeadline,
                ).toLocaleDateString()}
              </p>
            )}

            {selectedJob.status === "closed" ||
            getSlotsLeft(selectedJob) === 0 ? (
              <button
                className="apply-now-btn"
                disabled
              >
                Job Closed
              </button>
            ) : (
              <button
                className="apply-now-btn"
                onClick={handleApply}
              >
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

            {authMode === "login" ? (
              <>
                <p className="eyebrow">
                  WELCOME BACK
                </p>

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

                  {authError && (
                    <div className="auth-error">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="apply-now-btn"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? "Logging in..."
                      : "Login"}
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
                <p className="eyebrow">
                  JOIN INFO BHARAT
                </p>

                <h2>Create Account</h2>

                <p className="auth-subtitle">
                  Create a candidate account.
                </p>

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

                  {authError && (
                    <div className="auth-error">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="apply-now-btn"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? "Creating account..."
                      : "Create Account"}
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

            <p className="eyebrow">
              CANDIDATE DASHBOARD
            </p>

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
                {applicationsLoading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {applicationsLoading &&
              applications.length === 0 && (
                <div className="message">
                  Loading your applications...
                </div>
              )}

            {applicationsError && (
              <div className="message error">
                {applicationsError}
              </div>
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
                  <div
                    className="application-card"
                    key={application._id}
                  >
                    <div className="application-main">
                      <div>
                        <h3>
                          {job?.title ||
                            "Job no longer available"}
                        </h3>

                        <p className="company">
                          {job?.companyName ||
                            "Unknown company"}
                        </p>
                      </div>

                      <span className="application-status">
                        {application.status || "Applied"}
                      </span>
                    </div>

                    <div className="application-info">
                      {job?.location && (
                        <span>📍 {job.location}</span>
                      )}

                      {job?.employmentType && (
                        <span>
                          💼 {job.employmentType}
                        </span>
                      )}

                      {job?.status === "closed" && (
                        <span>🔒 Job Closed</span>
                      )}
                    </div>

                    <div className="application-footer">
                      <span>
                        Applied:{" "}
                        {application.createdAt
                          ? new Date(
                              application.createdAt,
                            ).toLocaleDateString()
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

      {/* RECRUITER DASHBOARD */}

      {showRecruiterDashboard && (
        <div className="job-modal">
          <div className="job-modal-content recruiter-modal">
            <button
              className="close-btn"
              onClick={() =>
                setShowRecruiterDashboard(false)
              }
            >
              ×
            </button>

            <p className="eyebrow">
              RECRUITER DASHBOARD
            </p>

            <h2>Recruiter Dashboard</h2>

            {/* POST NEW JOB */}

            <div className="post-job-header">
              <div>
                <h3>Manage Jobs</h3>

                <p>
                  Create and manage your job postings.
                </p>
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
                    {recruiterJobs.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <button
                  className="apply-btn"
                  onClick={fetchRecruiterJobs}
                  disabled={recruiterJobsLoading}
                >
                  {recruiterJobsLoading
                    ? "Refreshing..."
                    : "Refresh Jobs"}
                </button>
              </div>

              {recruiterJobsError && (
                <div className="message error">
                  {recruiterJobsError}
                </div>
              )}

              {recruiterJobsLoading &&
                recruiterJobs.length === 0 && (
                  <div className="message">
                    Loading your jobs...
                  </div>
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

                  const isClosed =
                    job.status === "closed" ||
                    slotsLeft === 0;

                  return (
                    <div
                      className="application-card"
                      key={job._id}
                    >
                      <div className="application-main">
                        <div>
                          <h3>{job.title}</h3>

                          <p className="company">
                            {job.companyName}
                          </p>
                        </div>

                        <span className="application-status">
                          {isClosed ? "Closed" : "Open"}
                        </span>
                      </div>

                      <div className="application-info">
                        <span>
                          📍 {job.location}
                        </span>

                        <span>
                          💼 {job.employmentType}
                        </span>

                        {job.salaryMin &&
                          job.salaryMax && (
                            <span>
                              💰 ₹
                              {(
                                job.salaryMin /
                                100000
                              ).toFixed(1)}
                              L – ₹
                              {(
                                job.salaryMax /
                                100000
                              ).toFixed(1)}
                              L
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
                          👥 {job.hiredCount || 0} /{" "}
                          {job.openings || 0} hired
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
                                slotsLeft === 1
                                  ? ""
                                  : "s"
                              } left`}
                        </span>
                      </div>

                      {job.skills?.length > 0 && (
                        <div className="skills">
                          {job.skills.map((skill) => (
                            <span key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="application-footer">
                        <span>
                          Posted:{" "}
                          {job.createdAt
                            ? new Date(
                                job.createdAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>

                        <span>
                          Status:{" "}
                          {isClosed
                            ? "Closed"
                            : "Open"}
                        </span>
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
                {recruiterApplications.length !== 1
                  ? "s"
                  : ""}
              </p>

              <button
                className="apply-btn"
                onClick={fetchRecruiterApplications}
                disabled={
                  recruiterApplicationsLoading
                }
              >
                {recruiterApplicationsLoading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {recruiterApplicationsLoading &&
              recruiterApplications.length === 0 && (
                <div className="message">
                  Loading applications...
                </div>
              )}

            {recruiterApplicationsError && (
              <div className="message error">
                {recruiterApplicationsError}
              </div>
            )}

            {!recruiterApplicationsLoading &&
              !recruiterApplicationsError &&
              recruiterApplications.length === 0 && (
                <div className="message">
                  No applications received yet.
                </div>
              )}

            <div className="applications-list">
              {recruiterApplications.map(
                (application) => {
                  const job = application.job;
                  const candidate =
                    application.candidate;
                  const candidateUser =
                    candidate?.user;

                  const status =
                    application.status || "Applied";

                  return (
                    <div
                      className="application-card recruiter-application"
                      key={application._id}
                    >
                      <div className="application-main">
                        <div>
                          <h3>
                            {candidateUser?.name ||
                              "Candidate"}
                          </h3>

                          <p className="company">
                            {candidateUser?.email ||
                              "Email unavailable"}
                          </p>
                        </div>

                        <span className="application-status">
                          {status}
                        </span>
                      </div>

                      <div className="application-info">
                        <span>
                          💼{" "}
                          {job?.title ||
                            "Unknown job"}
                        </span>

                        {job?.companyName && (
                          <span>
                            🏢 {job.companyName}
                          </span>
                        )}

                        {candidate?.city && (
                          <span>
                            📍 {candidate.city}
                          </span>
                        )}
                      </div>

                      {candidate?.skills?.length >
                        0 && (
                        <div className="skills">
                          {candidate.skills.map(
                            (skill) => (
                              <span key={skill}>
                                {skill}
                              </span>
                            ),
                          )}
                        </div>
                      )}

                      <div className="application-footer">
                        <span>
                          Applied:{" "}
                          {application.createdAt
                            ? new Date(
                                application.createdAt,
                              ).toLocaleDateString()
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
                              onClick={() =>
                                hireCandidate(
                                  application._id,
                                )
                              }
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
                          <span>
                            Application rejected
                          </span>
                        )}

                        {status === "Hired" && (
                          <span>
                            🎉 Candidate hired
                          </span>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
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

            <p className="auth-subtitle">
              Add a new position to Info Bharat.
            </p>

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
                <option value="Full-time">
                  Full-time
                </option>
                <option value="Part-time">
                  Part-time
                </option>
                <option value="Contract">
                  Contract
                </option>
                <option value="Internship">
                  Internship
                </option>
                <option value="Remote">
                  Remote
                </option>
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
                Enter how many candidates you want to hire
                for this position.
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

              <small>
                Separate skills with commas.
              </small>

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

              {postJobError && (
                <div className="auth-error">
                  {postJobError}
                </div>
              )}

              <button
                type="submit"
                className="apply-now-btn"
                disabled={postJobLoading}
              >
                {postJobLoading
                  ? "Posting Job..."
                  : "Post Job"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;