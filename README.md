# 🔭 RepoLens AI

**Understand any GitHub repository in seconds** — AI-powered repository analysis tool.

Paste a GitHub URL and get a complete explanation: tech stack, architecture, code flow, difficulty rating, and a learning roadmap.

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

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)
- (Optional) A GitHub Personal Access Token for higher API rate limits

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd repolens-ai
```

### 2. Setup the Backend

```bash
cd server
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev
```

The server starts on `http://localhost:3001`.

### 3. Setup the Frontend

```bash
cd client
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

### 4. Use It

1. Open `http://localhost:5173` in your browser
2. Paste any public GitHub repository URL
3. Click **Analyze** and wait for the AI-generated explanation

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key |
| `GITHUB_TOKEN` | ❌ Optional | GitHub PAT for higher rate limits (60 → 5000 req/hr) |
| `PORT` | ❌ Optional | Backend server port (default: 3001) |

## Project Structure

```
repolens-ai/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # HomePage, ResultsPage
│   │   ├── styles/          # CSS design system
│   │   ├── utils/           # API calls
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   └── package.json
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # GitHub + AI services
│   │   ├── utils/           # URL parser, validators
│   │   └── index.js         # Server entry point
│   └── package.json
└── README.md
```

## License

MIT
