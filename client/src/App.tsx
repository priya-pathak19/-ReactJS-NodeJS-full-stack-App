import { useEffect, useState } from "react";

type Step =
  | "INITIATED"
  | "EMAIL_SENT"
  | "EMAIL_LINK_CLICKED"
  | "SLACK_SENT"
  | "APPROVED"
  | "REJECTED";

function App() {
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
  const requestId = "REQ-123"; // could come from props / route
  const approverEmail = "priyapathak.work@gmail.com";

  const [step, setStep] = useState<Step | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 1️⃣ Start approval
   */
  const startApproval = async () => {
    setLoading(true);

    await fetch("/api/workflow/approval/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: requestId,
        email: approverEmail,
      }),
    });

    setStep("EMAIL_SENT");
    setLoading(false);
  };

  /**
   * 2️⃣ Poll status
   */
  useEffect(() => {
    if (!step || step === "APPROVED" || step === "REJECTED") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/workflow/approval/${requestId}/status`);
      const data = await res.json();

      setStep(data.step);
      setDecision(data.decision ?? null);
    }, 3000);

    return () => clearInterval(interval);
  }, [step, requestId]);

  console.log(decision, step, "decision");

  return (
    <div style={{ border: "1px solid #ccc", padding: 16 }}>
      <h3>Approval Flow</h3>

      {!step && (
        <button onClick={startApproval} disabled={loading}>
          Send Approval
        </button>
      )}

      {step && (
        <>
          <p>
            <strong>Current step:</strong> {step}
          </p>

          <ul>
            <li>📧 Email sent</li>
            <li>🔔 Email link clicked</li>
            <li>💬 Slack approval sent</li>
            <li>✅ Approved / ❌ Rejected</li>
          </ul>
        </>
      )}

      {step === "APPROVED" && <p>✅ Approved</p>}
      {step === "REJECTED" && <p>❌ Rejected</p>}
    </div>
  );
}

export default App;
