// client.ts is a Temporal client that:
// connects to the Temporal server
// starts a workflow
// optionally waits for its result
// then exits

//The client imports the workflow type, but it does not execute it, Execution happens later in the worker
import { Client, Connection } from "@temporalio/client";
// Connection → opens a connection to the Temporal Server
// Client → high-level API to start workflows, send signals, run queries
import { nanoid } from "nanoid"; // nanoid → generates a unique workflow ID
import { example } from "./workflow"; // example → the workflow definition (pure orchestration code)

async function run() {
  // Connect to the default Server location
  const connection = await Connection.connect({ address: "localhost:7233" });
  // In production, pass options to configure TLS(Transport Layer Security) and other settings:
  // {
  //   address: 'foo.bar.tmprl.cloud',
  //   tls: {}
  // }

  const client = new Client({
    connection,
    // namespace: 'foo.bar', // connects to 'default' namespace if not specified
  });

  const handle = await client.workflow.start(example, {
    taskQueue: "hello-world",
    // type inference works! args: [name: string]
    args: ["Temporal"],
    // in practice, use a meaningful business ID, like customerId or transactionId
    workflowId: "workflow-" + nanoid(),
  });
  console.log(`Started workflow ${handle.workflowId}`);

  // optional: wait for client result
  console.log(await handle.result()); // Hello, Temporal!
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
