import { NextResponse } from "next/server";
import { buildTwin } from "@/lib/server";
import { mockCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.resumeText || !body.github || !body.market || !body.targetRole) throw new Error("Resume text, GitHub profile, market data, and target role are required.");
    return NextResponse.json(await buildTwin(body));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Career Twin generation failed", fallback: true, ...mockCareerTwin }, { status: 200 });
  }
}
