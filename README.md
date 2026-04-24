# Job Portal (Full Stack)

A full stack **Job Portal** application with separate **Backend** (Node.js + Express + MongoDB) and **Frontend** (React + Vite) codebases.

It supports:

- ✅ User authentication (Student + Recruiter roles) with JWT stored in HTTP-only cookies
- ✅ Profile management (bio, skills, resume upload, profile photo)
- ✅ Job search with filters, keyword search, sorting, and pagination
- ✅ Job posting (Recruiter-only) with company association and logo upload
- ✅ Save jobs (students) and apply to jobs
- ✅ Recruiter view of applicants + ability to update application status
- ✅ Password reset via email (token based) using SMTP
- ✅ Basic match score (skills vs requirements)
- ✅ File uploads to Cloudinary (profile/resume/company logo)

---

## 📁 Repository Structure

```
/Backend   - Express API + MongoDB + Auth + File Uploads
/Frontend  - React (Vite) application
```

---

## 🚀 Getting Started

### 1) Prerequisites

- Node.js 18+
- npm (or yarn)
- MongoDB (Atlas or local)
- Cloudinary account (for file uploads)
- SMTP credentials (Gmail / Mailgun / etc) for password reset emails

---

## 🧩 Backend (API)

### Install dependencies

```bash
cd Backend
npm install
```

### Environment variables

Create a `.env` file inside `Backend/` with these values:

```env
MONGO_URI=
JWT_SECRET=
PORT=5001

# Cloudinary (required for upload endpoints)
CLOUD_NAME=
CLOUD_API=
API_SECRET=

# Email (optional, but required for password reset email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Optional: frontend URL for password reset link
FRONTEND_URL=http://localhost:5175

# Optional: CORS origins (comma separated)
CORS_ORIGINS=http://localhost:5175,http://localhost:5173
```

> ⚠️ Do not commit `.env` to source control. Add it to `.gitignore`.

### Run backend (development)

```bash
cd Backend
npm run dev
```

The backend will start on `http://localhost:5001` (or whatever `PORT` you set).

---

## 🧠 Frontend (React + Vite)

### Install dependencies

```bash
cd Frontend
npm install
```

### Environment variables

Create a `.env` file inside `Frontend/` (or use `.env.local`) with:

```env
VITE_API_BASE_URL=http://localhost:5001
```

### Run frontend (development)

```bash
cd Frontend
npm run dev
```

The frontend will run on `http://localhost:5175` by default.

---

## 🔌 API Endpoints (Backend)

### Auth / User

- `POST /api/users/register` – Create Student / Recruiter account
- `POST /api/users/login` – Login (returns HTTP-only cookie)
- `POST /api/users/logout` – Logout (clears cookie)
- `POST /api/users/profile/update` – Update profile (auth required)
- `POST /api/users/forgot-password` – Request password reset email
- `POST /api/users/reset-password/:token` – Reset password

### Job Management

- `GET /api/job/get` – Search / filter jobs (auth required)
- `GET /api/job/get/:id` – Get job details (auth required)
- `GET /api/job/getadminjobs` – Recruiter’s jobs (Recruiter only)
- `POST /api/job/post` – Post a new job (Recruiter only)

### Company Management (Recruiter)

- `POST /api/company/register` – Register a company
- `GET /api/company/get` – Get your companies
- `GET /api/company/get/:id` – Get a company by ID
- `PUT /api/company/update/:id` – Update a company
- `DELETE /api/company/delete/:id` – Delete a company

### Applications

- `POST /api/application/apply/:id` – Apply to job by job ID (auth required)
- `GET /api/application/get` – Get applied jobs for current user
- `GET /api/application/:id/applicants` – Get applicants for a job (Recruiter only)
- `POST /api/application/status/:id/update` – Update application status (Recruiter only)

### Saved Jobs

- `GET /api/users/saved` – Get saved jobs (auth required)
- `POST /api/users/saved/toggle` – Toggle save/unsave a job (auth required)

---

## ⭐ Key Features

### Roles & Access

- **Student**: Browse/search jobs, save jobs, apply to jobs, update profile/resume.
- **Recruiter**: Create companies, post jobs, view applicants, and update their status.

