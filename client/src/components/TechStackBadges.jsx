export default function TechStackBadges({ techStack }) {
    const categories = [
        { key: "languages", label: "Languages", variant: "lang" },
        { key: "frameworks", label: "Frameworks & Libraries", variant: "framework" },
        { key: "tools", label: "Tools & Build Systems", variant: "tool" },
        { key: "databases", label: "Databases", variant: "db" },
    ];

    return (
        <div className="tech-stack">
            {categories.map(({ key, label, variant }) => {
                const items = techStack[key];
                if (!items || items.length === 0) return null;
                return (
                    <div key={key} className="tech-stack__category">
                        <span className="tech-stack__label">{label}</span>
                        <div className="tech-stack__badges">
                            {items.map((item) => (
                                <span key={item} className={`tech-badge tech-badge--${variant}`}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
