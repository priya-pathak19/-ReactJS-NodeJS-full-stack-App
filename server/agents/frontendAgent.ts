import Groq from "groq-sdk";

export async function runFrontendAgent(
  groq: Groq,
  appIdea: string,
  plan: any,
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert React developer (frontend-agent).
Your ONLY job is to write clean React + TypeScript components.
Guidelines:
- Use functional components with hooks
- Use Tailwind CSS for styling
- Make API calls using axios to the backend endpoints provided
- Export a default App component that ties everything together
- Include all necessary imports
- Write complete, working code
Return ONLY the code, no explanations.`,
      },
      {
        role: "user",
        content: `App idea: ${appIdea}

Architecture plan from orchestrator:
${JSON.stringify(plan, null, 2)}

Write the complete React frontend code for this app.
Include: main App.tsx component, any sub-components needed, API calls matching the endpoints in the plan.`,
      },
    ],
    temperature: 0.2,
    max_tokens: 4000,
  });

  return (
    response.choices[0]?.message?.content?.trim() || "// No code generated"
  );
}
