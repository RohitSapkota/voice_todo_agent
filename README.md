# TODO voice assistant

Install TypeScript dependencies:

```bash
bun install
```

Set your Gemini key (used by the Go backend):

```bash
export GEMINI_API_KEY="your_api_key_here"
```

Run the Go backend (`POST /audio` on port `8000`):

```bash
go run src/api/main.go
```

Run the Bun UI server:

```bash
bun run index.ts
```

Open `http://localhost:3000`, and click to talk.
