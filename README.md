# voice_todo_agent

Install TypeScript dependencies:

```bash
bun install
```

Set your Gemini key (used by the Go backend):

```bash
export GEMINI_API_KEY="your_api_key_here"
```

Run the Go backend (`POST /text` on port `8000`):

```bash
go run src/api/main.go
```

Run the Bun UI server:

```bash
bun run index.ts
```

Open `http://localhost:3000`, type text, and click `Send`.

Optional:
- Change UI port with `PORT=4000 bun run index.ts`
- Change backend URL with `BACKEND_URL=http://localhost:8000 bun run index.ts`
