import { NextResponse } from "next/server";
import { tavilySearch } from "@/lib/server";
import { generateFallbackCareerTwin } from "@/lib/career-twin";

const fallback = [
  { skill: "Docker", title: "Docker Full Course - Nana", duration: "2 Hours 40 Minutes", reason: "Matches production Docker knowledge expected by AI startups.", thumbnail: "https://img.youtube.com/vi/3c-iBn73dDE/hqdefault.jpg", url: "https://www.youtube.com/results?search_query=docker+full+course+nana" },
  { skill: "Redis", title: "Redis Crash Course", duration: "1 Hour 20 Minutes", reason: "Covers queue and caching fundamentals needed for backend AI systems.", thumbnail: "https://img.youtube.com/vi/jgpVdJB2sKQ/hqdefault.jpg", url: "https://www.youtube.com/results?search_query=redis+queue+crash+course" },
  { skill: "Kubernetes", title: "Kubernetes for Developers", duration: "3 Hours", reason: "Adds deployment proof for production infrastructure roles.", thumbnail: "https://img.youtube.com/vi/X48VuDVv0do/hqdefault.jpg", url: "https://www.youtube.com/results?search_query=kubernetes+for+developers" }
];

export async function POST(request: Request) {
  let targetRole = "Software Developer";
  try {
    const body = await request.json().catch(() => ({}));
    targetRole = body.targetRole || targetRole;
    const roleFallback = generateFallbackCareerTwin(targetRole);
    const { skills = [] } = body;
    const names = (Array.isArray(skills) && skills.length ? skills : roleFallback.weaknesses).slice(0, 4);
    const resources = await Promise.all(names.map(async (skill: string) => {
      const [result] = await tavilySearch(`${skill} full course for ${targetRole} portfolio production`);
      return {
        skill,
        title: result?.title || `${skill} Production Course`,
        duration: "2-3 Hours",
        reason: `Matches the ${skill} proof expected for ${targetRole} roles.`,
        thumbnail: fallback.find((item) => item.skill === skill)?.thumbnail || fallback[0].thumbnail,
        url: result?.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} full course ${targetRole}`)}`
      };
    }));
    return NextResponse.json({ resources });
  } catch (error) {
    const roleFallback = generateFallbackCareerTwin(targetRole);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unlock lab resource search failed", fallback: true, resources: roleFallback.weaknesses.slice(0, 3).map((skill) => ({ skill, title: `${skill} for ${targetRole}`, duration: "2-3 Hours", reason: `Role-specific resource for ${targetRole}.`, thumbnail: fallback[0].thumbnail, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} ${targetRole}`)}` })) }, { status: 200 });
  }
}
