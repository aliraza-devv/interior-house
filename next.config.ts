import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // No Next.js badge (and its issue count) in the corner of the page on localhost. It only exists in development, so
  // the live site is not affected. Errors that stop the page from rendering still show as the usual error screen.
  devIndicators: false,
  images: {
    // Placeholder photography, hotlinked from Unsplash's own image CDN, which already resizes and encodes. This loader
    // asks it for the width each screen needs, so every image gets a real srcset instead of one oversized file.
    // Swap the photographs (src/lib/photos.ts) for the studio's own project shots before launch.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920, 2400],
    imageSizes: [32, 48, 64, 96, 128, 192, 256, 384],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
