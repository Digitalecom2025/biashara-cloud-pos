import type { Metadata } from "next";
import { TrialSignupPage } from "@/components/trial-signup-page";

export const metadata: Metadata = {
  title: "Start Free Trial | LeadsStacks POS",
  description: "Start a free LeadsStacks POS trial for sales, stock, customers, debtors, reports and cloud business control.",
};

export default function SignupPage() {
  return <TrialSignupPage />;
}
