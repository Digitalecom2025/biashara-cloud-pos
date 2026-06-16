import type { Metadata } from "next";
import { LoginPage } from "@/components/login-page";

export const metadata: Metadata = {
  title: "Login | LeadsStacks POS",
  description: "Sign in to LeadsStacks POS or start a free 14-day trial for your business.",
};

export default function LoginRoute() {
  return <LoginPage />;
}
