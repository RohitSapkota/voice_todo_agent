import { renderAppPage } from "./ui/page.tsx";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function createFetchHandler() {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

  return async function handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const isAudioEndpoint = url.pathname === "/audio";

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(renderAppPage(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (isAudioEndpoint && request.method !== "POST") {
      return json({ error: "Method not allowed. Use POST." }, 405);
    }

    if (request.method === "POST" && isAudioEndpoint) {
      try {
        const rawBody = await request.json().catch(() => null);
        const text =
          rawBody &&
          typeof rawBody === "object" &&
          "text" in rawBody &&
          typeof rawBody.text === "string"
            ? rawBody.text.trim()
            : "";

        if (!text) {
          return json({ error: "Missing text." }, 400);
        }

        const backendResponse = await fetch(`${backendUrl}/audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ text }),
        });
        const backendBody = await backendResponse.text();
        const backendContentType =
          backendResponse.headers.get("content-type") ||
          "application/json; charset=utf-8";

        if (!backendBody && !backendResponse.ok) {
          return json({ error: "Backend request failed." }, backendResponse.status);
        }

        return new Response(backendBody, {
          status: backendResponse.status,
          headers: { "Content-Type": backendContentType },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return json({ error: message }, 500);
      }
    }

    return new Response("Not found", { status: 404 });
  };
}
