import { Router } from "express";
import { getWorkflowHandle, startApprovalWorkflow } from "../temporal/client";
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

router.post("/start", async (req, res) => {
  const { requestId } = req.body;

  try {
    const handle = await startApprovalWorkflow(requestId);
    console.log("STARTED workflowId:", handle.workflowId);
    res.json({
      workflowId: handle.workflowId,
      status: "STARTED",
    });
  } catch (err) {
    if (err instanceof WorkflowExecutionAlreadyStartedError) {
      // workflow already exists → fetch it instead
      const handle = await getWorkflowHandle(requestId);
      const status = await handle.query("status");

      return res.json({
        workflowId: requestId,
        status,
        alreadyRunning: true,
      });
    }

    console.error(err);
    res.status(500).json({ error: "Failed to start workflow" });
  }
});

router.post("/approve/:id", async (req, res) => {
  const handle = await getWorkflowHandle(req.params.id);
  await handle.signal("approve");
  console.log("APPROVE called for workflowId:", req.params.id);

  res.json({ status: "APPROVED" });
});

router.get("/status/:id", async (req, res) => {
  const handle = await getWorkflowHandle(req.params.id);
  const status = await handle.query("status");

  res.json({ status });
});

export default router;
