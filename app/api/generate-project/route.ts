import { NextResponse } from "next/server";
import { buildTwin } from "@/lib/server";
import { mockCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const twin = await buildTwin(body);
    return NextResponse.json({ project: twin.recommendedProject });
  } catch {
    return NextResponse.json({ project: mockCareerTwin.recommendedProject });
  }
}
