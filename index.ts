import { createFetchHandler } from "./src/router.ts";
import { createGeminiTranscriber } from "./src/transcription.ts";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment.");
}

const port = Number(process.env.PORT ?? 3000);
const transcribeAudio = createGeminiTranscriber(geminiApiKey);

const server = Bun.serve({
  port,
  fetch: createFetchHandler({ transcribeAudio }),
});

console.log(`Voice transcription server running at ${server.url}`);
