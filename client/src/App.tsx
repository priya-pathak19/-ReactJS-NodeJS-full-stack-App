import { useEffect, useState } from "react";

function App() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>();

  // async function startWorkflow() {
  //   setLoading(true);
  //   setResult(null);

  //   const res = await fetch("/api/workflow/start", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ name: "Temporal" }),
  //   });

  //   const data = await res.json();
  //   setResult(data.result);
  //   setLoading(false);
  // }

  async function start() {
    const res = await fetch("/api/workflow/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: "req-123" }),
    });

    const data = await res.json();
    setWorkflowId(data.workflowId);
  }

  useEffect(() => {
    if (!workflowId) return;
    if (status === "APPROVED" || status === "REJECTED") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/workflow/status/${workflowId}`);
      const data = await res.json();
      console.log(data, "data");
      setStatus(data.status);
    }, 2000);

    return () => clearInterval(interval);
  }, [workflowId, status]);

  async function approve() {
    await fetch(`/api/workflow/approve/${workflowId}`, {
      method: "POST",
    });
    setStatus("APPROVED"); // optimistic
  }

  console.log(workflowId, status);

  return (
    <div>
      <button onClick={start}>Start Workflow</button>

      <p>{status}</p>

      <button onClick={approve}>Approve</button>
    </div>
  );
}

export default App;
