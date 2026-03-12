/**
 * Parses a GitHub URL and extracts owner and repo name.
 *
 * Supports formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   https://github.com/owner/repo/tree/main/...
 *   github.com/owner/repo
 */
export function parseGitHubUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Trim and remove trailing slashes
  let cleaned = url.trim().replace(/\/+$/, "");

  // Add protocol if missing
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }

  try {
    const parsed = new URL(cleaned);

    // Verify it's a GitHub URL
    if (
      parsed.hostname !== "github.com" &&
      parsed.hostname !== "www.github.com"
    ) {
      return null;
    }

    // Extract path segments: /owner/repo/...
    const segments = parsed.pathname
      .split("/")
      .filter((s) => s.length > 0);

    if (segments.length < 2) {
      return null;
    }

    const owner = segments[0];
    let repo = segments[1];

    // Remove .git suffix if present
    if (repo.endsWith(".git")) {
      repo = repo.slice(0, -4);
    }

    // Validate owner and repo names (GitHub allows alphanumeric, hyphens, dots, underscores)
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(owner) || !validPattern.test(repo)) {
      return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
}
