export default function LearningRoadmap({ items }) {
    if (!items || items.length === 0) return <p>No roadmap data available.</p>;

    return (
        <div className="roadmap">
            {items.map((item, index) => (
                <div key={index} className="roadmap__item">
                    <h3 className="roadmap__topic">
                        {index + 1}. {item.topic}
                    </h3>
                    <p className="roadmap__reason">{item.reason}</p>
                    {item.resources && item.resources.length > 0 && (
                        <div className="roadmap__resources">
                            {item.resources.map((res, i) => (
                                <span key={i} className="roadmap__resource">
                                    📚 {res}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
