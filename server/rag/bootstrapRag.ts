// “When my backend starts, read all local docs, break them into pieces, convert them into vectors, and keep them in memory so I can answer questions later.”
import fs from "fs";
import path from "path";
import { VECTOR_STORE } from "./ragStore";

// Embeddings work only on text
// JSON must be stringified
// Keeps file handling isolated
function loadFile(filePath: string): string {
  // read local docs
  if (filePath.endsWith(".json")) {
    // readFileSync: reads filename - > ["sla.md", "onboarding.md", "config.json"]
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return JSON.stringify(json, null, 2);
  }

  // .md, .txt, etc
  return fs.readFileSync(filePath, "utf-8");
}

// Improves retrieval accuracy
// Prevents token overflow
// Overlap preserves context
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 50,
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  let start = 0;
  while (start < words.length) {
    const end = start + chunkSize;
    chunks.push(words.slice(start, end).join(" "));
    start = end - overlap;
  }

  return chunks;
}

// Embeddings power semantic search
// Isolated so you can swap models later
// Reusable for docs + questions
// Olama runs on : http://localhost:11434
const OLLAMA_BASE_URL = "http://localhost:11434";

export async function embed(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text,
    }),
  });

  const data = await response.json();
  return data.embedding;
}

// Gets the data from file using RAG
export async function bootstrapRAG() {
  const docsDir = path.join(process.cwd(), "docs");

  console.log(docsDir, "dir");

  if (!fs.existsSync(docsDir)) {
    console.warn("No /docs folder found, skipping RAG bootstrap");
    return;
  }

  const files = fs.readdirSync(docsDir);

  console.log(`Bootstrapping RAG from ${files.length} files...`);

  for (const file of files) {
    const fullPath = path.join(docsDir, file);
    const rawText = loadFile(fullPath);
    const chunks = chunkText(rawText);

    for (const chunk of chunks) {
      const embedding = await embed(chunk);

      VECTOR_STORE.push({
        text: chunk,
        embedding,
        source: file,
      });
    }
  }

  console.log(`RAG ready with ${VECTOR_STORE.length} chunks`);
}
