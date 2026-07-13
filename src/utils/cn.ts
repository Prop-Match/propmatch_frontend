import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design system defines custom font-size utilities via @theme tokens
 * (`text-display`, `text-h1`, … `text-caption`; see app/globals.css).
 * tailwind-merge doesn't know these are font sizes, so by default it groups
 * them with text-color utilities and — because the size class is applied last —
 * silently strips a preceding `text-white`/`text-primary`. That made every
 * Button lose its intended text color. Registering the tokens in the font-size
 * group keeps size and color as independent, non-conflicting utilities.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "title", "body", "small", "caption"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
