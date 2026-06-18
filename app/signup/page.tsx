import type { Metadata } from "next";
import { TrialSignupPage } from "@/components/trial-signup-page";

export const metadata: Metadata = {
  title: "Start Free 14-Day Trial | Biashara POS",
  description: "Start a free Biashara POS trial for sales, stock, customers, debtors, reports and cloud business control.",
};

export default function SignupPage() {
  return <TrialSignupPage />;
}
