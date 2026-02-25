import { useEffect, useState } from "react";
import { StepTimeline } from "./StepTimeline";

export type Step =
  | "INITIATED"
  | "EMAIL_SENT"
  | "EMAIL_LINK_CLICKED"
  | "SLACK_SENT"
  | "APPROVED"
  | "REJECTED";

export function ApprovalPanel() {
  const requestId = "REQ-123";
  const approverEmail = "priyapathak.work@gmail.com";

  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!step || step === "APPROVED" || step === "REJECTED") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/workflow/approval/${requestId}/status`);
      const data = await res.json();

      setStep(data.step);
    }, 3000);

    return () => clearInterval(interval);
  }, [step, requestId]);

  return (
    <section className="approval-panel">
      <h3>Approval Flow</h3>

      {!step && (
        <button
          className="primary-btn"
          onClick={startApproval}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Approval"}
        </button>
      )}

      {step && (
        <>
          <p className="current-step">
            Current status: <strong>{step}</strong>
          </p>

          <StepTimeline currentStep={step} />

          {step === "APPROVED" && <p className="success">✅ Approved</p>}
          {step === "REJECTED" && <p className="error">❌ Rejected</p>}
        </>
      )}
    </section>
  );
}
