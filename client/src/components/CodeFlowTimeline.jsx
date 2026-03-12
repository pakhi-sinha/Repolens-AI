export default function CodeFlowTimeline({ steps }) {
    if (!steps || steps.length === 0) return <p>No code flow data available.</p>;

    return (
        <div className="code-flow">
            {steps.map((step) => (
                <div key={step.step} className="code-flow__step">
                    <div className="code-flow__indicator">
                        <div className="code-flow__number">{step.step}</div>
                        <div className="code-flow__line" />
                    </div>
                    <div className="code-flow__content">
                        <h3 className="code-flow__title">{step.title}</h3>
                        <p className="code-flow__desc">{step.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
