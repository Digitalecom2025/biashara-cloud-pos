import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "LeadsStacks POS | Cloud POS for Kenyan Businesses",
  description: "Cloud POS system for Kenyan SMEs that need sales, stock, customers, debtors, reports and business control from one simple system.",
};

export default function HomePage() {
  return <LandingPage />;
}
