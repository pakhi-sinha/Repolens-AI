import axios from "axios";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta";

// Gemini 2.5 Flash — smart + generous free tier
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Sends repository data to Gemini and returns a structured analysis.
 */
export async function analyzeWithAI(repoData, explanationLevel = "beginner") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        const error = new Error(
            "GEMINI_API_KEY is not set. Add it to your .env file."
        );
        error.statusCode = 500;
        throw error;
    }

    const { repoInfo, readme, languages, tree } = repoData;

    // Build language summary
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const langSummary = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, bytes]) => `${lang} (${((bytes / totalBytes) * 100).toFixed(1)}%)`)
        .join(", ");

    // Build tree summary (truncate if too large)
    const treeSummary = tree
        .slice(0, 300)
        .map((item) => `${item.type === "directory" ? "📁" : "📄"} ${item.path}`)
        .join("\n");

    // Truncate README if too large
    const readmeContent =
        readme.length > 8000
            ? readme.slice(0, 8000) + "\n\n[... README truncated for brevity ...]"
            : readme;

    let levelPrompt = "";
    if (explanationLevel === "beginner") {
        levelPrompt = "Explain this repository like you are teaching a 10-year-old who just started programming. Use simple words, short sentences, and real-world analogies. Make the overview, code flow, and explanations very easy to understand.";
    } else if (explanationLevel === "intermediate") {
        levelPrompt = "Explain this repository clearly for a beginner to intermediate developer. Include simple explanations of technical terms.";
    } else {
        levelPrompt = "Provide a detailed technical explanation suitable for an experienced software developer.";
    }

    const prompt = `${levelPrompt}
You are a senior software engineer and technical writer. Analyze the following GitHub repository and return a comprehensive, structured explanation.

REPOSITORY: ${repoInfo.fullName}
DESCRIPTION: ${repoInfo.description}
STARS: ${repoInfo.stars} | FORKS: ${repoInfo.forks}
TOPICS: ${repoInfo.topics.join(", ") || "None"}

LANGUAGES:
${langSummary || "Not detected"}

README:
${readmeContent || "No README available."}

FILE STRUCTURE:
${treeSummary || "File structure not available."}

Analyze this repository and respond with ONLY a valid JSON object (no markdown, no code fences) with these exact keys:

{
  "projectOverview": "A detailed 2-3 paragraph explanation of what this project does, its purpose, and who it's for.",

  "techStack": {
    "languages": ["list of programming languages"],
    "frameworks": ["list of frameworks and libraries"],
    "tools": ["list of build tools, bundlers, package managers"],
    "databases": ["list of databases if any, or empty array"]
  },

  "repoStructure": [
    { "folder": "folder name", "purpose": "what this folder contains and why it exists" }
  ],

  "keyFiles": [
    { "file": "filename or path", "purpose": "what this file does and why it's important" }
  ],

  "codeFlow": [
    { "step": 1, "title": "Step title", "description": "What happens at this step" }
  ],

  "howToRun": {
    "prerequisites": ["list of things needed before running"],
    "steps": ["step-by-step instructions to run the project"]
  },

  "difficultyLevel": {
    "level": "Beginner or Intermediate or Advanced or Expert",
    "score": 5,
    "reasoning": "Why this difficulty level was assigned"
  },

  "learningRoadmap": [
    { "topic": "topic name", "reason": "why learning this helps understand the project", "resources": ["optional helpful links or resource names"] }
  ],

  "architectureData": {
    "nodes": [
      { 
        "id": "client", 
        "label": "Client / User Interface",
        "explanation": "Handles the frontend rendering using React.",
        "relatedFiles": ["src/App.jsx", "src/index.js"]
      },
      { 
        "id": "server", 
        "label": "Server / Express App",
        "explanation": "REST API that serves data to the client.",
        "relatedFiles": ["server/index.js", "server/routes/api.js"]
      }
    ],
    "edges": [
      { "from": "client", "to": "server" }
    ]
  }
}

Be thorough, accurate, and helpful. Base your analysis on the actual code structure and README content provided.`;

    try {
        console.log(`    Using model: ${GEMINI_MODEL}`);
        const response = await axios.post(
            `${GEMINI_API}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json",
                },
            },
            { timeout: 120000 } // 2 minute timeout for large repos
        );

        const text =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Empty response from Gemini API.");
        }

        // Parse JSON response
        const analysis = JSON.parse(text);

        // Validate that required keys exist
        const requiredKeys = [
            "projectOverview",
            "techStack",
            "repoStructure",
            "keyFiles",
            "codeFlow",
            "howToRun",
            "difficultyLevel",
            "learningRoadmap",
            "architectureData",
        ];

        for (const key of requiredKeys) {
            if (!(key in analysis)) {
                throw new Error(`AI response missing required field: ${key}`);
            }
        }

        return analysis;
    } catch (err) {
        if (err.response?.status === 400) {
            const error = new Error("Invalid Gemini API key. Check your .env file.");
            error.statusCode = 401;
            throw error;
        }
        if (err.response?.status === 429) {
            const error = new Error(
                "Gemini API rate limit reached. Try again in a minute, or switch models by setting GEMINI_MODEL in .env (e.g. gemini-2.0-flash)."
            );
            error.statusCode = 429;
            throw error;
        }
        if (err instanceof SyntaxError) {
            const error = new Error(
                "AI returned an invalid response. Please try again."
            );
            error.statusCode = 502;
            throw error;
        }
        throw err;
    }
}

/**
 * Sends a single file's content to Gemini and returns a structured explanation.
 */
export async function explainFileWithAI({ owner, repo, filePath, content, language, explanationLevel = "beginner" }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        const error = new Error("GEMINI_API_KEY is not set.");
        error.statusCode = 500;
        throw error;
    }

    let levelPrompt = "";
    if (explanationLevel === "beginner") {
        levelPrompt = "Explain this file like you are teaching a 10-year-old who just started programming. Use simple words, short sentences, and real-world analogies. Avoid complex technical jargon and clarify concepts simply.";
    } else if (explanationLevel === "intermediate") {
        levelPrompt = "Explain this file clearly for a beginner to intermediate developer. Include simple explanations of technical terms if used.";
    } else {
        levelPrompt = "Provide a detailed technical explanation suitable for an experienced software developer.";
    }

    const prompt = `${levelPrompt}
You are an expert developer helping someone understand a specific file in a codebase.
Analyze this file from the GitHub repository ${owner}/${repo}.

FILE PATH: ${filePath}
LANGUAGE: ${language}

CONTENT:
\`\`\`
${content}
\`\`\`

Return a structured JSON explanation with these EXACT keys (no markdown, no code fences):
{
  "purpose": "A clear 1-2 sentence explanation of what this file's main job is.",
  "components": [
    { "name": "function/class name", "description": "what it does" }
  ],
  "dependencies": ["list of key libraries/modules this file imports and uses"],
  "connections": "Explain how this file fits into or is used by the rest of the project."
}`;

    try {
        console.log(`    Using model for file: ${GEMINI_MODEL}`);
        const response = await axios.post(
            `${GEMINI_API}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json",
                },
            },
            { timeout: 60000 }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response from AI.");

        const analysis = JSON.parse(text);

        const requiredKeys = ["purpose", "components", "dependencies", "connections"];
        for (const key of requiredKeys) {
            if (!(key in analysis)) {
                throw new Error(`AI response missing field: ${key}`);
            }
        }

        return analysis;
    } catch (err) {
        if (err.response?.status === 429) {
            const error = new Error("Gemini API rate limit reached. Try again later.");
            error.statusCode = 429;
            throw error;
        }
        if (err instanceof SyntaxError) {
            const error = new Error("AI returned an invalid explanation.");
            error.statusCode = 502;
            throw error;
        }
        throw err;
    }
}

/**
 * Chat with a repository — supports multi-turn conversation.
 * @param {object} params
 * @param {object} params.repoContext - Analysis data for the repo
 * @param {Array<{role: string, content: string}>} params.messages - Conversation history
 * @param {string} params.explanationLevel - beginner | intermediate | advanced
 */
export async function chatWithRepoAI({ repoContext, messages, explanationLevel = "beginner" }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        const error = new Error("GEMINI_API_KEY is not set.");
        error.statusCode = 500;
        throw error;
    }

    let levelPrompt = "";
    if (explanationLevel === "beginner") {
        levelPrompt = "Answer in very simple language. Use analogies and avoid technical jargon where possible.";
    } else if (explanationLevel === "intermediate") {
        levelPrompt = "Answer clearly for a beginner-to-intermediate developer. Briefly explain technical terms.";
    } else {
        levelPrompt = "Provide a detailed technical answer suitable for an experienced software developer.";
    }

    const keyFilesList = (repoContext.keyFiles || []).map(f => "- " + f.file + ": " + f.purpose).join("\n") || "Not available.";
    const structureList = (repoContext.repoStructure || []).map(f => "- " + f.folder + ": " + f.purpose).join("\n") || "Not available.";
    const codeFlowList = (repoContext.codeFlow || []).map(s => s.step + ". " + s.title + ": " + s.description).join("\n") || "Not available.";

    const systemContext = `${levelPrompt}
You are an expert software engineer helping a developer understand a GitHub repository through a conversation. Answer concisely and reference specific files or folders when relevant. If a question is unrelated to the repository, politely redirect.

Here is information about the repository:

PROJECT OVERVIEW:
${repoContext.projectOverview || "Not available."}

TECH STACK:
${JSON.stringify(repoContext.techStack || {}, null, 2)}

KEY FILES:
${keyFilesList}

REPOSITORY STRUCTURE:
${structureList}

CODE FLOW:
${codeFlowList}`;

    // Build multi-turn contents array for Gemini
    // First message is the system context + first user message
    const contents = [];

    messages.forEach((msg, index) => {
        const role = msg.role === "user" ? "user" : "model";
        let text = msg.content;

        // Prepend system context to the very first user message
        if (index === 0 && role === "user") {
            text = `${systemContext}\n\nUser's question: ${text}`;
        }

        contents.push({
            role,
            parts: [{ text }],
        });
    });

    try {
        console.log(`    Chat using model: ${GEMINI_MODEL} (${messages.length} messages)`);
        const response = await axios.post(
            `${GEMINI_API}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
                contents,
                generationConfig: {
                    temperature: 0.5,
                },
            },
            { timeout: 60000 }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response from AI.");

        return { answer: text };
    } catch (err) {
        if (err.response?.status === 429) {
            const error = new Error("Gemini API rate limit reached. Try again later.");
            error.statusCode = 429;
            throw error;
        }
        throw err;
    }
}
