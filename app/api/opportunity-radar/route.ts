import { NextResponse } from "next/server";
import OpenAI from "openai";
import { tavilySearch } from "@/lib/server";
import { generateFallbackCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  let targetRole = "Software Developer";
  try {
    const body = await request.json().catch(() => ({}));
    const careerTwin = body.careerTwin || body.currentTwin || {};
    targetRole = body.targetRole || careerTwin.targetRole || targetRole;
    const queries = [
      `${targetRole} jobs India 2025 hiring site:linkedin.com/jobs`,
      `${targetRole} internships India posted last 10 days site:wellfound.com/jobs`,
      `${targetRole} openings posted last 10 days site:cutshort.io`,
      `${targetRole} internships posted last 10 days site:internshala.com`,
      `Remote ${targetRole} jobs posted last 10 days site:remoteok.com`
    ];
    const results = (await Promise.all(queries.map((query) => tavilySearch(query)))).flat().slice(0, 25);
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("YOUR_")) throw new Error("Missing OpenAI key");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `You are ranking job opportunities for a candidate targeting: ${targetRole}

ONLY include jobs that match "${targetRole}" or closely related titles.
REJECT unrelated roles. If target is Frontend Developer, reject ML Engineer, Data Scientist, Backend Engineer, and DevOps jobs. If target is ML Engineer, reject Frontend-only jobs.

Rank by fit for "${targetRole}" specifically.
Use tavilyResults URLs as direct apply links. Every opportunity applyLink MUST be copied from the matching tavilyResults.url when available. Do not invent fake apply links.
Return ONLY JSON: {"opportunities":[{"title":"${targetRole}","company":"Company","matchScore":92,"reason":"Why this fits ${targetRole}","missingSkills":[{"name":"Role skill","reason":"...","action":"...","estimatedTime":"3 Days","careerScoreGain":"+3","matchImprovement":"92% -> 96%","currentProof":"Low","targetProof":"High"}],"estimatedCareerImpact":"+6 Career Score","recommendedAction":"...","location":"India","salary":"Not disclosed","postedDate":"Last 3 days","sourcePlatform":"LinkedIn Jobs","applyLink":"https://real-job-url-from-tavily-result","deadline":"10 days","prepQuestions":["..."],"prepPlan":["..."],"afterProject":{"match":97,"careerScore":88,"salary":"Improved range"}}]} Never markdown.` },
          { role: "user", content: JSON.stringify({ candidate: careerTwin, targetRole, candidateSkills: careerTwin.skills, tavilyResults: results, currentDate: new Date().toISOString() }) }
        ]
      }, { signal: controller.signal });
      return NextResponse.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Opportunity radar failed", fallback: true, liveMode: "demo", opportunities: generateFallbackCareerTwin(targetRole).opportunities }, { status: 200 });
  }
}
