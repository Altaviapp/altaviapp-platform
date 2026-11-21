import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abordo",
    short_name: "Abordo",
    description: "Rutas escolares en vivo para colegios, conductores y familias.",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#12301f",
    theme_color: "#12301f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
