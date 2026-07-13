import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dispatch } from "./router";

/**
 * Real HTTP server standing in for the NestJS backend, served on the same
 * origin as NESTJS_API_URL. Unlike MSW fetch-interception (which proved
 * unreliable for nested RSC → route-handler → backend calls inside Next.js),
 * a real server is reachable identically from every context. Started from
 * instrumentation.ts when API_MOCKING=enabled.
 */

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(undefined);
      }
    });
    req.on("error", () => resolve(undefined));
  });
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
  const result = dispatch(
    req.method ?? "GET",
    url.pathname,
    url.searchParams,
    req.headers.authorization ?? null,
    body,
  );
  res.writeHead(result.status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(result.body));
}

let started = false;

export function startMockServer(port: number) {
  if (started) return;
  started = true;
  const server = createServer((req, res) => {
    handle(req, res).catch(() => {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ statusCode: 500, message: "mock server error" }));
    });
  });
  server.on("error", (e: NodeJS.ErrnoException) => {
    // Another dev instance already owns the port — reuse it (identical mock),
    // don't crash the server process.
    if (e.code === "EADDRINUSE") {
      console.log(`[mock] backend port ${port} already in use — reusing existing instance`);
    } else {
      console.error("[mock] backend error", e);
    }
  });
  server.listen(port, () => {
    console.log(`[mock] backend listening on http://localhost:${port}`);
  });
}
