import express from "express";
import { askLLM, cosineSimilarity } from "../rag/askLLM";
import { embed } from "../rag/bootstrapRag";
import { VECTOR_STORE } from "../rag/ragStore";
const router = express.Router();

// From all stored knowledge, find the text that best matches the user’s question by meaning.
// -----------------------------
// RAG Question Answer Endpoint
// -----------------------------
router.post("/ask", async (req, res) => {
  // 1. Get user question
  const { question } = req.body;
  // 2. Convert question into embedding
  const questionEmbedding = await embed(question);

  // 3. Compare question with all stored chunks
  // Score every stored chunk
  //   {
  //   text: "...",
  //   embedding: [...],
  //   source: "docs.md",
  //   score: 0.87
  // }
  const topChunks = VECTOR_STORE.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(chunk.embedding, questionEmbedding),
  })) // 4. Sort by similarity score
    .sort((a, b) => b.score - a.score) // Pick the best matches
    .slice(0, 4); // 5. Take top N most relevant chunks

  const context = topChunks.map((c) => c.text).join("\n---\n"); // 6. Combine chunk texts into context
  // 7. Ask LLM using retrieved context
  // Answer the question using ONLY this context.
  const answer = await askLLM(question, context);
  // 8. Send answer back to client
  res.json({ answer });
});
export default router;
