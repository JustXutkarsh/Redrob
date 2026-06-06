import { NextResponse } from "next/server";
import { tavilySearch } from "@/lib/server";
import { mockCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) throw new Error("Search query is required.");
    return NextResponse.json({ results: await tavilySearch(query) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Market search failed.", fallback: true, results: mockCareerTwin.opportunities }, { status: 200 });
  }
}
