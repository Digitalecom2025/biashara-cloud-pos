import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "Biashara Cloud POS | Sales, Stock, Debtors & Offline Sync",
  description: "Cloud and hybrid POS system for Kenyan SMEs, supermarkets, restaurants, retail shops, hardware, cosmetics, auto spares and more.",
};

export default function HomePage() {
  return <LandingPage />;
}
