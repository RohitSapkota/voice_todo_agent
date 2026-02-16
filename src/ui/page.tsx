export function renderAppPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Voice Todo Agent</title>
    <style>
      :root {
        --bg-0: #fbf7ef;
        --bg-1: #d8f1e1;
        --bg-2: #e1edff;
        --panel: #ffffff;
        --panel-soft: #f7fafc;
        --text: #1b2530;
        --muted: #556678;
        --primary: #0f766e;
        --primary-strong: #0a5a54;
        --danger: #ba1a1a;
        --border: #dbe6ef;
        --shadow: 0 18px 40px rgba(15, 38, 62, 0.13);
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 20px;
        color: var(--text);
        background:
          radial-gradient(circle at 12% 12%, var(--bg-1) 0%, transparent 42%),
          radial-gradient(circle at 85% 88%, var(--bg-2) 0%, transparent 45%),
          var(--bg-0);
        font: 16px/1.5 "Sora", "Avenir Next", "Segoe UI", sans-serif;
      }
      main {
        width: min(760px, 100%);
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 22px;
        box-shadow: var(--shadow);
        animation: fadeIn 260ms ease-out;
      }
      h1 {
        margin: 0;
        font-size: 1.5rem;
        letter-spacing: -0.02em;
      }
      p {
        margin: 6px 0 16px;
        color: var(--muted);
      }
      .header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }
      .label {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        border: 1px solid #bbdccc;
        background: #ecf8f2;
        color: #1d6a4f;
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .controls {
        display: grid;
        gap: 12px;
      }
      .response-wrap {
        margin-top: 18px;
      }
      .response-wrap h2 {
        margin: 0 0 8px;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .response-window {
        margin: 0;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: linear-gradient(180deg, #fcfdff 0%, #f4f9ff 100%);
        padding: 14px;
        color: var(--text);
        min-height: 130px;
        max-height: 320px;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-word;
        font: 15px/1.58 "Sora", "Avenir Next", "Segoe UI", sans-serif;
      }
      .response-window.error {
        border-color: #f2b8b5;
        background: #fff8f7;
        color: #8b2020;
      }
      #micBtn.listening {
        background: linear-gradient(135deg, #0a5a54 0%, #0f766e 100%);
        animation: pulse 1.2s ease-in-out infinite;
      }
      .transcript {
        margin: 2px 0 0;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--panel-soft);
        padding: 12px;
        color: var(--muted);
        min-height: 50px;
        white-space: pre-wrap;
        word-break: break-word;
      }
      button {
        width: max-content;
        border: 0;
        border-radius: 12px;
        padding: 11px 16px;
        font-size: 0.94rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        cursor: pointer;
        color: #fff;
        background: linear-gradient(135deg, var(--primary) 0%, #148f84 100%);
        box-shadow: 0 8px 16px rgba(15, 118, 110, 0.25);
        transition: transform 120ms ease, box-shadow 120ms ease;
      }
      button:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(15, 118, 110, 0.28);
      }
      button:disabled {
        opacity: 0.62;
        cursor: not-allowed;
      }
      #status {
        margin-top: 12px;
        border-radius: 10px;
        padding: 8px 10px;
        background: #f2f6fb;
        color: var(--muted);
        font-size: 0.92rem;
      }
      #status.error {
        background: #fff3f1;
        color: var(--danger);
      }
      @media (max-width: 640px) {
        body {
          padding: 14px;
        }
        main {
          padding: 16px;
          border-radius: 14px;
        }
        h1 {
          font-size: 1.28rem;
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 8px 16px rgba(15, 118, 110, 0.22);
        }
        50% {
          box-shadow: 0 12px 24px rgba(15, 118, 110, 0.36);
        }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="header">
        <h1>Voice Todo Agent</h1>
        <span class="label">Live</span>
      </div>
      <p>Speak naturally, then review the cleaned response below.</p>
      <section class="controls">
        <button id="micBtn" type="button">Start Voice Input</button>
        <div class="transcript" id="transcript">Your transcript appears here.</div>
      </section>
      <section class="response-wrap">
        <h2>Assistant Reply</h2>
        <div class="response-window" id="audioResponse">Waiting for a response.</div>
      </section>
      <div id="status">Idle</div>
    </main>
    <script>
      const micBtn = document.getElementById("micBtn");
      const transcriptEl = document.getElementById("transcript");
      const audioResponseEl = document.getElementById("audioResponse");
      const statusEl = document.getElementById("status");
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      let isSending = false;
      let isListening = false;

      function setStatus(message, isError = false) {
        statusEl.textContent = message;
        statusEl.classList.toggle("error", isError);
      }

      function setListening(nextValue) {
        isListening = nextValue;
        micBtn.classList.toggle("listening", nextValue);
        micBtn.textContent = nextValue ? "Stop Listening" : "Start Voice Input";
      }

      function setAudioResponse(value, isError = false) {
        audioResponseEl.textContent = value;
        audioResponseEl.classList.toggle("error", isError);
      }

      function formatPayload(rawBody, contentType) {
        if (!rawBody) {
          return { display: "(empty response)" };
        }

        const looksLikeJSON =
          contentType.includes("application/json") || rawBody.trim().startsWith("{");

        if (!looksLikeJSON) {
          return { display: rawBody };
        }

        try {
          const payload = JSON.parse(rawBody);
          if (payload && typeof payload.response === "string" && payload.response.trim()) {
            return { display: payload.response.trim() };
          }
          if (payload && typeof payload.error === "string" && payload.error.trim()) {
            return { display: payload.error.trim(), error: payload.error.trim() };
          }
          return { display: JSON.stringify(payload, null, 2) };
        } catch (_) {
          return { display: rawBody };
        }
      }

      async function sendTranscript(text) {
        if (!text || isSending) {
          return;
        }

        isSending = true;
        micBtn.disabled = true;
        setStatus("Sending request...");
        setAudioResponse("Thinking...");

        try {
          const response = await fetch("/audio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ text }),
          });
          const rawBody = await response.text();
          const contentType = response.headers.get("content-type") || "";
          const formatted = formatPayload(rawBody, contentType);

          if (!response.ok) {
            const details = formatted.error || formatted.display || "Request failed.";
            setAudioResponse(formatted.display || "Request failed.", true);
            throw new Error(details);
          }

          setAudioResponse(formatted.display || "(empty response)");
          setStatus("Ready for next input.");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          setStatus(message, true);
        } finally {
          isSending = false;
          micBtn.disabled = false;
        }
      }

      if (!SpeechRecognition) {
        micBtn.disabled = true;
        setStatus("Voice input is not supported in this browser.", true);
      } else {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => {
          setListening(true);
          setStatus("Listening...");
        };

        recognition.onresult = async (event) => {
          const transcript = Array.from(event.results)
            .map((result) => (result[0] ? result[0].transcript : ""))
            .join(" ")
            .trim();

          if (!transcript) {
            transcriptEl.textContent = "No speech detected.";
            setStatus("No speech detected. Try again.", true);
            return;
          }

          transcriptEl.textContent = transcript;
          await sendTranscript(transcript);
        };

        recognition.onerror = (event) => {
          if (event.error === "not-allowed") {
            setStatus("Microphone permission denied.", true);
            return;
          }

          if (event.error === "no-speech") {
            setStatus("No speech detected. Try again.", true);
            return;
          }

          setStatus("Voice input failed: " + event.error, true);
        };

        recognition.onend = () => {
          setListening(false);
          if (!isSending && statusEl.textContent === "Listening...") {
            setStatus("Idle");
          }
        };

        micBtn.addEventListener("click", () => {
          if (isSending) {
            return;
          }

          if (isListening) {
            recognition.stop();
            return;
          }

          transcriptEl.textContent = "Listening for your speech...";
          setStatus("Requesting microphone access...");
          recognition.start();
        });
      }
    </script>
  </body>
</html>`;
}
