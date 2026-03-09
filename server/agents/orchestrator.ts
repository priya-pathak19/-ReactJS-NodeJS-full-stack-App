// The orchestrator does 3 things a subagent doesn't do:
// 1. It thinks before acting — it calls Groq first just to make a plan, before any code is written.
//      That planning call is what separates an orchestrator from a regular function.
// 2. It makes decisions — the detectIntent() function is literally the orchestrator deciding "do I even need the backend agent?"
//      A dumb function would always run everything. The orchestrator reasons about it.
// 3. It holds all context — it collects the output from frontend agent and backend agent, then passes BOTH to the review agent.
//      No subagent sees another subagent's output directly — everything flows through the orchestrator.

import Groq from "groq-sdk";
import { runFrontendAgent } from "./frontendAgent";
import { runBackendAgent } from "./backendAgent";
import { runReviewAgent } from "./reviewAgent";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AgentResult {
  orchestratorPlan: string;
  frontendCode: string;
  backendCode: string;
  reviewFeedback: string;
  agentsUsed: string[];
}

async function detectIntent(
  appIdea: string,
): Promise<{ needsFrontend: boolean; needsBackend: boolean }> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an intent detector. Analyze a user's app request and determine which parts they want built.
Return ONLY a JSON object like this:
{
  "needsFrontend": true or false,
  "needsBackend": true or false,
  "reason": "brief explanation"
}

Rules:
- If user says "frontend only", "react only", "UI only", "no backend", "just the UI" → needsBackend: false
- If user says "backend only", "API only", "no frontend", "just the API" → needsFrontend: false
- If user says "fullstack", "full stack", or doesn't specify → both true
- Default to both true if unclear`,
      },
      {
        role: "user",
        content: appIdea,
      },
    ],
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content?.trim() || "{}";
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      needsFrontend: parsed.needsFrontend !== false,
      needsBackend: parsed.needsBackend !== false,
    };
  } catch {
    return { needsFrontend: true, needsBackend: true };
  }
}

// What Are the Subagents?
// Each subagent is a focused, single-purpose AI call with its own system prompt.
//      They don't know about each other — they only know what the orchestrator tells them.
// SubagentKnows AboutDoesn't Know AboutfrontendAgentApp idea + planBackend codebackendAgentApp idea + planFrontend codereviewAgentEverything
//      (gets all code)Nothing — it's the last step

export async function runOrchestrator(
  appIdea: string,
  onStatus: (agent: string, status: string) => void,
): Promise<AgentResult> {
  // Step 1: Detect intent — what does the user actually want?
  onStatus("orchestrator", "Analyzing your app idea and detecting intent...");
  const { needsFrontend, needsBackend } = await detectIntent(appIdea);

  // Step 2: Create plan based on detected intent
  const planResponse = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a senior software architect and project orchestrator.
Your job is to analyze an app idea and create a structured task breakdown.
Only include tasks relevant to what the user asked for.
Return a JSON object with this exact structure:
{
  "appName": "name of the app",
  "description": "brief description",
  "scope": "${needsFrontend && needsBackend ? "fullstack" : needsFrontend ? "frontend-only" : "backend-only"}",
  "frontendTasks": ${needsFrontend ? '["task1", "task2", ...]' : "[]"},
  "backendTasks": ${needsBackend ? '["task1", "task2", ...]' : "[]"},
  "apiEndpoints": ${needsBackend ? '[{"method": "GET", "path": "/api/example", "description": "..."}]' : "[]"},
  "dataModels": ["model1 description"]
}
Return ONLY the JSON, no explanation.`,
      },
      {
        role: "user",
        content: `Analyze this app idea and create a task breakdown: ${appIdea}`,
      },
    ],
    temperature: 0.3,
  });

  const planText = planResponse.choices[0]?.message?.content?.trim() || "{}";
  let plan: any = {};
  try {
    const cleaned = planText.replace(/```json|```/g, "").trim();
    plan = JSON.parse(cleaned);
  } catch {
    plan = {
      description: appIdea,
      scope: "fullstack",
      frontendTasks: [],
      backendTasks: [],
      apiEndpoints: [],
      dataModels: [],
    };
  }

  const orchestratorPlan = JSON.stringify(plan, null, 2);
  const agentsUsed: string[] = ["orchestrator"];

  // Step 3: Run only the agents that are needed
  let frontendCode = "// Frontend not requested";
  let backendCode = "// Backend not requested";

  if (needsFrontend) {
    onStatus("frontend", "Writing React components...");
    frontendCode = await runFrontendAgent(groq, appIdea, plan);
    agentsUsed.push("frontend");
  } else {
    onStatus("frontend-skipped", "Frontend agent skipped (not requested)");
  }

  if (needsBackend) {
    onStatus("backend", "Writing Node.js/Express APIs...");
    backendCode = await runBackendAgent(groq, appIdea, plan);
    agentsUsed.push("backend");
  } else {
    onStatus("backend-skipped", "Backend agent skipped (not requested)");
  }

  // Step 4: Review agent — only runs if at least one agent produced code
  onStatus("review", "Reviewing generated code...");
  const reviewFeedback = await runReviewAgent(
    groq,
    appIdea,
    frontendCode,
    backendCode,
    plan,
  );
  agentsUsed.push("review");

  onStatus("done", `Done! Agents used: ${agentsUsed.join(", ")}`);

  return {
    orchestratorPlan,
    frontendCode,
    backendCode,
    reviewFeedback,
    agentsUsed,
  };
}
