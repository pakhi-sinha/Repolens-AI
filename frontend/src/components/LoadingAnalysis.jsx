import { useState, useEffect } from "react";

const STEPS = [
    { id: 1, text: "Parsing repository URL..." },
    { id: 2, text: "Fetching repository metadata from GitHub..." },
    { id: 3, text: "Reading README and file structure..." },
    { id: 4, text: "Analyzing with Gemini AI..." },
    { id: 5, text: "Generating structured explanation..." },
    { id: 6, text: "Generating architecture diagram..." },
];

export default function LoadingAnalysis() {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const timers = STEPS.map((_, index) =>
            setTimeout(() => setActiveStep(index), index * 2000)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="loading">
            <div className="loading__spinner" />
            <h2 className="loading__title">Analyzing Repository</h2>
            <p className="loading__message">
                Please wait while we fetch the repository data and generate a comprehensive explanation...
            </p>
            <div className="loading__steps">
                {STEPS.map((step, index) => (
                    <div
                        key={step.id}
                        className={`loading__step ${index < activeStep
                            ? "loading__step--done"
                            : index === activeStep
                                ? "loading__step--active"
                                : ""
                            }`}
                    >
                        <span>
                            {index < activeStep ? "✅" : index === activeStep ? "⏳" : "⬜"}
                        </span>
                        <span>{step.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
