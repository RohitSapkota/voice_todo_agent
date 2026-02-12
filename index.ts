import { createFetchHandler } from "./src/router.ts";

const port = Number(process.env.PORT ?? 3000);

const server = Bun.serve({
  port,
  fetch: createFetchHandler(),
});

console.log(`Voice todo UI running at ${server.url}`);
