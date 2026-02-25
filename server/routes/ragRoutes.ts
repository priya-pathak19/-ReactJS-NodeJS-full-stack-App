import express from "express";
import { askLLM, cosineSimilarity } from "../rag/askLLM";
import { embed } from "../rag/bootstrapRag";
import { VECTOR_STORE } from "../rag/ragStore";
const router = express.Router();

router.post("/ask", async (req, res) => {
  const { question } = req.body;

  const questionEmbedding = await embed(question);

  const topChunks = VECTOR_STORE.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(chunk.embedding, questionEmbedding),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const context = topChunks.map((c) => c.text).join("\n---\n");

  const answer = await askLLM(question, context);

  res.json({ answer });
});
export default router;
