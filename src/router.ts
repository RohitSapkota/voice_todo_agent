import { renderAppPage } from "./ui/page.tsx";
import type { TranscribeAudio } from "./transcription.ts";

interface AppDependencies {
  transcribeAudio: TranscribeAudio;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function createFetchHandler({ transcribeAudio }: AppDependencies) {
  return async function fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(renderAppPage(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (request.method === "POST" && url.pathname === "/transcribe") {
      try {
        const body = await request.arrayBuffer();
        if (body.byteLength === 0) {
          return json({ error: "No audio data received." }, 400);
        }

        const mimeType = request.headers.get("x-audio-mime") || "audio/webm";
        const text = await transcribeAudio(body, mimeType);

        return json({ text });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return json({ error: message }, 500);
      }
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  };
}
