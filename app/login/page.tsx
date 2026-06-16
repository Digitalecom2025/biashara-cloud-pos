import type { Metadata } from "next";
import { LoginPage } from "@/components/login-page";

export const metadata: Metadata = {
  title: "Login | LeadsStacks POS",
  description: "Login to LeadsStacks POS for trial accounts, active subscriptions and internal demo access.",
};

export default function LoginRoute() {
  return <LoginPage />;
}
