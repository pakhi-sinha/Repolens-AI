import express from "express";
import { parseGitHubUrl } from "../utils/parseUrl.js";
import { fetchFileContent } from "../services/github.js";
import { explainFileWithAI } from "../services/ai.js";

const router = express.Router();

const MAX_FILE_SIZE = 100_000; // 100KB limit

/**
 * POST /api/explain-file
 * Body: { repoUrl: string, filePath: string }
 * Returns: { fileName, filePath, explanation }
 */
router.post("/", async (req, res) => {
    try {
        const { repoUrl, filePath, explanationLevel = "beginner" } = req.body;

        if (!repoUrl || !filePath) {
            return res
                .status(400)
                .json({ error: "repoUrl and filePath are required." });
        }

        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) {
            return res.status(400).json({ error: "Invalid GitHub URL." });
        }

        const { owner, repo } = parsed;
        console.log(`📄 Explaining file: ${owner}/${repo}/${filePath} (Level: ${explanationLevel})`);

        // 1. Fetch file content from GitHub
        console.log("   Fetching file content...");
        const fileData = await fetchFileContent(owner, repo, filePath);

        // 2. Check file size
        if (fileData.content.length > MAX_FILE_SIZE) {
            return res.status(413).json({
                error: `File is too large (${(fileData.content.length / 1024).toFixed(0)}KB). Maximum allowed is ${MAX_FILE_SIZE / 1024}KB.`,
            });
        }

        // 3. Explain with AI
        console.log("   Analyzing with AI...");
        const explanation = await explainFileWithAI({
            owner,
            repo,
            filePath,
            content: fileData.content,
            language: fileData.language,
            explanationLevel,
        });

        console.log(`   ✅ File explanation complete`);

        return res.json({
            fileName: filePath.split("/").pop(),
            filePath,
            language: fileData.language,
            explanation,
        });
    } catch (err) {
        console.error("❌ Error explaining file:", err.message);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message || "Failed to explain file.",
        });
    }
});

export default router;
