import { Router } from "express";
import {
  getWorkflowHandle,
  // getWorkflowHandle,
  startApprovalWorkflow,
  // startApprovalWorkflowSlack,
  // startFetchSlackUsersWorkflow,
  // startSlackApprovalWorkflow,
} from "../temporal/client";
import { WorkflowExecutionAlreadyStartedError } from "@temporalio/client";

const router = Router();

// router.post("/start", async (req, res) => {
//   const { name } = req.body;

//   try {
//     const handle = await startExampleWorkflow(name);

//     // OPTION A: wait for result (blocking)
//     const result = await handle.result();

//     res.json({
//       workflowId: handle.workflowId,
//       result,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to start workflow" });
//   }
// });

// router.post("/start", async (req, res) => {
//   const { requestId } = req.body;

//   try {
//     const handle = await startApprovalWorkflow(requestId);
//     console.log("STARTED workflowId:", handle.workflowId);
//     res.json({
//       workflowId: handle.workflowId,
//       status: "STARTED",
//     });
//   } catch (err) {
//     if (err instanceof WorkflowExecutionAlreadyStartedError) {
//       // workflow already exists → fetch it instead
//       const handle = await getWorkflowHandle(requestId);
//       const status = await handle.query("status");

//       return res.json({
//         workflowId: requestId,
//         status,
//         alreadyRunning: true,
//       });
//     }

//     console.error(err);
//     res.status(500).json({ error: "Failed to start workflow" });
//   }
// });

// Dashboard UI approval
// router.post("/approve/:id", async (req, res) => {
//   const handle = await getWorkflowHandle(req.params.id);
//   await handle.signal("approve");
//   console.log("APPROVE called for workflowId:", req.params.id);

//   res.json({ status: "APPROVED" });
// });

// router.get("/approve/:id", async (req, res) => {
//   const handle = await getWorkflowHandle(req.params.id);
//   await handle.signal("approve");

//   res.send("<h2>✅ Approved</h2>You may close this window.");
// });

// router.get("/reject/:id", async (req, res) => {
//   const handle = await getWorkflowHandle(req.params.id);
//   await handle.signal("reject");

//   res.send("<h2>❌ Rejected</h2>You may close this window.");
// });

// router.get("/status/:id", async (req, res) => {
//   const handle = await getWorkflowHandle(req.params.id);
//   const status = await handle.query("status");

//   res.json({ status });
// });

// // Slack routes
// router.post("/slack/users", async (_req, res) => {
//   const users = await startFetchSlackUsersWorkflow();
//   res.json(users);
// });

// router.post("/slack/notify", async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({
//       error: "email is required",
//     });
//   }

//   await startSlackApprovalWorkflow(email, "Please approve the request ✅");

//   res.status(202).json({
//     status: "Slack approval request sent",
//   });
// });

// router.post("/slack/actions", async (req, res) => {
//   const payload = JSON.parse(req.body.payload);

//   const action = payload.actions[0];
//   const requestId = action.value;

//   const handle = await getWorkflowHandle(requestId);

//   if (action.action_id === "approve") {
//     await handle.signal("approve");
//   }

//   if (action.action_id === "reject") {
//     await handle.signal("reject");
//   }

//   // Respond quickly to Slack
//   res.json({
//     text: `Your response has been recorded ✅`,
//     replace_original: true,
//   });
// });

/**
 * Start approval workflow + send Slack approval
 */
/**
 * 1️⃣ Frontend → start approval
 */
router.post("/approval/start", async (req, res) => {
  const { id, email } = req.body;

  if (!id || !email) {
    return res.status(400).json({
      error: "id and email are required",
    });
  }

  await startApprovalWorkflow(id, email);

  res.status(202).json({
    requestId: id,
    status: "PENDING",
  });
});

/**
 * 2️⃣ Frontend → poll status
 */
router.get("/approval/:id/status", async (req, res) => {
  const handle = await getWorkflowHandle(req.params.id);

  try {
    const status = await handle.query("status");
    res.json(status);
  } catch {
    // workflow still running but query not ready
    res.json({
      step: "EMAIL_SENT",
      decision: null,
    });
  }
});

/**
 * 3️⃣ Email link → trigger Slack DM
 */
router.get("/email-click/:id", async (req, res) => {
  const handle = await getWorkflowHandle(req.params.id);

  await handle.signal("emailLinkClicked");

  res.send(`
    <h3>Slack approval sent ✅</h3>
    <p>Please check Slack to approve or reject.</p>
  `);
});

/**
 * 4️⃣ Slack button callback
 */
router.post("/slack/actions", async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0];
    const requestId = action.value;

    const handle = await getWorkflowHandle(requestId);

    if (action.action_id === "approve") {
      await handle.signal("approve");
    }

    if (action.action_id === "reject") {
      await handle.signal("reject");
    }

    // Slack requires fast response
    return res.json({
      text: "Your response has been recorded ✅",
      replace_original: true,
    });
  } catch (err) {
    console.error("Slack action error", err);
    return res.status(500).send("Error");
  }
});

export default router;
