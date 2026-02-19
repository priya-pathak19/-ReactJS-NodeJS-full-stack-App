import { useState } from "react";

function App() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startWorkflow() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/workflow/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Temporal" }),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  }

  return (
    <div>
      <button onClick={startWorkflow} disabled={loading}>
        {loading ? "Running..." : "Start Workflow"}
      </button>

      {result && <p>Result: {result}</p>}
    </div>
  );
}

export default App;
