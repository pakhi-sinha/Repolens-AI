export default function FileModal({ isOpen, onClose, fileData, isLoading, error }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={() => !isLoading && onClose()}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {!isLoading && (
                    <button className="modal-close" onClick={onClose} disabled={isLoading}>×</button>
                )}

                {isLoading ? (
                    <div className="modal-loading">
                        <div className="loading__spinner" style={{ width: 40, height: 40, borderWidth: 2 }} />
                        <p>Analyzing file with AI...</p>
                    </div>
                ) : error ? (
                    <div className="modal-error">
                        <h3>❌ Error</h3>
                        <p>{error}</p>
                    </div>
                ) : fileData ? (
                    <div className="modal-body">
                        <div className="modal-header">
                            <h2>📄 {fileData.fileName}</h2>
                            <span className="modal-lang">{fileData.language}</span>
                        </div>

                        <p className="modal-path">{fileData.filePath}</p>

                        <div className="modal-section mt-4">
                            <h3>🎯 Purpose</h3>
                            <p>{fileData.explanation.purpose}</p>
                        </div>

                        <div className="modal-section">
                            <h3>🧩 Components</h3>
                            <ul className="modal-list">
                                {fileData.explanation.components.map((c, i) => (
                                    <li key={i}>
                                        <strong>{c.name}</strong> — {c.description}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="modal-section">
                            <h3>📦 Dependencies</h3>
                            <ul className="modal-tags">
                                {fileData.explanation.dependencies.map((d, i) => (
                                    <li key={i} className="modal-tag">{d}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="modal-section">
                            <h3>🔗 Connections</h3>
                            <p>{fileData.explanation.connections}</p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
