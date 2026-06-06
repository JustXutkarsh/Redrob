import { NextResponse } from "next/server";
import axios from "axios";
import { fetchGithubProfile } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    if (!username) return NextResponse.json({ skipped: true, repositories: [], user: null });
    return NextResponse.json(await fetchGithubProfile(username));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return NextResponse.json({ error: "GitHub profile not found. Use a valid username or GitHub profile URL.", fallback: true }, { status: 200 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub profile fetch failed.", fallback: true }, { status: 200 });
  }
}
