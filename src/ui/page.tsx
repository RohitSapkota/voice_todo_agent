export function renderAppPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Voice Todo Agent</title>
    <style>
      :root {
        --bg: #f5f6f8;
        --panel: #ffffff;
        --text: #15202b;
        --muted: #607080;
        --primary: #0b6a8e;
        --danger: #b42318;
        --border: #d9e2ec;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        color: var(--text);
        background:
          radial-gradient(circle at 0% 0%, #d9eef7 0%, transparent 40%),
          radial-gradient(circle at 100% 100%, #dff5ea 0%, transparent 45%),
          var(--bg);
        font: 16px/1.45 "Avenir Next", "Segoe UI", sans-serif;
      }
      main {
        width: min(720px, 100%);
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 1.35rem;
      }
      p {
        margin: 0 0 14px;
        color: var(--muted);
      }
      form {
        display: grid;
        gap: 10px;
      }
      textarea {
        width: 100%;
        min-height: 120px;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px;
        font: inherit;
        resize: vertical;
      }
      button {
        width: fit-content;
        border: 0;
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        color: #fff;
        background: var(--primary);
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      #status {
        margin-top: 6px;
        color: var(--muted);
      }
      #status.error {
        color: var(--danger);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Voice Todo Agent</h1>
      <p>Send text to the Go backend endpoint (<code>POST /text</code>).</p>
      <form id="todoForm">
        <textarea id="textInput" placeholder="Type your request..." required></textarea>
        <button id="sendBtn" type="submit">Send</button>
      </form>
      <div id="status">Idle</div>
    </main>
    <script>
      const form = document.getElementById("todoForm");
      const textInput = document.getElementById("textInput");
      const sendBtn = document.getElementById("sendBtn");
      const statusEl = document.getElementById("status");

      function setStatus(message, isError = false) {
        statusEl.textContent = message;
        statusEl.classList.toggle("error", isError);
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const text = textInput.value.trim();

        if (!text) {
          setStatus("Enter text before sending.", true);
          return;
        }

        sendBtn.disabled = true;
        setStatus("Sending request...");

        try {
          const response = await fetch("/text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ text }),
          });

          if (!response.ok) {
            let details = "Request failed.";
            try {
              const body = await response.json();
              if (body && typeof body.error === "string" && body.error) {
                details = body.error;
              }
            } catch (_) {}
            throw new Error(details);
          }

          setStatus("Request sent successfully.");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          setStatus(message, true);
        } finally {
          sendBtn.disabled = false;
        }
      });
    </script>
  </body>
</html>`;
}
