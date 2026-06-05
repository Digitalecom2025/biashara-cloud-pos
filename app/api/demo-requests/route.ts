import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type DemoRequestInput = {
  fullName?: unknown;
  businessName?: unknown;
  phone?: unknown;
  email?: unknown;
  businessType?: unknown;
  usersCount?: unknown;
  message?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DemoRequestInput;
  const fullName = text(body.fullName);
  const businessName = text(body.businessName);
  const phone = text(body.phone);
  const email = text(body.email);
  const businessType = text(body.businessType);
  const message = text(body.message);
  const usersCountValue = text(body.usersCount);
  const usersCount = usersCountValue ? Number(usersCountValue) : null;
  const errors: string[] = [];

  if (!fullName) errors.push("Full name is required.");
  if (!businessName) errors.push("Business name is required.");
  if (!phone) errors.push("Phone number is required.");
  if (!businessType) errors.push("Business type is required.");
  if (email && !validEmail(email)) errors.push("Enter a valid email address.");
  if (usersCountValue && (!Number.isFinite(usersCount) || Number(usersCount) < 0)) errors.push("Number of users/cashiers must be 0 or greater.");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const now = new Date();
  const id = `demo_req_${randomUUID()}`;

  await prisma.$executeRaw`
    INSERT INTO "DemoRequest"
      ("id", "fullName", "businessName", "phone", "email", "businessType", "usersCount", "message", "status", "createdAt", "updatedAt")
    VALUES
      (${id}, ${fullName}, ${businessName}, ${phone}, ${email || null}, ${businessType}, ${usersCount}, ${message || null}, ${"new"}, ${now}, ${now})
  `;

  return NextResponse.json({
    data: { id, status: "new" },
    message: "Thank you. We'll contact you shortly to schedule your POS demo.",
  }, { status: 201 });
}
