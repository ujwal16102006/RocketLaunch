import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "lldev.thespacedevs.com",
      },
      {
        protocol: "https",
        hostname: "ll.thespacedevs.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

