import { NextResponse } from "next/server";
import { tavilySearch } from "@/lib/server";

const fallback = [
  { skill: "Docker", title: "Docker Full Course - Nana", duration: "2 Hours 40 Minutes", reason: "Matches production Docker knowledge expected by AI startups.", thumbnail: "https://img.youtube.com/vi/3c-iBn73dDE/hqdefault.jpg", url: "https://www.youtube.com/results?search_query=docker+full+course+nana" },
  { skill: "Redis", title: "Redis Crash Course", duration: "1 Hour 20 Minutes", reason: "Covers queue and caching fundamentals needed for backend AI systems.", thumbnail: "https://img.youtube.com/vi/jgpVdJB2sKQ/hqdefault.jpg", url: "https://www.youtube.com/results?search_query=redis+queue+crash+course" },
  { skill: "Kubernetes", title: "Kubernetes for Developers", duration: "3 Hours", reason: "Adds deployment proof for production infrastructure roles.", thumbnail: "https://img.youtube.com/vi/X48VuDVv0do/hqdefault.jpg", url: "https://www.youtube.com/results?search_query=kubernetes+for+developers" }
];

export async function POST(request: Request) {
  try {
    const { skills = [] } = await request.json().catch(() => ({}));
    const names = (Array.isArray(skills) && skills.length ? skills : ["Docker", "Redis", "Kubernetes"]).slice(0, 4);
    const resources = await Promise.all(names.map(async (skill: string) => {
      const [result] = await tavilySearch(`${skill} full course production backend AI startup Docker Redis Kubernetes`);
      return {
        skill,
        title: result?.title || `${skill} Production Course`,
        duration: skill === "Docker" ? "2 Hours 40 Minutes" : "2-3 Hours",
        reason: `Matches the ${skill} proof expected in current AI startup roles.`,
        thumbnail: fallback.find((item) => item.skill === skill)?.thumbnail || fallback[0].thumbnail,
        url: result?.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} full course backend production`)}`
      };
    }));
    return NextResponse.json({ resources });
  } catch {
    return NextResponse.json({ resources: fallback });
  }
}
