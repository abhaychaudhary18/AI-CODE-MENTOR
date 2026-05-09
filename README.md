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
