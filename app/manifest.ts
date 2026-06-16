import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LeadsStacks POS",
    short_name: "LeadsStacks POS",
    description: "Cloud POS for sales, stock, customers, debtors, reports and business control.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F5FAF6",
    theme_color: "#07120D",
    icons: [
      {
        src: "/icons/biashara-icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/biashara-icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
