import type { Step } from "./ApprovalPanel";

const STEP_ORDER: Step[] = [
  "INITIATED",
  "EMAIL_SENT",
  "EMAIL_LINK_CLICKED",
  "SLACK_SENT",
  "APPROVED",
  "REJECTED",
];

const STEP_LABELS: Record<Step, string> = {
  INITIATED: "Initiated",
  EMAIL_SENT: "Email sent",
  EMAIL_LINK_CLICKED: "Email link clicked",
  SLACK_SENT: "Slack approval sent",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

type Props = {
  currentStep: Step;
};

export function StepTimeline({ currentStep }: Props) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <ul className="timeline">
      {STEP_ORDER.slice(0, currentIndex + 1).map((step) => (
        <li key={step} className="timeline-step">
          <span className="dot completed" />
          <span className="label">{STEP_LABELS[step]}</span>
        </li>
      ))}
    </ul>
  );
}
