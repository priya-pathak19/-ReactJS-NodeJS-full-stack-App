// This file starts a Temporal Worker process.
// A worker is a long-running background service that:
// polls Temporal Server
// executes workflows
// executes activities
// Without this running, no workflow will ever execute, even if your API starts them.
import { NativeConnection, Worker } from "@temporalio/worker";
// Worker → creates the worker process
// NativeConnection → low-level gRPC (binary messages using Protocol Buffers) connection to Temporal Server -> gRPC is a high-performance communication protocol.
import * as activities from "./activities";
// activities → your real activity implementations (DB calls, APIs, etc.)
import "dotenv/config";

// This wraps the worker lifecycle:
// connect
// start worker
// clean up on shutdown
async function run() {
  // Step 1: Establish a connection with Temporal server.
  //
  // Worker code uses `@temporalio/worker.NativeConnection`.
  // (But in your application code it's `@temporalio/client.Connection`.)

  // The worker opens a persistent connection to Temporal Server
  // This is not a database connection — it's to Temporal itself
  const connection = await NativeConnection.connect({
    address: "localhost:7233", // 7233 is Temporal’s default gRPC port
    // TLS and gRPC metadata configuration goes here.
  });
  try {
    // Step 2: Register Workflows and Activities with the Worker.
    // Creating a worker
    const worker = await Worker.create({
      connection,
      namespace: "default", // Logical isolation inside Temporal
      taskQueue: "approval-queue", // Any workflow/activity sent to this queue will be picked up by this worker
      // Workflows are registered using a path as they run in a separate JS context. workflows run in a separate JS sandbox
      workflowsPath: require.resolve("./workflow"), // tells temporal where the workflow lives
      // Actual implementation for activities.
      // functions that can: hit DB, call APIs, do side effects
      activities,
    });

    // Step 3: Start accepting tasks on the `hello-world` queue
    //
    // The worker runs until it encounters an unexpected error or the process receives a shutdown signal registered on
    // the SDK Runtime object.
    //
    // By default, worker logs are written via the Runtime logger to STDERR at INFO level.
    //
    // See https://typescript.temporal.io/api/classes/worker.Runtime#install to customize these defaults.
    await worker.run();
  } finally {
    // Close the connection once the worker has stopped
    await connection.close();
  }
}

// Start everything
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
