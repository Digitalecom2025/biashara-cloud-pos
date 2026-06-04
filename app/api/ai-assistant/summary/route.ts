import { NextResponse } from "next/server";
import { getAiAssistantSummary } from "@/lib/ai-data";

export async function GET() {
  try {
    return NextResponse.json({ data: await getAiAssistantSummary() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI assistant summary could not be loaded." }, { status: 500 });
  }
}
