export default function Header({ onLogoClick }) {
    return (
        <header className="header">
            <div className="header__logo" onClick={onLogoClick}>
                <span className="header__logo-icon">🔭</span>
                <div className="header__logo-text">
                    RepoLens <span>AI</span>
                </div>
            </div>
            <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="header__github-link"
            >
                ⭐ GitHub
            </a>
        </header>
    );
}
