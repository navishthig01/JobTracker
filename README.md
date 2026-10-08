# JobTrack

JobTrack is a full-stack MERN job application tracker that helps users organize and monitor their internship and job applications in one place. It provides a clean dashboard to add, view, update, search, and delete applications, with live statistics showing the breakdown of application statuses. Built as a Software Engineering internship assignment.

---

## Features

- **Add job applications** — submit a company name, job role, and initial status through a form
- **Store applications in MongoDB** — all data is persisted in a MongoDB Atlas database via Mongoose
- **View all applications** — browse every application in a clean card-based list
- **Update application status** — change status inline directly from each card
- **Delete applications** — remove applications with a single click and reliable server confirmation
- **Search** — filter the list by company name or job role in real time
- **Filter by status** — narrow the list to Applied, Interview, Rejected, or Selected
- **Dashboard statistics** — live counts for Total, Applied, Interviews, Rejected, and Selected
- **Application date display** — each card shows the date the application was recorded
- **Form validation** — prevents submission with empty company or role fields and shows a clear error message
- **API error handling** — POST and DELETE failures are caught and shown to the user; the UI is not corrupted on failure
- **Responsive and polished UI** — editorial-style design that works on desktop, tablet, and mobile

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React | UI component library |
| Vite | Development server and build tool |
| JavaScript (ES6+) | Application logic |
| CSS | Styling and responsive layout |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API server |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modelling |

### Other
| Tool | Purpose |
|---|---|
| REST API | Communication between frontend and backend |
| Git / GitHub | Version control |
| Kiro CLI | AI-assisted development tool |

---

## How It Works

The frontend is a React application served by Vite. When the page loads, React fetches all existing job applications from the Express backend using the `GET /api/jobs` endpoint and displays them as cards. When a user fills in the form and clicks **+ Add Job**, React sends a `POST` request with the application data. The Express server receives the request, validates it through Mongoose, saves it to a MongoDB Atlas database, and returns the saved document. React then adds the new card to the list without reloading the page.

Status updates use `PUT /api/jobs/:id` and deletions use `DELETE /api/jobs/:id`, both triggered directly from the job card. All state lives in React — the database is the source of truth, and the UI only updates after the server confirms success.

---

## Project Structure

```
Job Tracker/
├── client/                  # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── App.jsx          # Main component — all state, handlers, and UI
│       ├── App.css          # All application styles
│       ├── index.css        # Bare CSS reset
│       └── main.jsx         # React entry point
├── server/                  # Express + Mongoose backend
│   ├── models/
│   │   └── job.js           # Mongoose Job schema
│   ├── routes/
│   │   └── jobroutes.js     # REST API route handlers
│   ├── server.js            # Express app, middleware, DB connection
│   └── .env                 # Environment variables (NOT committed to GitHub)
├── .gitignore
└── README.md
```

> `.env` contains your MongoDB connection string and is excluded from version control via `.gitignore`. Never commit this file.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | Retrieve all job applications, sorted newest first |
| `POST` | `/api/jobs` | Create a new job application |
| `PUT` | `/api/jobs/:id` | Update the status of an existing application |
| `DELETE` | `/api/jobs/:id` | Delete a job application by ID |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (included with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account with a free cluster

### Setup Instructions

**1. Clone the repository**

```bash
git clone https://github.com/navishthig01/JobTracker.git
cd JobTracker
```

**2. Install frontend dependencies**

```bash
cd client
npm install
```

**3. Install backend dependencies**

```bash
cd ../server
npm install
```

**4. Configure environment variables**

Create a file at `server/.env` with the following content:

```
MONGO_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with the connection string from your MongoDB Atlas cluster.  
**Do not share or commit this file.**

**5. Start the backend server**

```bash
# From the server/ directory
node server.js
```

You should see:
```
MongoDB connected successfully
Server is running on http://localhost:5000
```

**6. Start the frontend development server**

Open a second terminal window:

```bash
cd client
npm run dev
```

**7. Open the application**

Visit the local URL shown in the Vite terminal output (typically `http://localhost:5173`).

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `MONGO_URI` | `server/.env` | MongoDB Atlas connection string |

The `server/.env` file is listed in `.gitignore` and must never be committed to GitHub. When deploying or sharing the project, provide the connection string separately through a secure channel or environment configuration.

---

## AI-Assisted Development

This project was developed with the assistance of **Kiro CLI**, an AI development tool. The following tasks involved Kiro's contributions:

1. **Architecture review and bug identification**  
   Kiro reviewed the existing project structure, identified bugs (silent form submission with empty fields, unguarded `setJobs` after a failed POST, missing `response.ok` check on DELETE), and suggested prioritised improvements. These were evaluated manually before any changes were made.

2. **Form validation and API error handling**  
   Kiro implemented client-side validation to prevent empty form submissions, added `response.ok` checks after POST and DELETE requests, and added user-facing error messages for each failure case. The changes were reviewed line by line and tested against the running backend.

3. **CSS deduplication**  
   The original `App.css` contained three identical copies of the `.filters` and `.delete-button` rules. Kiro cleaned these out and merged two separate `@media (max-width: 700px)` blocks into one, preserving the visual appearance exactly.

4. **Application date display**  
   Kiro added the `applicationDate` field (already stored in MongoDB) to each job card, formatted as `8 Oct 2026` using `toLocaleDateString`. A `.job-date` CSS class was added for secondary visual styling.

5. **Frontend UI redesign**  
   Kiro redesigned the UI progressively across several iterations into the final editorial-style design: warm cream background, Playfair Display serif typography loaded via Google Fonts, animated count-up statistics, organic-radius stat cards with staggered fade-in, pill-shaped inputs, gold gradient button, pastel status pills, ghost delete button, and a slide-in animation for newly added cards. Each iteration was reviewed, tested in the browser, and refined.

---

## AI Development Experience

Kiro CLI was used as a development assistant throughout this project, not as a replacement for understanding the code. Each suggestion Kiro made was read carefully, the reasoning was evaluated, and the changes were applied only after they made sense. After every modification the application was manually tested — adding jobs, updating statuses, deleting entries, triggering validation errors, and checking the responsive layout. This approach meant that Kiro accelerated the work without introducing changes that were not understood or verified.

---

## Future Improvements

The following features are not currently implemented but represent realistic next steps:

- **User authentication** — accounts so each user sees only their own applications
- **Application notes** — a free-text notes field per application for interview feedback or contacts
- **Interview scheduling** — date and time fields for scheduled interviews
- **Job links** — store the original job posting URL with each application
- **Analytics** — charts showing application trends over time
- **Deployment** — hosting the frontend (e.g. Vercel) and backend (e.g. Render) for public access

---

## Screenshots

> Screenshots of the finished application will be added here.

---

## License

This project was created as a Software Engineering internship assignment. It is intended for educational and evaluation purposes.
