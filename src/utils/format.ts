/**
 * Centralized Arabic-Egyptian formatting. The product rule (design spec §0.2)
 * is Western Arabic numerals (0-9) everywhere — but bare `ar-EG` Intl locales
 * default to Eastern Arabic-Indic digits (٠-٩), so every formatter here pins
 * `numberingSystem: "latn"`. Never call Intl directly from components.
 */

const numberFormatter = new Intl.NumberFormat("ar-EG-u-nu-latn");

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** `5000 ج.م` — pair with `/ شهريًا` in the UI where monthly. */
export function formatEGP(amount: number): string {
  return `${numberFormatter.format(amount)} ج.م`;
}

const dateFormatter = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatDate(date: Date | string): string {
  return dateFormatter.format(typeof date === "string" ? new Date(date) : date);
}

/**
 * Admin-queue style relative timestamps: «منذ لحظة» → «منذ دقيقة» → «منذ س
 * دقائق» → falls back to an absolute date beyond a day.
 */
export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));

  if (seconds < 60) return "منذ لحظة";
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "منذ دقيقة";
  if (minutes === 2) return "منذ دقيقتين";
  if (minutes <= 10) return `منذ ${formatNumber(minutes)} دقائق`;
  if (minutes < 60) return `منذ ${formatNumber(minutes)} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "منذ ساعة";
  if (hours === 2) return "منذ ساعتين";
  if (hours < 24) return `منذ ${formatNumber(hours)} ساعات`;
  return formatDate(then);
}

/** Mask a National ID to its last 4 digits: `**********1234`. */
export function maskNationalId(last4: string): string {
  return `**********${last4}`;
}
