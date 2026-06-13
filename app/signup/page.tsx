import type { Metadata } from "next";
import { TrialSignupPage } from "@/components/trial-signup-page";

export const metadata: Metadata = {
  title: "Start Free Trial | Biashara Cloud POS",
  description: "Start a free 14-day Biashara Cloud POS trial for sales, stock, customers, debtors, reports and offline sync.",
};

export default function SignupPage() {
  return <TrialSignupPage />;
}
