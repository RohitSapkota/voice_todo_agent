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

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(renderAppPage(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (request.method === "POST" && url.pathname === "/text") {
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

        const backendResponse = await fetch(`${backendUrl}/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ text }),
        });

        if (!backendResponse.ok) {
          const backendError = await backendResponse.text();
          return json(
            {
              error: backendError || "Backend request failed.",
            },
            backendResponse.status,
          );
        }

        return json({ ok: true });
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
