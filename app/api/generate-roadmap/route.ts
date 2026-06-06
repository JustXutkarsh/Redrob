import { NextResponse } from "next/server";
import { buildTwin } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const twin = await buildTwin(body);
    return NextResponse.json({ timeline: twin.timeline });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Roadmap generation failed." }, { status: 500 });
  }
}
