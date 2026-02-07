/** @jsxRuntime classic */
/** @jsx h */

type Child = HtmlToken | string | number | boolean | null | undefined | Child[];

type Props = {
  children?: Child | Child[];
  dangerouslySetInnerHTML?: { __html: string };
  [key: string]: unknown;
};

type Component = (props: Props) => HtmlToken;

type Tag = string | Component;

interface HtmlToken {
  __kind: "html";
  html: string;
}

declare global {
  namespace JSX {
    type Element = HtmlToken;
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>;
    }
  }
}

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function htmlToken(html: string): HtmlToken {
  return { __kind: "html", html };
}

function isHtmlToken(value: unknown): value is HtmlToken {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { __kind?: string }).__kind === "html"
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderChild(child: Child): string {
  if (Array.isArray(child)) {
    return child.map(renderChild).join("");
  }

  if (child === null || child === undefined || typeof child === "boolean") {
    return "";
  }

  if (isHtmlToken(child)) {
    return child.html;
  }

  return escapeHtml(String(child));
}

function normalizeAttrName(name: string): string {
  if (name === "className") {
    return "class";
  }

  if (name === "htmlFor") {
    return "for";
  }

  if (name === "charSet") {
    return "charset";
  }

  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function renderAttribute(name: string, value: unknown): string {
  if (name === "children" || name === "dangerouslySetInnerHTML") {
    return "";
  }

  if (value === null || value === undefined || value === false) {
    return "";
  }

  const normalizedName = normalizeAttrName(name);

  if (value === true) {
    return ` ${normalizedName}`;
  }

  return ` ${normalizedName}="${escapeHtml(String(value))}"`;
}

function h(tag: Tag, props: Props | null, ...children: Child[]): HtmlToken {
  const resolvedProps = props ?? {};

  if (typeof tag === "function") {
    return tag({ ...resolvedProps, children });
  }

  const attrs = Object.entries(resolvedProps)
    .map(([name, value]) => renderAttribute(name, value))
    .join("");

  const rawInner = resolvedProps.dangerouslySetInnerHTML;
  const content = rawInner
    ? rawInner.__html
    : children.map((child) => renderChild(child)).join("");

  if (VOID_TAGS.has(tag)) {
    return htmlToken(`<${tag}${attrs}>`);
  }

  return htmlToken(`<${tag}${attrs}>${content}</${tag}>`);
}

const styles = `
:root {
  color-scheme: light;
  --bg: #f5f6f8;
  --panel: #ffffff;
  --text: #15202b;
  --muted: #6a7782;
  --primary: #006f9d;
  --danger: #b42318;
  --border: #d9e2ec;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 0% 0%, #d9eef7 0%, transparent 40%),
    radial-gradient(circle at 100% 100%, #dff5ea 0%, transparent 45%),
    var(--bg);
  color: var(--text);
  font: 16px/1.45 "Avenir Next", "Segoe UI", sans-serif;
  padding: 24px;
}
.card {
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
.row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
button {
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .15s ease;
}
button:disabled {
  opacity: .5;
  cursor: not-allowed;
}
#startBtn {
  background: var(--primary);
  color: #fff;
}
#stopBtn {
  background: var(--danger);
  color: #fff;
}
.status {
  font-size: 0.92rem;
  color: var(--muted);
  margin-bottom: 12px;
}
.transcript {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fcfdff;
  padding: 12px;
  min-height: 86px;
  white-space: pre-wrap;
}
`;

const clientScript = `
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");

let mediaRecorder = null;
let stream = null;
let chunks = [];

function setStatus(message) {
  statusEl.textContent = message;
}

function pickSupportedMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const type of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

async function transcribe(blob) {
  setStatus("Sending audio to Gemini...");
  const response = await fetch("/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Audio-Mime": blob.type || "audio/webm"
    },
    body: blob,
  });

  if (!response.ok) {
    let details = "Transcription failed.";
    try {
      const err = await response.json();
      details = err.error || details;
    } catch (_) {}
    throw new Error(details);
  }

  const data = await response.json();
  return data.text || "";
}

startBtn.addEventListener("click", async () => {
  try {
    transcriptEl.textContent = "Transcript will appear here.";
    setStatus("Requesting microphone permission...");
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = pickSupportedMimeType();
    mediaRecorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        setStatus("Processing recording...");
        const recordedMime = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(chunks, { type: recordedMime });
        const text = await transcribe(blob);
        transcriptEl.textContent = text || "(No speech recognized)";
        setStatus("Done");
      } catch (error) {
        transcriptEl.textContent = "Error: " + (error.message || String(error));
        setStatus("Failed");
      } finally {
        if (stream) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
        }
        stream = null;
        mediaRecorder = null;
        startBtn.disabled = false;
        stopBtn.disabled = true;
      }
    };

    mediaRecorder.start();
    setStatus("Recording... click Stop when done.");
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (error) {
    setStatus("Unable to access microphone.");
    transcriptEl.textContent = "Error: " + (error.message || String(error));
  }
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    setStatus("Stopping recording...");
    mediaRecorder.stop();
  }
});
`;

function Page(): HtmlToken {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Voice to Text (Gemini)</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <main className="card">
          <h1>Voice Input to Gemini Text</h1>
          <p>Click Start, speak, then click Stop to transcribe.</p>
          <div className="row">
            <button id="startBtn">Start Recording</button>
            <button id="stopBtn" disabled>
              Stop Recording
            </button>
          </div>
          <div id="status" className="status">
            Idle
          </div>
          <div id="transcript" className="transcript">
            Transcript will appear here.
          </div>
        </main>
        <script dangerouslySetInnerHTML={{ __html: clientScript }} />
      </body>
    </html>
  );
}

export function renderAppPage(): string {
  return `<!doctype html>${Page().html}`;
}
