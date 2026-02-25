export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const OLLAMA_BASE_URL = "http://localhost:11434";

export async function askLLM(
  question: string,
  context: string,
): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3",
      stream: false,
      messages: [
        {
          role: "system",
          content: `
            You are a documentation assistant.

            RULES:
            - Use ONLY information explicitly stated in the provided context.
            - Do NOT add explanations, assumptions, or external knowledge.
            - Do NOT infer details that are not written in the context.
            - Do NOT rephrase with additional meaning.
            - If the answer is not fully present in the context, reply exactly:
                "The document does not specify this."

            Your response must be factual and grounded strictly in the context.
        `,
        },
        {
          role: "user",
          content: `CONTEXT:
${context}

QUESTION:
${question}`,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.message?.content ?? "";
}
