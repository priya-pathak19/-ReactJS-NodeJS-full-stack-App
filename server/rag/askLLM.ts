// Answer -> “Are these two vectors pointing in the same direction?”
// Same direction → similar meaning
// Different direction → different meaning
// 1.0   → very similar
// 0.7   → somewhat related
// 0.0   → unrelated
// Measures how similar two embeddings are by meaning
// Returns a number between 0 and 1
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0; // how much the vectors align
  let magA = 0; // length of vector A
  let magB = 0; // length of vector B

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; // alignment
    magA += a[i] * a[i]; // magnitude of A
    magB += b[i] * b[i]; // magnitude of B
  }
  // Normalize result to get similarity score
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// running Ollama locally, Port 11434 is Ollama’s default
const OLLAMA_BASE_URL = "http://localhost:11434";
// This function asks the LLM a question, but forces it to answer ONLY using the retrieved context, so it doesn’t hallucinate.
export async function askLLM(
  question: string,
  context: string,
): Promise<string> {
  // Ollama’s chat endpoint, which works like ChatGPT, It understands roles (system, user), It generates conversational answers
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3", // small, fast LLM
      stream: false, // wait for full response before returning
      messages: [
        // This message controls the LLM’s behavior.
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
        // This is where RAG actually happens.
        // You are literally telling the LLM:
        // “Here is the information you are allowed to use.
        // Now answer this question.”
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
