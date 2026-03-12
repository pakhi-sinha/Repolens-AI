import { useState } from "react";

const EXAMPLES = [
    { name: "facebook/react", url: "https://github.com/facebook/react" },
    { name: "vuejs/vue", url: "https://github.com/vuejs/vue" },
    { name: "sindresorhus/is-odd", url: "https://github.com/sindresorhus/is-odd" },
    { name: "expressjs/express", url: "https://github.com/expressjs/express" },
];

export default function UrlInput({ onSubmit, isLoading }) {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        const trimmed = url.trim();
        if (!trimmed) {
            setError("Please enter a GitHub repository URL.");
            return;
        }

        // Basic client-side validation
        if (!trimmed.includes("github.com/")) {
            setError("Please enter a valid GitHub URL (e.g. https://github.com/owner/repo).");
            return;
        }

        onSubmit(trimmed);
    };

    const handleExample = (exampleUrl) => {
        setUrl(exampleUrl);
        setError("");
        onSubmit(exampleUrl);
    };

    return (
        <div className="url-input">
            <form onSubmit={handleSubmit}>
                <div className="url-input__wrapper">
                    <span className="url-input__icon">🔗</span>
                    <input
                        id="repo-url-input"
                        type="text"
                        className="url-input__field"
                        placeholder="Paste a GitHub repository URL..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        id="analyze-btn"
                        type="submit"
                        className="url-input__btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Analyzing..." : "🔍 Analyze"}
                    </button>
                </div>
            </form>

            {error && <div className="url-input__error">{error}</div>}

            <div className="url-input__examples">
                {EXAMPLES.map((ex) => (
                    <button
                        key={ex.name}
                        className="url-input__example-btn"
                        onClick={() => handleExample(ex.url)}
                        disabled={isLoading}
                    >
                        {ex.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
