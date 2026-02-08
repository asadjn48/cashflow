/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from "next";

// 1. Import from the new package
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // Disable in dev mode
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {

};

// 2. Wrap your config with PWA
export default withPWA(nextConfig);