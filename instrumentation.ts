/**
 * Starts the MSW Node server inside the Next.js server runtime so Route
 * Handlers (app/api/**) hit mocked NestJS responses instead of a real
 * backend. Enable with API_MOCKING=enabled in .env.local (see .env.example).
 * Disable once a real NESTJS_API_URL is available.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.API_MOCKING === "enabled") {
    const { server } = await import("./src/mocks/node");
    server.listen({ onUnhandledRequest: "bypass" });
  }
}
