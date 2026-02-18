// This code runs inside Temporal's workflow sandbox
// proxyActivities is how workflows call real-world code safely.
import { proxyActivities } from "@temporalio/workflow";

// Only import the activity types, No runtime import
// Temporal workflows must be deterministic and replayable.
// If we import the real activities implementation here, it may:
// - touch the database
// - read environment variables
// - log or perform other side effects
// - do non-deterministic work
//
// Any of these would break workflow replay ❌
//
// Therefore, workflows should only know the *shape* (types/signatures)
// of activities, not their actual implementations.
import type * as activities from "./activities";

// proxyActivities here is the safe bridge between workflows and activities.
// It creates a FAKE function that looks like a normal call (e.g. greet(name)),
// but actually tells Temporal to schedule an activity and wait for the result.
// `await greet(name)` means “ask Temporal to run this activity somewhere”, not “call a function”.
const { greet } = proxyActivities<typeof activities>({
  // generic <typeof activities> gives TypeScript type safety, autocomplete.
  startToCloseTimeout: "1 minute",
});

/** A workflow that simply calls an activity */
// This is main workflow. It is pure orchestration -> Decides what happens when and handles retries, timeouts, branching.
export async function example(name: string): Promise<string> {
  return await greet(name);
}
