import { GoogleGenAI, createPartFromBase64 } from "@google/genai";

const TRANSCRIPTION_PROMPT =
  "Transcribe this audio. Return only the spoken text with no extra commentary.";

export type TranscribeAudio = (
  audioData: ArrayBuffer,
  mimeType: string,
) => Promise<string>;

export function createGeminiTranscriber(apiKey: string): TranscribeAudio {
  const ai = new GoogleGenAI({ apiKey });

  return async (audioData, mimeType) => {
    const base64Audio = Buffer.from(audioData).toString("base64");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        TRANSCRIPTION_PROMPT,
        createPartFromBase64(base64Audio, mimeType),
      ],
    });

    return response.text?.trim() ?? "";
  };
}
