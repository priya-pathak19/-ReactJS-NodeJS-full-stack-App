import { Router, Request, Response } from "express";
import { runOrchestrator } from "../agents/orchestrator";

const router = Router();

// POST /api/generate
// Body: { appIdea: string }
router.post("/generate", async (req: Request, res: Response) => {
  const { appIdea } = req.body;

  if (!appIdea || typeof appIdea !== "string" || appIdea.trim().length === 0) {
    return res.status(400).json({ error: "appIdea is required" });
  }

  try {
    // Track agent statuses
    const statuses: { agent: string; status: string; timestamp: string }[] = [];

    const onStatus = (agent: string, status: string) => {
      console.log(`[${agent.toUpperCase()}] ${status}`);
      statuses.push({ agent, status, timestamp: new Date().toISOString() });
    };

    const result = await runOrchestrator(appIdea.trim(), onStatus);

    return res.status(200).json({
      success: true,
      statuses,
      result,
    });
  } catch (error: any) {
    console.error("Agent error:", error);
    return res.status(500).json({
      error: "Agent execution failed",
      details: error?.message || "Unknown error",
    });
  }
});

export default router;
