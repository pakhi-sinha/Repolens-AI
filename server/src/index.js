import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";
import explainFileRouter from "./routes/explainFile.js";
import repoChatRouter from "./routes/repoChat.js";
import shareAnalysisRouter from "./routes/shareAnalysis.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
app.use("/api/analyze", analyzeRouter);
app.use("/api/explain-file", explainFileRouter);
app.use("/api/repo-chat", repoChatRouter);
app.use("/api/share-analysis", shareAnalysisRouter);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Catch-all route to serve the React app for any other request
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log("");
    console.log("  🔭 RepoLens AI Server");
    console.log(`  ➜ Running on http://localhost:${PORT}`);
    console.log(`  ➜ Health check: http://localhost:${PORT}/api/health`);
    console.log("");

    if (!process.env.GEMINI_API_KEY) {
        console.log("  ⚠️  GEMINI_API_KEY not set! Copy .env.example to .env and add your key.");
        console.log("  ➜ Get a free key at https://aistudio.google.com");
        console.log("");
    }
});
