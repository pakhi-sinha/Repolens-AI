import express from "express";
import { parseGitHubUrl } from "../utils/parseUrl.js";
import { validateAnalyzeRequest } from "../utils/validators.js";
import { fetchRepoData } from "../services/github.js";
import { analyzeWithAI } from "../services/ai.js";

const router = express.Router();

/**
 * POST /api/analyze
 * Body: { repoUrl: "https://github.com/owner/repo" }
 * Returns: { repoInfo, analysis }
 */
router.post("/", async (req, res) => {
    try {
        // 1. Validate input
        const validation = validateAnalyzeRequest(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.message });
        }

        // 2. Parse GitHub URL
        const parsed = parseGitHubUrl(req.body.repoUrl);
        if (!parsed) {
            return res.status(400).json({
                error:
                    "Invalid GitHub URL. Please provide a valid URL like https://github.com/owner/repo",
            });
        }

        const { owner, repo } = parsed;
        console.log(`🔍 Analyzing ${owner}/${repo}...`);

        // 3. Fetch repository data from GitHub
        console.log("📦 Fetching repository data from GitHub...");
        const repoData = await fetchRepoData(owner, repo);

        // 4. Analyze with AI
        const explanationLevel = req.body.explanationLevel || "beginner";
        console.log(`🤖 Sending to Gemini for analysis (Level: ${explanationLevel})...`);
        const analysis = await analyzeWithAI(repoData, explanationLevel);

        console.log(`✅ Analysis complete for ${owner}/${repo}`);

        // 5. Return structured response
        return res.json({
            repoInfo: repoData.repoInfo,
            analysis,
        });
    } catch (err) {
        console.error("❌ Error:", err.message);

        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message || "An unexpected error occurred.",
            details:
                statusCode === 500
                    ? "Internal server error. Check server logs for details."
                    : undefined,
        });
    }
});

export default router;
