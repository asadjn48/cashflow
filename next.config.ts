/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from "next";

// 1. Setup PWA 
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development", 
  register: true,
  skipWaiting: true,
});

// 2. Define Standard Config
const nextConfig: NextConfig = {
  
  reactStrictMode: true,
};


export default withPWA({
  ...nextConfig,
  eslint: {
    ignoreDuringBuilds: true,
  },
} as any);