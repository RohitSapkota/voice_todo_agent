# voice_todo_agent

To install dependencies:

```bash
bun install
```

Set your Gemini key:

```bash
export GEMINI_API_KEY="your_api_key_here"
```

Run the app:

```bash
bun run index.ts
```

Open `http://localhost:3000`, allow microphone access, then:
1. Click `Start Recording`
2. Speak
3. Click `Stop Recording`
4. Read the transcribed text on the page

Optional:
- Change port with `PORT=4000 bun run index.ts`
