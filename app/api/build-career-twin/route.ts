import { NextResponse } from "next/server";
import { buildTwin } from "@/lib/server";
import { generateFallbackCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  let targetRole: string | undefined;
  try {
    const body = await request.json();
    targetRole = body.targetRole;
    if (!body.resumeText || !body.github || !body.market || !body.targetRole) throw new Error("Resume text, GitHub profile, market data, and target role are required.");
    return NextResponse.json(await buildTwin(body));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Career Twin generation failed", fallback: true, ...generateFallbackCareerTwin(targetRole) }, { status: 200 });
  }
}
