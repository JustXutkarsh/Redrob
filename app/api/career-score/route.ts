import { NextResponse } from "next/server";
import { buildTwin } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const twin = await buildTwin(body);
    return NextResponse.json({ careerScore: twin.careerScore });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Career score calculation failed.", fallback: true }, { status: 200 });
  }
}
