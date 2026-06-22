/** @type {import('next').NextConfig} */

// Activé uniquement pour le déploiement statique (ex. GitHub Pages).
// En dev et sur un hébergement Node (Vercel), ces variables ne sont pas définies
// et le site garde ses routes API dynamiques.
const isExport = process.env.EXPORT === "true";
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath || undefined,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: isExport,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
