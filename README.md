# 🔭 RepoLens AI

**Understand any GitHub repository in seconds** — AI-powered repository analysis tool.

Paste a GitHub URL and get a complete explanation: tech stack, architecture, code flow, difficulty rating, and a learning roadmap.

🚀 **Live Demo:** [https://repolens-ai-bl9l.onrender.com/](https://repolens-ai-bl9l.onrender.com/)

## Features

- 📋 **Project Overview** — What the repository does
- ⚙️ **Tech Stack** — Languages, frameworks, tools, databases
- 📂 **Repository Structure** — Purpose of main folders
- 📄 **Key Files** — Most important files explained
- 🔄 **Code Flow** — Step-by-step execution walkthrough
- 🚀 **How to Run** — Install and run instructions
- 📊 **Difficulty Level** — Complexity rating (1–10)
- 🗺️ **Learning Roadmap** — What to learn to understand the code

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS |
| Backend | Node.js + Express |
| AI Model | Google Gemini 2.5 Pro |
| GitHub Data | GitHub REST API v3 |

## Getting Started (Local)

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)
- (Optional) A GitHub Personal Access Token for higher API rate limits

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Repo-lens
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   ```

4. **Run the application:**
   ```bash
   npm start
   ```
   The server starts on `http://localhost:5000`.

## Deployment (Render)

### 1. Push to GitHub
Ensure your repository is pushed to your GitHub account.

### 2. Create a Web Service on Render
1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your repository.
3. Use the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   Add the following in the Render dashboard:
   - `GEMINI_API_KEY`: Your key from Google AI Studio.
   - `GITHUB_TOKEN`: (Highly recommended) Your GitHub PAT to avoid 403 Forbidden errors.
   - `NODE_VERSION`: `18` (or higher).

## Project Structure

```
Repo-lens/
├── frontend/        # React + Vite frontend
├── routes/          # API routes
├── services/        # GitHub + AI logic
├── utils/           # URL parsing and validation
├── server.js        # Main entry point (Backend)
├── package.json     # Project configuration
└── README.md
```

## License

MIT
