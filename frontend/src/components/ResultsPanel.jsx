import SectionCard from "./SectionCard";
import TechStackBadges from "./TechStackBadges";
import FileTreeView from "./FileTreeView";
import CodeFlowTimeline from "./CodeFlowTimeline";
import DifficultyMeter from "./DifficultyMeter";
import LearningRoadmap from "./LearningRoadmap";
import FileModal from "./FileModal";
import ArchitectureDiagram from "./ArchitectureDiagram";
import RepoChat from "./RepoChat";
import { explainFile } from "../utils/api";
import { useState } from "react";

export default function ResultsPanel({ repoInfo, analysis, explanationLevel }) {
    const [modalData, setModalData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");

    const handleFileClick = async (filePath) => {
        setIsModalOpen(true);
        setModalLoading(true);
        setModalError("");
        setModalData(null);

        try {
            const result = await explainFile(repoInfo.url, filePath, explanationLevel);
            setModalData(result);
        } catch (err) {
            setModalError(err.message || "Failed to explain file.");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="results__sections">
            <FileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fileData={modalData}
                isLoading={modalLoading}
                error={modalError}
            />
            {/* 1. Project Overview */}
            <SectionCard icon="📋" title="Project Overview">
                {analysis.projectOverview.split("\n").map((para, i) => (
                    <p key={i}>{para}</p>
                ))}
            </SectionCard>

            {/* 2. Tech Stack */}
            <SectionCard icon="⚙️" title="Tech Stack">
                <TechStackBadges techStack={analysis.techStack} />
            </SectionCard>

            {/* 2.5 Architecture Diagram */}
            {analysis.architectureData && analysis.architectureData.nodes && (
                <SectionCard icon="🕸️" title="Architecture Diagram">
                    <ArchitectureDiagram data={analysis.architectureData} />
                </SectionCard>
            )}

            {/* 2.6 Chat with Repo */}
            <SectionCard icon="💬" title="Ask About This Repository">
                <RepoChat analysis={analysis} explanationLevel={explanationLevel} />
            </SectionCard>

            {/* 3. Repository Structure */}
            <SectionCard icon="📂" title="Repository Structure">
                <FileTreeView
                    items={analysis.repoStructure}
                    onFileClick={handleFileClick}
                />
            </SectionCard>

            {/* 4. Key Files */}
            <SectionCard icon="📄" title="Key Files">
                <FileTreeView
                    items={analysis.keyFiles}
                    onFileClick={handleFileClick}
                />
            </SectionCard>

            {/* 5. Code Flow */}
            <SectionCard icon="🔄" title="Code Flow">
                <CodeFlowTimeline steps={analysis.codeFlow} />
            </SectionCard>

            {/* 6. How to Run */}
            <SectionCard icon="🚀" title="How to Run the Project">
                <div className="how-to-run__section">
                    <h3 className="how-to-run__label">Prerequisites</h3>
                    <ul className="how-to-run__list">
                        {analysis.howToRun.prerequisites.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="how-to-run__section">
                    <h3 className="how-to-run__label">Steps</h3>
                    <ul className="how-to-run__list">
                        {analysis.howToRun.steps.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            </SectionCard>

            {/* 7. Difficulty Level */}
            <SectionCard icon="📊" title="Difficulty Level">
                <DifficultyMeter data={analysis.difficultyLevel} />
            </SectionCard>

            {/* 8. Learning Roadmap */}
            <SectionCard icon="🗺️" title="Learning Roadmap">
                <LearningRoadmap items={analysis.learningRoadmap} />
            </SectionCard>
        </div>
    );
}
