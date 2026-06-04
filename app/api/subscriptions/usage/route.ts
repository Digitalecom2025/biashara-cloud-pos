import { NextResponse } from "next/server";
import { getCurrentSubscription } from "@/lib/subscription-data";

export async function GET() {
  try {
    const subscription = await getCurrentSubscription();
    return NextResponse.json({ data: subscription.usage });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Usage could not be loaded." }, { status: 500 });
  }
}
