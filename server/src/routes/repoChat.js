import express from "express";
import { chatWithRepoAI } from "../services/ai.js";

const router = express.Router();

/**
 * POST /api/repo-chat
 * Body: { messages: Array<{role, content}>, repoContext: object, explanationLevel?: string }
 * Returns: { answer: string }
 */
router.post("/", async (req, res) => {
    try {
        const { messages, repoContext, explanationLevel = "beginner" } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Messages array is required." });
        }

        if (!repoContext) {
            return res.status(400).json({ error: "Repository context is required. Analyze the repo first." });
        }

        const lastMessage = messages[messages.length - 1];
        console.log(`💬 Repo chat (${messages.length} msgs): "${(lastMessage?.content || "").slice(0, 80)}..." (Level: ${explanationLevel})`);

        const result = await chatWithRepoAI({
            repoContext,
            messages,
            explanationLevel,
        });

        console.log(`   ✅ Chat response generated`);

        return res.json(result);
    } catch (err) {
        console.error("❌ Error in repo chat:", err.message);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message || "Failed to answer question.",
        });
    }
});

export default router;
