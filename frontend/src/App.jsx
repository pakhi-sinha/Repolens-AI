import { useState, useEffect } from "react";
import "./index.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/modal.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingAnalysis from "./components/LoadingAnalysis";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import { analyzeRepo, getSharedAnalysis } from "./utils/api";

export default function App() {
  const [view, setView] = useState("home"); // "home" | "loading" | "results" | "error"
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [explanationLevel, setExplanationLevel] = useState("beginner");
  const [currentRepoUrl, setCurrentRepoUrl] = useState("");

  // Check for shared analysis link on mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/shared\/([a-f0-9]+)$/i);
    if (match) {
      const shareId = match[1];
      setView("loading");
      getSharedAnalysis(shareId)
        .then((shared) => {
          setData({ repoInfo: shared.repoInfo, analysis: shared.analysis });
          setCurrentRepoUrl(shared.repoUrl);
          setView("results");
          // Clean URL without reloading
          window.history.replaceState({}, "", "/");
        })
        .catch((err) => {
          setError(err.message || "Shared analysis not found.");
          setView("error");
          window.history.replaceState({}, "", "/");
        });
    }
  }, []);

  const handleAnalyze = async (repoUrl, level = explanationLevel) => {
    setView("loading");
    setError("");
    setData(null);
    setCurrentRepoUrl(repoUrl);

    try {
      const result = await analyzeRepo(repoUrl, level);
      setData(result);
      setView("results");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setView("error");
    }
  };

  const handleLevelChange = async (newLevel) => {
    setExplanationLevel(newLevel);
    if (currentRepoUrl && view === "results") {
      await handleAnalyze(currentRepoUrl, newLevel);
    }
  };

  const handleBack = () => {
    setView("home");
    setData(null);
    setError("");
  };

  return (
    <>
      <Header onLogoClick={handleBack} />

      {view === "home" && (
        <HomePage onAnalyze={handleAnalyze} isLoading={false} />
      )}

      {view === "loading" && <LoadingAnalysis />}

      {view === "results" && data && (
        <ResultsPage
          data={data}
          onBack={handleBack}
          explanationLevel={explanationLevel}
          onLevelChange={handleLevelChange}
        />
      )}

      {view === "error" && (
        <div className="loading">
          <h2 className="loading__title" style={{ color: "var(--color-error)" }}>
            ❌ Analysis Failed
          </h2>
          <p className="loading__message">{error}</p>
          <button
            className="results__back-btn"
            onClick={handleBack}
            style={{ marginTop: "2rem" }}
          >
            ← Try again
          </button>
        </div>
      )}

      <Footer />
    </>
  );
}
