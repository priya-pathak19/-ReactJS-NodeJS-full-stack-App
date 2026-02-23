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
  defineQuery,
  setHandler,
  condition,
  proxyActivities,
} from "@temporalio/workflow";
import type * as activities from "./activities";

/**
 * Activities
 */
const { sendApprovalEmail, fetchSlackUsers, sendSlackDMByEmail } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "2 minute",
    retry: {
      maximumAttempts: 3,
    },
  });

// -----------Get Slack Users--------------
export async function getSlackUsersWorkflow() {
  const users = await fetchSlackUsers();

  return users;
}

export async function sendSlackApprovalWorkflow(
  email: string,
  message: string,
) {
  await sendSlackDMByEmail(email, message);
}
// -- Email ------------------------

/**
 * Signals
 */
export const approveSignal = defineSignal("approve");
export const rejectSignal = defineSignal("reject");

/**
 * Query
 */
export const statusQuery = defineQuery<string>("status");

/**
 * Workflow
 */
export async function approvalWorkflow(
  requestId: string,
  approverEmail: string,
): Promise<string> {
  let status: "WAITING_FOR_APPROVAL" | "APPROVED" | "REJECTED" =
    "WAITING_FOR_APPROVAL";

  // 🔍 Query handler
  setHandler(statusQuery, () => status);

  // ✅ Approve signal
  setHandler(approveSignal, () => {
    console.log("🔥 APPROVE signal received");
    status = "APPROVED";
  });

  // ❌ Reject signal
  setHandler(rejectSignal, () => {
    console.log("🔥 REJECT signal received");
    status = "REJECTED";
  });

  // 📧 Step 1: Send approval email
  await sendApprovalEmail(requestId, approverEmail);

  // ⏸ Step 2: Wait for human action
  await condition(() => status !== "WAITING_FOR_APPROVAL");

  // ✅ Step 3: Done
  console.log(`✅ Workflow completed with status: ${status}`);
  return status;
}
