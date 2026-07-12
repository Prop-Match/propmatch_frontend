/**
 * Loaded via Jest's `setupFiles` (before the test framework, and before
 * jest.setup.ts). Uses `require`, not `import` — ES imports are hoisted
 * above other statements, which would evaluate undici's module (and thus
 * reference the global TextEncoder/TextDecoder it expects) before this
 * polyfill runs. See: https://mswjs.io/docs/migrations/1.x-to-2.x/#jsdom-configuration
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { TextDecoder, TextEncoder } = require("node:util");
const { ReadableStream, TransformStream, WritableStream } = require("node:stream/web");
const { MessageChannel, MessagePort, BroadcastChannel } = require("node:worker_threads");
Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
  ReadableStream,
  TransformStream,
  WritableStream,
  MessageChannel,
  MessagePort,
  BroadcastChannel,
});

const { Blob, File } = require("node:buffer");
const { fetch, Headers, FormData, Request, Response } = require("undici");

// configurable: true — MSW's interceptors patch these globals at runtime.
Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true, configurable: true },
  Blob: { value: Blob, writable: true, configurable: true },
  File: { value: File, writable: true, configurable: true },
  Headers: { value: Headers, writable: true, configurable: true },
  FormData: { value: FormData, writable: true, configurable: true },
  Request: { value: Request, writable: true, configurable: true },
  Response: { value: Response, writable: true, configurable: true },
});
