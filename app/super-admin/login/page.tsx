import type { Metadata } from "next";
import { SuperAdminLoginPage } from "@/components/super-admin-login-page";

export const metadata: Metadata = {
  title: "Super Admin Login | LeadsStacks POS",
  description: "Internal LeadsStacks POS platform administration login.",
};

export default function SuperAdminLoginRoute() {
  return <SuperAdminLoginPage />;
}
