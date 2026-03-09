import Groq from "groq-sdk";

export async function runReviewAgent(
  groq: Groq,
  appIdea: string,
  frontendCode: string,
  backendCode: string,
  plan: any,
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a senior code reviewer (review-agent).
You receive BOTH frontend and backend code and check for consistency and quality.
Your review must cover:
1. ✅ API Endpoint Consistency - Do frontend API calls match backend routes exactly? (method + path)
2. ✅ Data Shape Consistency - Do request/response data shapes match between frontend and backend?
3. ✅ Error Handling - Is error handling present on both sides?
4. ✅ Missing Pieces - Any endpoints called in frontend but missing in backend or vice versa?
5. ✅ Overall Quality - Any obvious bugs or improvements?

Format your response as:
## Review Summary
[overall verdict: APPROVED / NEEDS FIXES]

## API Consistency
[findings]

## Data Shapes
[findings]

## Error Handling
[findings]

## Missing Pieces
[findings]

## Recommendations
[list of specific improvements]`,
      },
      {
        role: "user",
        content: `App idea: ${appIdea}

Original plan:
${JSON.stringify(plan, null, 2)}

--- FRONTEND CODE ---
${frontendCode}

--- BACKEND CODE ---
${backendCode}

Please review both for consistency and quality.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content?.trim() || "No review generated";
}
