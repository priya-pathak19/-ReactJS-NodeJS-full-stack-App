// // This code runs inside Temporal's workflow sandbox
// // proxyActivities is how workflows call real-world code safely.
// import { proxyActivities } from "@temporalio/workflow";

// // Only import the activity types, No runtime import
// // Temporal workflows must be deterministic and replayable.
// // If we import the real activities implementation here, it may:
// // - touch the database
// // - read environment variables
// // - log or perform other side effects
// // - do non-deterministic work
// //
// // Any of these would break workflow replay ❌
// //
// // Therefore, workflows should only know the *shape* (types/signatures)
// // of activities, not their actual implementations.
// import type * as activities from "./activities";

// // proxyActivities here is the safe bridge between workflows and activities.
// // It creates a FAKE function that looks like a normal call (e.g. greet(name)),
// // but actually tells Temporal to schedule an activity and wait for the result.
// // `await greet(name)` means “ask Temporal to run this activity somewhere”, not “call a function”.
// const { greet } = proxyActivities<typeof activities>({
//   // generic <typeof activities> gives TypeScript type safety, autocomplete.
//   startToCloseTimeout: "1 minute",
// });

// /** A workflow that simply calls an activity */
// // This is main workflow. It is pure orchestration -> Decides what happens when and handles retries, timeouts, branching.
// export async function example(name: string): Promise<string> {
//   return await greet(name);
// }

import {
  defineSignal,
  setHandler,
  condition,
  proxyActivities,
  defineQuery,
} from "@temporalio/workflow";
import type * as activities from "./activities";

type ApprovalStep =
  | "INITIATED"
  | "EMAIL_SENT"
  | "EMAIL_LINK_CLICKED"
  | "SLACK_SENT"
  | "APPROVED"
  | "REJECTED";

export const emailLinkClickedSignal = defineSignal("emailLinkClicked");
export const approveSignal = defineSignal("approve");
export const rejectSignal = defineSignal("reject");

/**
 * 👇 QUERY exposed to frontend
 */
export const statusQuery = defineQuery<{
  step: ApprovalStep;
  decision: "APPROVED" | "REJECTED" | null;
}>("status");

const { sendApprovalEmail, sendSlackApprovalMessage, sendFinalResultEmail } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "2 minutes",
  });

export async function approvalWorkflow(
  requestId: string,
  approverEmail: string,
) {
  let step: ApprovalStep = "INITIATED";
  let decision: "APPROVED" | "REJECTED" | null = null;

  /**
   * 👇 THIS is what frontend reads
   */
  setHandler(statusQuery, () => ({
    step,
    decision,
  }));

  // --- signal handlers ---
  setHandler(emailLinkClickedSignal, () => {
    step = "EMAIL_LINK_CLICKED";
  });

  setHandler(approveSignal, () => {
    decision = "APPROVED";
    step = "APPROVED";
  });

  setHandler(rejectSignal, () => {
    decision = "REJECTED";
    step = "REJECTED";
  });

  // 1️⃣ Send initial email
  await sendApprovalEmail(requestId, approverEmail);
  step = "EMAIL_SENT";

  // 2️⃣ Wait for email link click
  await condition(() => step === "EMAIL_LINK_CLICKED");

  // 3️⃣ Send Slack DM
  await sendSlackApprovalMessage(approverEmail, requestId);
  step = "SLACK_SENT";

  // 4️⃣ Wait for Slack decision
  await condition(() => decision !== null);

  // 5️⃣ Send final result email
  await sendFinalResultEmail(approverEmail, requestId, decision!);

  return {
    requestId,
    status: decision,
    step,
  };
}
