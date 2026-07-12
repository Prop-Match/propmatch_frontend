import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** Only used if a future feature fetches the backend directly from the browser. */
export const worker = setupWorker(...handlers);
