const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? "" : "http://localhost:5000");

/**
 * Analyzes a GitHub repository via the backend API.
 * @param {string} repoUrl - Full GitHub repository URL
 * @returns {Promise<{ repoInfo: object, analysis: object }>}
 */
export async function analyzeRepo(repoUrl, explanationLevel = "beginner") {
    const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, explanationLevel }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
}

/**
 * Explains a specific file from a GitHub repository via the backend API.
 * @param {string} repoUrl - Full GitHub repository URL
 * @param {string} filePath - Path to the file in the repository
 * @returns {Promise<{ fileName: string, filePath: string, language: string, explanation: object }>}
 */
export async function explainFile(repoUrl, filePath, explanationLevel = "beginner") {
    const response = await fetch(`${API_BASE}/api/explain-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, filePath, explanationLevel }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
}

/**
 * Chat with the repository — send conversation history for multi-turn support.
 * @param {object} repoContext - The analysis object from a previous analyzeRepo call
 * @param {Array<{role: string, content: string}>} messages - Conversation history
 * @param {string} explanationLevel - beginner | intermediate | advanced
 * @returns {Promise<{ answer: string }>}
 */
export async function askRepoQuestion(repoContext, messages, explanationLevel = "beginner") {
    const response = await fetch(`${API_BASE}/api/repo-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoContext, messages, explanationLevel }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
}

/**
 * Share an analysis — saves it on the server and returns a share URL.
 */
export async function shareAnalysis(repoUrl, repoInfo, analysis) {
    const response = await fetch(`${API_BASE}/api/share-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, repoInfo, analysis }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
}

/**
 * Load a shared analysis by ID.
 */
export async function getSharedAnalysis(shareId) {
    const response = await fetch(`${API_BASE}/api/share-analysis/${shareId}`, {
        method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
}
