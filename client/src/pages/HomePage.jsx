import UrlInput from "../components/UrlInput";

export default function HomePage({ onAnalyze, isLoading }) {
    return (
        <main className="home">
            <div className="home__content">
                <div className="home__badge">✨ AI-Powered Repository Analysis</div>

                <h1 className="home__title">
                    Understand any <span>GitHub repo</span> in seconds
                </h1>

                <p className="home__subtitle">
                    Paste a GitHub URL and get a complete AI-generated explanation — tech stack,
                    architecture, code flow, difficulty level, and a learning roadmap.
                </p>

                <div className="home__input-wrapper">
                    <UrlInput onSubmit={onAnalyze} isLoading={isLoading} />
                </div>

                <div className="home__features">
                    <div className="home__feature">
                        <div className="home__feature-icon">⚡</div>
                        <h3 className="home__feature-title">Instant Analysis</h3>
                        <p className="home__feature-desc">
                            Get a full breakdown of any public repository in under 30 seconds.
                        </p>
                    </div>
                    <div className="home__feature">
                        <div className="home__feature-icon">🧠</div>
                        <h3 className="home__feature-title">AI-Powered</h3>
                        <p className="home__feature-desc">
                            Powered by Gemini 2.5 Pro for deep code understanding and analysis.
                        </p>
                    </div>
                    <div className="home__feature">
                        <div className="home__feature-icon">🗺️</div>
                        <h3 className="home__feature-title">Learning Roadmap</h3>
                        <p className="home__feature-desc">
                            Get personalized learning suggestions to understand the codebase.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
