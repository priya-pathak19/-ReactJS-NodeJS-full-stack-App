import { Router } from "express";
import { startExampleWorkflow } from "../temporal/client";

const router = Router();

router.post("/start", async (req, res) => {
  const { name } = req.body;

  try {
    const handle = await startExampleWorkflow(name);

    // OPTION A: wait for result (blocking)
    const result = await handle.result();

    res.json({
      workflowId: handle.workflowId,
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start workflow" });
  }
});

export default router;
