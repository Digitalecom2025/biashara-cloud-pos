import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "LeadsStacks POS",
  description: "Cloud POS system for sales, stock, customers, debtors, reports and business control.",
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
