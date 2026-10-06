import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RouteShell } from "@/components/route-shell";
import { PwaServiceWorker } from "@/components/pwa-controls";

export const metadata: Metadata = {
  metadataBase: new URL("https://leadsstacks.com"),
  title: { default: "LeadsStacks | POS & Business Management Software Kenya", template: "%s" },
  description: "Cloud POS system for sales, stock, customers, debtors, reports and business control.",
  openGraph: {
    type: "website",
    siteName: "LeadsStacks",
    locale: "en_KE",
    images: [{ url: "/images/product/leadsstacks-dashboard.png", width: 1600, height: 1000, alt: "LeadsStacks product interface mockup" }],
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "LeadsStacks POS",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#07120D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PwaServiceWorker />
        <RouteShell>{children}</RouteShell>
      </body>
    </html>
  );
}
