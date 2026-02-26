type DocChunk = {
  text: string; // actual chunk content
  embedding: number[]; // vector from embedding model
  source?: string; // filename (optional but useful)
};

// how vector store looks like with data
// [
//   {
//     text: "How to deploy the service...",
//     embedding: [0.12, 0.98, ...],
//     source: "deployment.md"
//   }
// ]
export const VECTOR_STORE: DocChunk[] = [];
