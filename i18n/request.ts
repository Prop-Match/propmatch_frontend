import { getRequestConfig } from "next-intl/server";

/**
 * Single-locale (ar-EG) setup for now — ship Arabic-first per the product spec.
 * Adding `en` later means: add `messages/en.json` and make `locale` dynamic
 * (cookie/header-derived) instead of hardcoded here.
 */
export default getRequestConfig(async () => {
  const locale = "ar";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
