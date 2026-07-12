import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Mock/sample listing photos are served from Unsplash. When the real
    // backend + storage (AWS S3 / Cloudflare R2 per the SRS) is wired in,
    // replace this with the actual asset host(s).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default withNextIntl(nextConfig);
