import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Onebridge Stalwart",
    short_name: "Onebridge",
    description: "Sistema de propostas",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe7",
    theme_color: "#173b34",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/franklin-maskable.png",
        sizes: "2048x2048",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
