/** @type {import('next').NextConfig} */

// EXPORT=true génère un site 100 % statique (GitHub Pages, etc.).
// Sans variable, le build reste standard (Vercel, Node…).
const isExport = process.env.EXPORT === "true";
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath || undefined,
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: isExport,
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
