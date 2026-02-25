type DocChunk = {
  text: string; // actual chunk content
  embedding: number[]; // vector from embedding model
  source?: string; // filename (optional but useful)
};

export const VECTOR_STORE: DocChunk[] = [];
