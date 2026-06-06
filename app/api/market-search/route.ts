import { NextResponse } from "next/server";
import { tavilySearch } from "@/lib/server";
import { mockCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    return NextResponse.json({ results: await tavilySearch(query) });
  } catch {
    return NextResponse.json({ results: mockCareerTwin.opportunities });
  }
}
