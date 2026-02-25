import { useState } from "react";

export default function AskLLM() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setAnswer(data.answer);
    } catch {
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ask-llm-container">
      <h2 className="title">Ask My Docs</h2>

      <textarea
        className="question-box"
        rows={3}
        placeholder="Ask anything from the docs..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button className="ask-button" onClick={askQuestion} disabled={loading}>
        {loading ? "Thinking…" : "Ask"}
      </button>

      {error && <p className="error">{error}</p>}

      {answer && (
        <div className="answer-card">
          <h3>Answer</h3>
          <pre>{answer}</pre>
        </div>
      )}
    </div>
  );
}
