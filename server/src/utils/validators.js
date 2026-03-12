/**
 * Validates the analyze request body.
 * Returns { valid: true } or { valid: false, message: string }
 */
export function validateAnalyzeRequest(body) {
    if (!body || typeof body !== "object") {
        return { valid: false, message: "Request body is required." };
    }

    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== "string") {
        return {
            valid: false,
            message: "repoUrl is required and must be a string.",
        };
    }

    if (repoUrl.trim().length === 0) {
        return { valid: false, message: "repoUrl cannot be empty." };
    }

    if (repoUrl.length > 500) {
        return { valid: false, message: "repoUrl is too long." };
    }

    return { valid: true };
}
