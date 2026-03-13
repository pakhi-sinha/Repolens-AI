import express from "express";
import crypto from "crypto";

const router = express.Router();

// In-memory store for shared analyses (use a database in production)
const sharedAnalyses = new Map();

/**
 * POST /api/share-analysis
 * Body: { repoUrl: string, repoInfo: object, analysis: object }
 * Returns: { shareId: string, shareUrl: string }
 */
router.post("/", (req, res) => {
    try {
        const { repoUrl, repoInfo, analysis } = req.body;

        if (!repoUrl || !analysis) {
            return res.status(400).json({ error: "repoUrl and analysis are required." });
        }

        // Generate a short unique ID
        const shareId = crypto.randomBytes(6).toString("hex"); // 12 char hex

        // Save the analysis
        sharedAnalyses.set(shareId, {
            repoUrl,
            repoInfo,
            analysis,
            createdAt: new Date().toISOString(),
        });

        console.log(`🔗 Shared analysis created: ${shareId} for ${repoInfo?.fullName || repoUrl}`);

        return res.json({
            shareId,
            shareUrl: `/shared/${shareId}`,
        });
    } catch (err) {
        console.error("❌ Error sharing analysis:", err.message);
        return res.status(500).json({ error: "Failed to share analysis." });
    }
});

/**
 * GET /api/share-analysis/:id
 * Returns the saved analysis data
 */
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const data = sharedAnalyses.get(id);
    if (!data) {
        return res.status(404).json({ error: "Shared analysis not found or has expired." });
    }

    console.log(`📖 Shared analysis loaded: ${id}`);
    return res.json(data);
});

export default router;
