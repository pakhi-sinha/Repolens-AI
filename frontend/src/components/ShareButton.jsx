import { useState } from "react";
import { shareAnalysis } from "../utils/api";

export default function ShareButton({ repoUrl, repoInfo, analysis }) {
    const [status, setStatus] = useState("idle"); // idle | loading | copied | error
    const [errorMsg, setErrorMsg] = useState("");

    const handleShare = async () => {
        if (status === "loading") return;
        setStatus("loading");
        setErrorMsg("");

        try {
            const result = await shareAnalysis(repoUrl, repoInfo, analysis);

            // Build the full shareable URL
            const fullUrl = `${window.location.origin}${result.shareUrl}`;

            // Copy to clipboard
            await navigator.clipboard.writeText(fullUrl);
            setStatus("copied");

            // Reset after 3 seconds
            setTimeout(() => setStatus("idle"), 3000);
        } catch (err) {
            setErrorMsg(err.message || "Failed to share.");
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <button
            className={`share-btn share-btn--${status}`}
            onClick={handleShare}
            disabled={status === "loading"}
            title="Share this analysis"
        >
            {status === "idle" && (
                <>
                    <span className="share-btn__icon">🔗</span>
                    <span>Share Explanation</span>
                </>
            )}
            {status === "loading" && (
                <>
                    <span className="share-btn__icon share-btn__spinner">⏳</span>
                    <span>Generating link...</span>
                </>
            )}
            {status === "copied" && (
                <>
                    <span className="share-btn__icon">✅</span>
                    <span>Link copied!</span>
                </>
            )}
            {status === "error" && (
                <>
                    <span className="share-btn__icon">❌</span>
                    <span>{errorMsg || "Failed"}</span>
                </>
            )}
        </button>
    );
}
