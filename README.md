# AI Code Mentor 🚀

An intelligent code execution and debugging platform with modern DevOps integration.

## Features
- **Multi-language support:** Execute Python, JavaScript, Java, C, and C++ directly from the browser.
- **Real-time Code Execution:** Powered by a **self-hosted Piston** execution engine, ensuring containerized, sandboxed execution independent of external API restrictions.
- **AI Mentorship:** Integrated with Google Gemini AI to analyze execution errors and provide intelligent debugging tips, explanations, and optimizations with structured outputs.
- **Premium Interface:** A visually stunning dark-mode editor using Monaco Editor with a sleek split-pane layout designed for developers.
- **Robust DevOps Integration:**
  - Automated CI/CD through GitHub Actions for rapid testing and shipping.
  - Complete backend, frontend, database, and execution engine Dockerization.
  - Quick local setup using Docker Compose.

---

## DevOps Architecture

The application is deployed using a robust, multi-container Docker Compose architecture:
- **Frontend Container:** Multi-stage build (Node.js 22 to build, NGINX Alpine to serve). Exposes the UI on port `3000` (internal `80`).
- **Backend Container:** Multi-stage build (Maven/Temurin 17 to build, JDK 17 to run). Exposes the Spring Boot API on port `8082` (internal `8080`).
- **MongoDB Container:** Stores application data securely on the internal network with health-check monitoring.
- **Self-Hosted Piston Container:** Replaces the public Piston API to sandbox and execute code securely on the internal network without external rate limits or whitelists.
- **Piston Init Container:** An ephemeral Alpine Curl container that waits for Piston to start, then automatically provisions all required language packages (Python, JS, Java, C++, C).

All components communicate over an isolated internal `bridge` network (`app-network`). NGINX handles reverse-proxying frontend `/api/` calls seamlessly to the backend.

### GitHub Actions CI/CD Flow
The repository features an automated CI/CD pipeline (`.github/workflows/ci-cd.yml`) that triggers on pushes and pull requests to the `main` branch. 
It performs:
1. NPM frontend build validation.
2. Maven backend compilation and test execution.
3. Docker Compose configuration verification (`docker compose config`) to guarantee deployment stability.

---

## How to Deploy to Railway

To deploy this project to [Railway](https://railway.app/) directly from GitHub, follow these step-by-step instructions:

### Step 1: Push to GitHub
Commit and push your entire codebase to a public or private GitHub repository.

### Step 2: Create a Railway Project
1. Log into your Railway Dashboard.
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select your repository.
4. **Important:** When Railway asks to deploy the root directory, choose **Add Variables** or **Configure** instead of deploying immediately, or just let it fail and configure the services manually. 

### Step 3: Provision Services manually
Instead of relying on a single root service, create 4 separate services linked to your repository.
Delete any default service Railway created, and click **New** > **GitHub Repo** 4 times to create the following components:

#### 1. MongoDB (Database)
- It is highly recommended to use Railway's native database plugin instead of a Docker container for MongoDB.
- Click **New** > **Database** > **Add MongoDB**.
- This automatically generates a `MONGO_URL` in the environment.

#### 2. Piston (Execution Engine)
- Click **New** > **Docker Image**.
- Use the image: `ghcr.io/engineer-man/piston:latest`
- Go to the service **Settings** > **Networking**:
  - Expose Port `2000` (Keep it private, do not generate a public domain).
- Go to the service **Variables**:
  - Add `PORT=2000`.
- _Note: You will need to use Railway's built-in CLI or temporary command to run `node cli/index.js ppman install python javascript java c++ c` inside this container to install the languages._

#### 3. Backend (Spring Boot API)
- Click **New** > **GitHub Repo**, select your repo.
- Go to **Settings** > **Build**:
  - Set **Root Directory** to `/backend`.
  - Railway will automatically detect the Dockerfile or Maven.
- Go to **Variables**, add the following:
  - `SERVER_PORT=8080`
  - `GEMINI_API_KEY=your_gemini_api_key_here`
  - `SPRING_DATA_MONGODB_URI=${{MongoDB.MONGO_URL}}` (Use Railway's variable reference to connect to MongoDB).
  - `PISTON_API_URL=http://<YOUR_PISTON_SERVICE_NAME>.railway.internal:2000/api/v2/execute`
- Go to **Settings** > **Networking**:
  - Click **Generate Domain** (e.g., `backend-production.up.railway.app`).

#### 4. Frontend (React UI)
- Click **New** > **GitHub Repo**, select your repo.
- Go to **Settings** > **Build**:
  - Set **Root Directory** to `/frontend`.
  - Railway will detect the Dockerfile and use Vite + NGINX.
- Go to **Variables**, add:
  - `VITE_API_BASE_URL=https://backend-production.up.railway.app` (Replace with your backend's generated public domain from step 3).
- Go to **Settings** > **Networking**:
  - Click **Generate Domain** to get your public UI link!

---

## How to Run Locally

### Prerequisites
- Docker and Docker Compose

### Setup Instructions
1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in your Gemini API key.
3. At the root of the project, start the application:
```bash
docker compose up --build -d
```
4. Access the AI Code Mentor platform fully running at: `http://localhost:3000`

### Troubleshooting

#### Piston `ghcr.io` Pull Issues
If you encounter `Error response from daemon: error from registry: denied` while pulling the `ghcr.io/engineer-man/piston` image locally:
- This is typically due to anonymous rate-limiting by the GitHub Container Registry (GHCR). 
- **Fix:** Ensure you are logged into GHCR on Docker Desktop using a Personal Access Token (PAT). Run:
  ```bash
  echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
  ```
- Once logged in, rerun `docker compose up --build -d`.

#### Port Conflicts
If you encounter a `port is already allocated` error:
- Ensure no other local services (like a local MongoDB or Spring Boot process) are using ports `3000`, `8082`, or `27017`.
- Use `docker compose down` to clear any hanging containers, then restart.
