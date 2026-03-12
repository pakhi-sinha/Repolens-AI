export default function FileTreeView({ items, onFileClick }) {
    if (!items || items.length === 0) return <p>No structure data available.</p>;

    return (
        <div className="file-tree">
            {items.map((item, index) => {
                const isClickable = !!onFileClick && item.file;

                return (
                    <div
                        key={index}
                        className={`file-tree__item ${isClickable ? 'file-tree__item--clickable' : ''}`}
                        onClick={() => isClickable ? onFileClick(item.file) : null}
                    >
                        <span className="file-tree__name">
                            {item.folder ? '📁 ' : '📄 '}
                            {item.folder || item.file}
                        </span>
                        <span className="file-tree__desc">{item.purpose}</span>
                    </div>
                );
            })}
        </div>
    );
}
