import { NextResponse } from "next/server";
import { createSuperAdminToken, validateSuperAdminCredentials } from "@/lib/super-admin-auth";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  const email = text(body.email);
  const password = text(body.password);

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (!validateSuperAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid Super Admin credentials." }, { status: 401 });
  }

  return NextResponse.json({
    data: {
      email: email.toLowerCase(),
      token: createSuperAdminToken(email),
    },
  });
}