### Resume & Logo Uploads

- Users can upload resume files and profile photos.
- Recruiters can upload company logos.
- All uploads are stored in Cloudinary (configured via environment variables).

### Match Score

Jobs include a basic match score computed from the user’s skills vs job requirements.

---

## ✅ Tips / Common Tasks

### Reset DB indexes for Company uniqueness

The backend drops an old unique index on `Company.name` on startup and enforces a unique index per recruiter.

### Working with cookies

The API uses an HTTP-only cookie named `token` for auth. Make sure `withCredentials: true` is enabled in your API client (frontend already uses it).

---

## 🛠️ Troubleshooting

- ✅ If login returns 401: ensure you are sending `role` (Student or Recruiter) and you are logging in with the matching role.
- ✅ If image uploads fail: confirm Cloudinary credentials are correct and `CLOUD_NAME`, `CLOUD_API`, `API_SECRET` are set.
- ✅ If password reset email doesn't send: ensure SMTP env vars are configured.

---

## 📦 Deployment (Basic)

1. Build frontend: `cd Frontend && npm run build`.
2. Serve the build with any static server (e.g. `serve`) or integrate into your backend.
3. Ensure backend env vars are set in production, including database URI and JWT secret.

---

## 🐳 Docker (Production)

This repository includes a root `Dockerfile` that:

- Installs backend and frontend dependencies
- Builds the React app (`Frontend/dist`)
- Serves the React build from the Express backend
- Runs on port `5000`

### 1) Build image

```bash
docker build -t job-portal:prod .
```

### 2) Run container

```bash
docker run --name job-portal-app -p 5000:5000 --env-file Backend/.env job-portal:prod
```

> Ensure `Backend/.env` includes production values like `MONGO_URI`, `JWT_SECRET`, and `PORT=5000`.

### 3) Verify running containers

```bash
docker ps
```

You should see `job-portal-app` mapped to `0.0.0.0:5000->5000/tcp`.

### 4) Optional: Run app + MongoDB with Docker Compose

```bash
docker compose up --build -d
```

Stop and remove containers:

```bash
docker compose down
```

---

## 🐳 Docker Setup

### Prerequisites

- Install Docker and Docker Compose on your system.

### Build and Run Containers

1. Navigate to the project root directory:

   ```bash
   cd C:\Users\hp\Desktop\Job-portal-application
   ```

2. Build and start the Docker containers:

   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - **Backend**: `http://localhost:5001` (or the port specified in your `docker-compose.yml` file).
   - **Frontend**: `http://localhost:5175` (or the port specified in your `docker-compose.yml` file).

4. To stop the containers:

   ```bash
   docker-compose down
   ```

### Verify Running Containers

To check if the containers are running, use:

```bash
docker ps
```

This will list all active containers.

### Logs

To view logs for a specific service, use:

```bash
docker-compose logs <service-name>
```

Replace `<service-name>` with the name of the service (e.g., `backend`, `frontend`, `mongo`).

### Access MongoDB

If MongoDB is running as a container, you can access it using:

```bash
docker exec -it <container-id> mongosh
```

Replace `<container-id>` with the ID of the MongoDB container from `docker ps`.

---

## 🧩 Notes

- This repository currently keeps the backend and frontend separated; you can run them in parallel locally.
- Backend includes basic socket.io setup, which can be extended for real-time notifications.

---

Happy coding! 🎉




<img width="1316" height="527" alt="Screenshot 2026-04-24 104252" src="https://github.com/user-attachments/assets/2367cd23-74fc-409d-acd4-7c53cc141ec3" />

<img width="1316" height="527" alt="Screenshot 2026-04-24 104252" src="https://github.com/user-attachments/assets/ac65276d-de4e-479d-a9b5-a30dfe200f0e" />


<img width="1540" height="785" alt="Screenshot 2026-04-24 104240" src="https://github.com/user-attachments/assets/f1038640-9812-477c-8d0b-e959998b04a6" />

<img width="1297" height="448" alt="Screenshot 2026-04-24 104226" src="https://github.com/user-attachments/assets/fb348a9b-fd10-4a48-b0d5-28b5c8295064" />






