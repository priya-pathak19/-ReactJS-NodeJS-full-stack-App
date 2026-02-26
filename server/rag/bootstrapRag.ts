// ==========================================================
// RAG (Retrieval-Augmented Generation) – High-level Architecture
// ==========================================================
//
// RAG = Search + LLM
//
// Instead of letting the AI "guess" an answer, RAG works by:
// 1. Searching relevant information from your own data
// 2. Giving that information to the LLM
// 3. Letting the LLM generate an answer ONLY using that data
//
// ----------------------------------------------------------
// Data Preparation (one-time or on update)
// ----------------------------------------------------------
// 1. Read documents from the /docs folder
// 2. Convert all files into plain text (JSON → string)
// 3. Split large text into small overlapping chunks
// 4. Generate embeddings (vector representations) for each chunk
// 5. Store { text + embedding + source } in a vector store
//
// This creates a searchable "knowledge base" for the app.
//
// ----------------------------------------------------------
// Question Answering (runtime flow)
// ----------------------------------------------------------
// 1. User asks a question
// 2. Convert the question into an embedding
// 3. Compare it with stored embeddings (semantic similarity)
// 4. Retrieve the most relevant chunks
// 5. Send those chunks + the question to the LLM
// 6. LLM generates a grounded, context-aware answer
//
// ----------------------------------------------------------
// Why RAG is used
// ----------------------------------------------------------
// - Prevents hallucinations
// - Uses latest data without retraining the model
// - Works with private/internal documents
// - Scales better than fine-tuning
//
// In short:
// "Look up the right data first, then answer."
// ==========================================================
// “knowledge ingestion” side of RAG.
// “When my backend starts, read all local docs, break them into pieces, convert them into vectors, and keep them in memory so I can answer questions later.”
import fs from "fs";
import path from "path";
import { VECTOR_STORE } from "./ragStore";

// -----------------------------
// Converts a file into plain text
// -----------------------------
// Why this exists:
// - Embeddings only work on text
// - JSON files are objects, not text
// - Keeps file handling logic isolated and clean
function loadFile(filePath: string): string {
  // If the file is JSON, we must stringify it
  if (filePath.endsWith(".json")) {
    // Read JSON file from disk as UTF-8 string
    // Example files in docs folder:
    // ["sla.md", "onboarding.md", "config.json"]
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Convert object back into formatted plain text
    // This ensures:
    // - Embeddings receive readable text
    // - Nested fields are preserved as context
    // - Output is consistent and deterministic
    return JSON.stringify(json, null, 2);
  }
  // For non-JSON files (.md, .txt, etc):
  // - These are already plain text
  // - Safe to embed directly
  // .md, .txt, etc
  return fs.readFileSync(filePath, "utf-8");
}

/// -----------------------------
// Splits large text into smaller chunks
// -----------------------------
// Why chunking is required:
// - Prevents token overflow
// - Improves semantic search accuracy
// - Overlap preserves meaning across chunks
// WHY CHUNKING ? -> Embedding a huge document and it looses details and perform poorly in search.
// Example: Chunk 1: "...deployment requires docker", Chunk 2: "requires docker and kubernetes..." - these both are same as it keeps context between chuks
export function chunkText(
  text: string,
  chunkSize = 500, // number of words per chunk
  overlap = 50, // shared words between chunks
): string[] {
  // Split entire document into words
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  let start = 0;
  // Sliding window approach
  while (start < words.length) {
    const end = start + chunkSize;
    // Create one chunk
    chunks.push(words.slice(start, end).join(" "));
    // Move forward but step back by overlap
    // This keeps context between chunks
    start = end - overlap;
  }

  return chunks;
}

// Isolated so you can swap models later
// Reusable for docs + questions
// Olama runs on : http://localhost:11434
const OLLAMA_BASE_URL = "http://localhost:11434";

// -----------------------------
// Embedding generator
// -----------------------------
// Why embeddings matter:
// - Convert text → numbers that represent meaning
// - Powers semantic (meaning-based) search
// - Same function works for docs + questions
// WHY EMBEDDING MATTER ? -> Intead of matching -> "deploy app" and "application deployment", these are same words.
export async function embed(text: string): Promise<number[]> {
  // Call Ollama embedding API (currently here it is a local server)
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text,
    }),
  });
  // Response contains vector representation of text
  // Example: "How do I deploy my service?" -> { "ebedding": [0.0124,-0.8831,.... ]}
  const data = await response.json();
  return data.embedding;
}

// -----------------------------
// Bootstraps RAG knowledge base
// -----------------------------
// This prepares your data for retrieval
// It does NOT answer questions yet
// RAG = Search + LLM
// Before the AI answers, it looks up the right information, then uses that info to generate the answer.
// Gets the data from file using RAG - the model doesn't guess, It answers from the data.
// User Question - > Search relevant data -> Give the data to LLM -> LLM generates answer.
export async function bootstrapRAG() {
  // Path to your knowledge files
  const docsDir = path.join(process.cwd(), "docs");

  console.log(docsDir, "dir");

  if (!fs.existsSync(docsDir)) {
    console.warn("No /docs folder found, skipping RAG bootstrap");
    return;
  }
  // Read all files in docs folder
  const files = fs.readdirSync(docsDir);

  console.log(`Bootstrapping RAG from ${files.length} files...`);
  // Process each file
  for (const file of files) {
    const fullPath = path.join(docsDir, file);
    // Convert file into plain text
    const rawText = loadFile(fullPath);
    // Split text into chunks
    const chunks = chunkText(rawText);
    // Embed each chunk and store it
    for (const chunk of chunks) {
      const embedding = await embed(chunk);

      VECTOR_STORE.push({
        text: chunk, // actual content
        embedding, // vector representation
        source: file, // which file it came from
      });
    }
  }

  console.log(`RAG ready with ${VECTOR_STORE.length} chunks`);
}
