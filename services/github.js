import axios from "axios";

const GITHUB_API = "https://api.github.com";

/**
 * Creates an Axios instance for GitHub API with optional auth token.
 */
function createClient() {
    const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "RepoLens-AI",
    };

    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    return axios.create({ baseURL: GITHUB_API, headers, timeout: 15000 });
}

/**
 * Fetches all repository data in parallel.
 * Returns { repoInfo, readme, languages, tree, importantFiles }
 */
export async function fetchRepoData(owner, repo) {
    const client = createClient();

    const [repoRes, readmeRes, langRes, treeRes] = await Promise.allSettled([
        client.get(`/repos/${owner}/${repo}`),
        client.get(`/repos/${owner}/${repo}/readme`),
        client.get(`/repos/${owner}/${repo}/languages`),
        fetchTree(client, owner, repo),
    ]);

    // Repo metadata is required — if it fails, throw
    if (repoRes.status === "rejected") {
        const err = repoRes.reason;
        if (err.response?.status === 404) {
            const error = new Error(`Repository "${owner}/${repo}" not found.`);
            error.statusCode = 404;
            throw error;
        }
        if (err.response?.status === 403) {
            const error = new Error(
                "GitHub API rate limit exceeded or access forbidden. Please add a GITHUB_TOKEN to your environment/Secrets to continue."
            );
            error.statusCode = 429;
            throw error;
        }
        if (err.response?.status === 401) {
            const error = new Error(
                "Invalid GITHUB_TOKEN. Please check your environment/Secrets."
            );
            error.statusCode = 401;
            throw error;
        }
        throw err;
    }

    const repoData = repoRes.value.data;

    // Decode README from Base64 (may not exist for some repos)
    let readmeContent = "";
    if (readmeRes.status === "fulfilled" && readmeRes.value.data?.content) {
        readmeContent = Buffer.from(
            readmeRes.value.data.content,
            "base64"
        ).toString("utf-8");
    }

    // Languages object: { JavaScript: 50000, CSS: 12000, ... }
    const languages =
        langRes.status === "fulfilled" ? langRes.value.data : {};

    // File tree array
    const tree = treeRes.status === "fulfilled" ? treeRes.value : [];

    // Filter and fetch important files
    const importantFiles = await fetchImportantFiles(client, owner, repo, tree);

    return {
        repoInfo: {
            name: repoData.name,
            fullName: repoData.full_name,
            description: repoData.description || "No description provided.",
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            defaultBranch: repoData.default_branch,
            url: repoData.html_url,
            topics: repoData.topics || [],
        },
        readme: readmeContent,
        languages,
        tree,
        importantFiles,
    };
}

/**
 * Identifies and fetches content for key repository files.
 */
async function fetchImportantFiles(client, owner, repo, tree) {
    const importantPaths = tree
        .filter(item => item.type === "file")
        .filter(item => {
            const path = item.path.toLowerCase();
            const name = path.split("/").pop();

            // Ignore patterns
            if (path.includes("node_modules/") || path.includes("dist/") || path.includes("build/") || path.includes("package-lock.json")) {
                return false;
            }

            // Important files
            return (
                path === "package.json" ||
                path.startsWith("src/") ||
                ["index.js", "server.js", "app.js", "main.js"].includes(name)
            );
        })
        .slice(0, 10); // Limit to 10 files to keep requests reasonable

    const fileContents = await Promise.allSettled(
        importantPaths.map(async (file) => {
            try {
                const res = await client.get(`/repos/${owner}/${repo}/contents/${file.path}`);
                const content = Buffer.from(res.data.content, "base64").toString("utf-8");
                return { path: file.path, content };
            } catch {
                return null;
            }
        })
    );

    return fileContents
        .filter(res => res.status === "fulfilled" && res.value)
        .map(res => res.value);
}

/**
 * Fetches the full recursive file tree for the default branch.
 */
async function fetchTree(client, owner, repo) {
    try {
        // First get the default branch from repo info
        const repoRes = await client.get(`/repos/${owner}/${repo}`);
        const defaultBranch = repoRes.data.default_branch;

        const treeRes = await client.get(
            `/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
        );

        if (treeRes.data.tree) {
            return treeRes.data.tree
                .map((item) => ({
                    path: item.path,
                    type: item.type === "tree" ? "directory" : "file",
                }))
                .slice(0, 500); // Truncate to avoid huge payloads
        }
        return [];
    } catch {
        return [];
    }
}

/**
 * Fetches a single file's content from a repository.
 * Returns { content: string, language: string }
 */
export async function fetchFileContent(owner, repo, filePath) {
    const client = createClient();

    try {
        const res = await client.get(
            `/repos/${owner}/${repo}/contents/${filePath}`
        );

        if (res.data.type !== "file") {
            const error = new Error(`"${filePath}" is not a file.`);
            error.statusCode = 400;
            throw error;
        }

        // Decode Base64 content
        const content = Buffer.from(res.data.content, "base64").toString("utf-8");

        // Detect language from file extension
        const ext = filePath.split(".").pop()?.toLowerCase() || "";
        const langMap = {
            js: "JavaScript", jsx: "JavaScript (React)", ts: "TypeScript",
            tsx: "TypeScript (React)", py: "Python", java: "Java",
            rb: "Ruby", go: "Go", rs: "Rust", cpp: "C++", c: "C",
            cs: "C#", php: "PHP", swift: "Swift", kt: "Kotlin",
            html: "HTML", css: "CSS", scss: "SCSS", json: "JSON",
            yaml: "YAML", yml: "YAML", md: "Markdown", sql: "SQL",
            sh: "Shell", bash: "Shell", dockerfile: "Dockerfile",
            toml: "TOML", xml: "XML", vue: "Vue", svelte: "Svelte",
        };

        return {
            content,
            language: langMap[ext] || ext.toUpperCase() || "Unknown",
        };
    } catch (err) {
        if (err.statusCode) throw err;
        if (err.response?.status === 404) {
            const error = new Error(`File "${filePath}" not found in ${owner}/${repo}.`);
            error.statusCode = 404;
            throw error;
        }
        throw err;
    }
}
