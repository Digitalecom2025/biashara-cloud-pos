import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { getCurrentBusiness } from "@/lib/settings-data";
import { settingsData } from "@/lib/settings-validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const business = await getCurrentBusiness();
    return NextResponse.json({
      data: {
        id: business.id,
        name: business.name,
        phone: business.phone,
        email: business.email,
        location: business.location,
        industryMode: business.industryMode,
        packagePlan: business.packagePlan,
        status: business.status,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Business could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const current = await getCurrentBusiness();
  const body = await request.json();
  const parsed = settingsData({
    name: body.name ?? current.name,
    phone: body.phone ?? current.phone,
    email: body.email ?? current.email,
    location: body.location ?? current.location,
    industryMode: body.industryMode ?? current.industryMode,
    packagePlan: current.packagePlan,
  });
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      name: parsed.data.business.name,
      phone: parsed.data.business.phone,
      email: parsed.data.business.email,
      location: parsed.data.business.location,
      industryMode: parsed.data.business.industryMode,
    },
  });

  return NextResponse.json({ data: business, message: "Business profile saved." });
}
