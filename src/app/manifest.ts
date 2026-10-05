import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CleanTime",
    short_name: "CleanTime",
    start_url: "/bg",
    display: "standalone",
    background_color: "#f3f7fa",
    theme_color: "#0b1b2b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
