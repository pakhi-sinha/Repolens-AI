import { useState, useRef, useEffect } from "react";
import { askRepoQuestion } from "../utils/api";

export default function RepoChat({ analysis, explanationLevel }) {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleAsk = async (e) => {
        e.preventDefault();
        const q = question.trim();
        if (!q || isLoading) return;

        // Append user message to state
        const userMsg = { role: "user", content: q };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setQuestion("");
        setIsLoading(true);

        try {
            // Send the full conversation history to the backend
            const result = await askRepoQuestion(
                analysis,
                updatedMessages,
                explanationLevel
            );

            const aiMsg = { role: "assistant", content: result.answer };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            const errorMsg = {
                role: "error",
                content: err.message || "Failed to get an answer.",
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuestion(suggestion);
    };

    const handleClearChat = () => {
        setMessages([]);
        setQuestion("");
    };

    return (
        <div className="repo-chat">
            {/* Suggestion chips — only when chat is empty */}
            {messages.length === 0 && (
                <div className="repo-chat__empty">
                    <p>💬 Ask anything about this repository!</p>
                    <div className="repo-chat__suggestions">
                        {[
                            "What does this project do?",
                            "How is the code organized?",
                            "What are the main entry points?",
                            "How do I contribute to this project?",
                        ].map((suggestion) => (
                            <button
                                key={suggestion}
                                className="repo-chat__suggestion"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages container */}
            {messages.length > 0 && (
                <div className="repo-chat__messages">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`repo-chat__bubble repo-chat__bubble--${msg.role}`}
                        >
                            <span className="repo-chat__role">
                                {msg.role === "user"
                                    ? "🧑 You"
                                    : msg.role === "assistant"
                                        ? "🤖 RepoLens AI"
                                        : "⚠️ Error"}
                            </span>
                            <div className="repo-chat__text">{msg.content}</div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="repo-chat__bubble repo-chat__bubble--assistant">
                            <span className="repo-chat__role">🤖 RepoLens AI</span>
                            <div className="repo-chat__typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}

                    {/* Auto-scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Input form — always visible at bottom */}
            <div className="repo-chat__footer">
                {messages.length > 0 && (
                    <button
                        className="repo-chat__clear"
                        onClick={handleClearChat}
                        title="Clear conversation"
                    >
                        🗑️ Clear chat
                    </button>
                )}
                <form className="repo-chat__form" onSubmit={handleAsk}>
                    <input
                        type="text"
                        className="repo-chat__input"
                        placeholder={
                            messages.length === 0
                                ? "Ask about this repository..."
                                : "Ask a follow-up question..."
                        }
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="repo-chat__send"
                        disabled={!question.trim() || isLoading}
                    >
                        {isLoading ? "⏳" : "→"}
                    </button>
                </form>
            </div>
        </div>
    );
}
