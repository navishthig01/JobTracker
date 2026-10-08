import { useEffect, useRef, useState } from "react";
import "./App.css";

/* ─────────────────────────────────────────────────────────────
   useCountUp — animates a number from 0 to `target`
   duration: animation length in ms
───────────────────────────────────────────────────────────── */
function useCountUp(target, duration = 600) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const prevTarget = useRef(target);

  useEffect(() => {
    // Only animate when target actually changes
    const from = prevTarget.current === target ? 0 : display;
    prevTarget.current = target;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

/* ─────────────────────────────────────────────────────────────
   StatCard — single stat with count-up + staggered fade-in
───────────────────────────────────────────────────────────── */
function StatCard({ value, label, accent, delay }) {
  const animated = useCountUp(value);
  return (
    <div
      className={`stat-card${accent ? " stat-total" : ""}`}
      style={{ animationDelay: delay }}
    >
      <span className="stat-number">{animated}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main App
───────────────────────────────────────────────────────────── */
function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  // Tracks the _id of the most-recently added job for slide-in animation
  const [newJobId, setNewJobId] = useState(null);

  /* ── Inject Google Fonts (no package, no index.html edit needed) ── */
  useEffect(() => {
    const id = "jobtrack-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  /* ── Fetch all jobs on mount ── */
  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch jobs");
        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setError("Unable to load applications. Please try again.");
        setLoading(false);
      });
  }, []);

  /* ── Add a new job ── */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (company.trim() === "" || role.trim() === "") {
      setFormError("Please fill in both Company name and Job role.");
      return;
    }
    setFormError("");

    const newJob = { company, role, status };

    try {
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        setFormError("Failed to add job. Please try again.");
        return;
      }

      const data = await response.json();

      // Mark this card as "new" so the slide-in animation fires
      setNewJobId(data._id);
      setTimeout(() => setNewJobId(null), 700);

      setJobs([data, ...jobs]);
      setCompany("");
      setRole("");
      setStatus("Applied");
    } catch (err) {
      console.error("Error adding job:", err);
      setFormError("Something went wrong. Please check your connection.");
    }
  };

  /* ── Update job status ── */
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedJob = await response.json();
      setJobs(jobs.map((job) => (job._id === id ? updatedJob : job)));
    } catch (err) {
      console.error("Error updating job:", err);
    }
  };

  /* ── Delete job ── */
  const deleteJob = async (id) => {
    setDeleteError("");
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setDeleteError("Failed to delete the job. Please try again.");
        return;
      }
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (err) {
      console.error("Error deleting job:", err);
      setDeleteError("Something went wrong while deleting. Please check your connection.");
    }
  };

  /* ── Derived state ── */
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalJobs     = jobs.length;
  const appliedJobs   = jobs.filter((j) => j.status === "Applied").length;
  const interviewJobs = jobs.filter((j) => j.status === "Interview").length;
  const rejectedJobs  = jobs.filter((j) => j.status === "Rejected").length;
  const selectedJobs  = jobs.filter((j) => j.status === "Selected").length;

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="site-header">
        <div className="header-icon" aria-hidden="true">💼</div>
        <h1 className="header-title">JobTrack</h1>
        <p className="header-sub">Keep every application organized.</p>
      </header>

      {/* ── Stats dashboard ── */}
      <div className="dashboard">
        <StatCard value={totalJobs}     label="Total"      accent delay="0.05s" />
        <StatCard value={appliedJobs}   label="Applied"          delay="0.10s" />
        <StatCard value={interviewJobs} label="Interviews"       delay="0.15s" />
        <StatCard value={rejectedJobs}  label="Rejected"         delay="0.20s" />
        <StatCard value={selectedJobs}  label="Selected"         delay="0.25s" />
      </div>

      {/* ── Add Job form ── */}
      <div className="form-card">
        <h2 className="section-title">Add Job Application</h2>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <input
            type="text"
            placeholder="Job role / position"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Selected">Selected</option>
          </select>
          <button type="submit">+ Add Job</button>
        </form>

        {formError && <p className="error-message">{formError}</p>}
      </div>

      {/* ── Applications section ── */}
      <div className="section-header">
        <h2 className="section-title">My Applications</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search company or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Selected">Selected</option>
          </select>
        </div>
      </div>

      {/* ── Job list ── */}
      <div className="jobs">
        {deleteError && <p className="error-message">{deleteError}</p>}

        {loading ? (
          <p className="state-message">Loading applications…</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">—</div>
            <p className="empty-text">No applications yet. Add your first one above.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className={`job-card status-${job.status}${job._id === newJobId ? " job-card--new" : ""}`}
            >
              {/* Left: company info */}
              <div className="card-info">
                <h3 className="card-company">{job.company}</h3>
                <div className="card-meta">
                  <span className="card-role">{job.role}</span>
                  <span className="card-dot" aria-hidden="true">·</span>
                  <span className="job-date">
                    {new Date(job.applicationDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Right: status pill + delete */}
              <div className="card-actions">
                <select
                  className="status-select"
                  data-status={job.status}
                  value={job.status}
                  onChange={(e) => updateStatus(job._id, e.target.value)}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Selected">Selected</option>
                </select>

                <button
                  className="delete-button"
                  onClick={() => deleteJob(job._id)}
                  aria-label={`Delete application for ${job.company}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default App;
