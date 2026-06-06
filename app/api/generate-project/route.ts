import { NextResponse } from "next/server";
import { buildTwin } from "@/lib/server";
import { mockCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const twin = await buildTwin(body);
    return NextResponse.json({ project: twin.recommendedProject });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Project generation failed", fallback: true, project: mockCareerTwin.recommendedProject }, { status: 200 });
  }
}
