import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "해기사와 연인들의 항해일지",
    short_name: "해연결 항해일지",
    description: "해연결호에서 함께 승선하는 커플·가족 생활 게임",
    start_url: "/home",
    display: "standalone",
    background_color: "#eaf6ff",
    theme_color: "#eaf6ff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
