export default function ExplanationLevelSelector({ level, onChange, disabled }) {
    return (
        <div className="level-selector">
            <label htmlFor="explanation-level">Explanation Level: </label>
            <div className="level-selector__controls">
                <select
                    id="explanation-level"
                    value={level}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="level-selector__dropdown"
                >
                    <option value="beginner">Beginner (ELI5)</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
                {disabled && <span className="level-selector__loading">Updating...</span>}
            </div>
        </div>
    );
}
