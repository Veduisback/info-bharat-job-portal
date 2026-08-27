# Info Bharat Job Portal 💼🚀

A full-stack job portal web application built using the MERN stack (MongoDB, Express, React, Node.js). The platform connects job seekers with recruiters, featuring role-based dashboards, authentication, job postings, resume management, and application tracking.

Live Demo: [https://veduisback.github.io/info-bharat-job-portal](https://veduisback.github.io/info-bharat-job-portal)  
Backend API: [https://info-bharat-job-portal.onrender.com](https://info-bharat-job-portal.onrender.com)

---

## 📸 Key Features

- **Authentication & Authorization**: JWT-based user authentication supporting Candidate, Recruiter, and Admin roles.
- **Job Seeker Features**:
  - Browse and search public job listings.
  - Apply to job openings with one click.
  - Candidate profile management with PDF resume uploads via Cloudinary.
  - Track submitted job applications and status updates.
- **Recruiter Features**:
  - Post, edit, close, and delete job listings.
  - View applicant profiles and resumes.
  - Update candidate application status (Shortlisted, Rejected, Hired).
- **Admin Dashboard**: Comprehensive overview of site metrics and platform statistics.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.js
- **File Storage**: Cloudinary (Resume PDF uploads via Multer)
- **Hosting & Deployment**:
  - Frontend: GitHub Pages
  - Backend API: Render
  - Database: MongoDB Atlas

---

## 📁 Repository Structure

```text
info-bharat-job-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
