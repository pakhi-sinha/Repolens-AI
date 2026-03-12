export default function SectionCard({ icon, title, children }) {
    return (
        <div className="section-card">
            <div className="section-card__header">
                <div className="section-card__icon">{icon}</div>
                <h2 className="section-card__title">{title}</h2>
            </div>
            <div className="section-card__content">{children}</div>
        </div>
    );
}
