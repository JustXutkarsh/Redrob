import { NextResponse } from "next/server";
import { tavilySearch } from "@/lib/server";
import { generateFallbackCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  let targetRole = "Software Developer";
  try {
    const body = await request.json();
    targetRole = body.targetRole || body.query || targetRole;
    const query = `${targetRole} jobs required skills India 2025 ${targetRole} developer hiring`;
    return NextResponse.json({ results: await tavilySearch(query) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Market search failed.", fallback: true, results: generateFallbackCareerTwin(targetRole).opportunities }, { status: 200 });
  }
}
