import { NextResponse } from "next/server";
import { buildTwin } from "@/lib/server";
import { mockCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.resumeText || !body.github || !body.market || !body.targetRole) {
      return NextResponse.json({ error: "Resume text, GitHub profile, market data, and target role are required." }, { status: 400 });
    }
    return NextResponse.json(await buildTwin(body));
  } catch {
    return NextResponse.json(mockCareerTwin);
  }
}
