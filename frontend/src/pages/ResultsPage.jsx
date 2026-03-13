import ResultsPanel from "../components/ResultsPanel";
import ExplanationLevelSelector from "../components/ExplanationLevelSelector";
import ShareButton from "../components/ShareButton";

export default function ResultsPage({ data, onBack, explanationLevel, onLevelChange }) {
    const { repoInfo, analysis } = data;

    return (
        <main className="results">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="results__back-btn" onClick={onBack}>
                    ← Analyze another repo
                </button>
                <ShareButton
                    repoUrl={repoInfo.url}
                    repoInfo={repoInfo}
                    analysis={analysis}
                />
            </div>

            <div className="results__header">
                <h1 className="results__repo-name">
                    <a href={repoInfo.url} target="_blank" rel="noopener noreferrer">
                        {repoInfo.fullName}
                    </a>
                </h1>
                <p className="results__repo-desc">{repoInfo.description}</p>
                <div className="results__repo-meta">
                    <span>⭐ {repoInfo.stars?.toLocaleString()} stars</span>
                    <span>🍴 {repoInfo.forks?.toLocaleString()} forks</span>
                </div>
            </div>

            <ExplanationLevelSelector
                level={explanationLevel}
                onChange={onLevelChange}
            />

            <ResultsPanel
                repoInfo={repoInfo}
                analysis={analysis}
                explanationLevel={explanationLevel}
            />
        </main>
    );
}
