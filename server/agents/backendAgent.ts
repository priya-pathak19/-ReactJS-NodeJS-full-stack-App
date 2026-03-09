import Groq from "groq-sdk";

export async function runBackendAgent(
  groq: Groq,
  appIdea: string,
  plan: any,
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert Node.js/Express developer (backend-agent).
Your ONLY job is to write clean Express + TypeScript API routes.
Guidelines:
- Use Express Router
- Include proper error handling with try/catch
- Add input validation
- Use in-memory storage (arrays/maps) - no database needed
- Add CORS headers where needed
- Export the router as default
Return ONLY the code, no explanations.`,
      },
      {
        role: "user",
        content: `App idea: ${appIdea}

Architecture plan from orchestrator:
${JSON.stringify(plan, null, 2)}

Write complete Express.js backend routes for this app.
Include: all API endpoints from the plan, data models as TypeScript interfaces, in-memory storage, full CRUD operations where needed.`,
      },
    ],
    temperature: 0.2,
    max_tokens: 4000,
  });

  return (
    response.choices[0]?.message?.content?.trim() || "// No code generated"
  );
}
