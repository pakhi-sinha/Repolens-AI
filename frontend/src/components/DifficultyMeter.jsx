export default function DifficultyMeter({ data }) {
    if (!data) return null;

    const { level, score, reasoning } = data;
    const percentage = (score / 10) * 100;

    const levelVariant = level.toLowerCase();

    return (
        <div className="difficulty">
            <div className="difficulty__visual">
                <div className="difficulty__level-label">
                    <span className="difficulty__level-text">{level}</span>
                    <span className="difficulty__score">{score}/10</span>
                </div>
                <div className="difficulty__bar-track">
                    <div
                        className={`difficulty__bar-fill difficulty__bar-fill--${levelVariant}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
            <p className="difficulty__reasoning">{reasoning}</p>
        </div>
    );
}
