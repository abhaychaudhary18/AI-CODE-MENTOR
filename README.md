# AI Code Mentor 🚀

An intelligent code execution and debugging platform with modern DevOps integration.

## Features
- **Multi-language support:** Execute Python, JavaScript, Java, C, and C++ directly from the browser.
- **Real-time Code Execution:** Powered by the fast and secure Piston API.
- **AI Mentorship:** Integrated with Google Gemini AI to analyze execution errors and provide intelligent debugging tips, explanations, and optimizations.
- **Premium Interface:** A visually stunning dark-mode editor using Monaco Editor with a sleek split-pane layout designed for developers.
- **Robust DevOps Integration:**
  - Automated CI/CD through GitHub Actions for rapid testing and shipping.
  - Complete backend & frontend Dockerization.
  - Quick local setup using Docker Compose.

## System Architecture
- **Frontend:** React.js + Vite + Monaco Editor
- **Backend:** Java 17 + Spring Boot + WebClient
- **Infrastructure:** Docker, Nginx, Maven

## How to Run Locally

### Prerequisites
- Docker and Docker Compose

### Setup Instructions
1. Clone the repository.
2. The Gemini API key is already configured in `application.properties` for testing purposes.
3. At the root of the project, run:
```bash
docker-compose up --build
```
4. Access the AI Code Mentor platform fully running at: `http://localhost:5173`

Enjoy the intelligent coding experience!
