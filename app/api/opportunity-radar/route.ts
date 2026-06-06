import { NextResponse } from "next/server";
import OpenAI from "openai";
import { tavilySearch } from "@/lib/server";
import { mockCareerTwin } from "@/lib/career-twin";

const queries = [
  "Backend AI Engineer India jobs posted last 10 days site:linkedin.com/jobs",
  "AI startup internships posted last 10 days site:wellfound.com/jobs",
  "FastAPI Python openings posted last 10 days site:cutshort.io",
  "LLM engineer internships posted last 10 days site:internshala.com",
  "Remote AI backend jobs posted last 10 days site:remoteok.com"
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const results = (await Promise.all(queries.map((query) => tavilySearch(`${query} ${body.targetRole || ""}`)))).flat().slice(0, 25);
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("YOUR_")) throw new Error("Missing OpenAI key");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Rank current opportunities against the candidate. Return ONLY JSON: {\"opportunities\":[{\"title\":\"Backend AI Engineer\",\"company\":\"AgentStack AI\",\"matchScore\":92,\"reason\":\"...\",\"missingSkills\":[{\"name\":\"Docker\",\"reason\":\"...\",\"action\":\"...\",\"estimatedTime\":\"3 Days\",\"careerScoreGain\":\"+3\",\"matchImprovement\":\"92% -> 96%\",\"currentProof\":\"Low\",\"targetProof\":\"High\"}],\"estimatedCareerImpact\":\"+6 Career Score\",\"recommendedAction\":\"...\",\"location\":\"Bengaluru\",\"salary\":\"12-18 LPA\",\"postedDate\":\"Last 3 days\",\"sourcePlatform\":\"LinkedIn Jobs\",\"applyLink\":\"https://...\",\"deadline\":\"10 days\",\"prepQuestions\":[\"...\"],\"prepPlan\":[\"...\"],\"afterProject\":{\"match\":97,\"careerScore\":88,\"salary\":\"18 LPA\"}}]} Never markdown." },
        { role: "user", content: JSON.stringify({ candidate: body.currentTwin, tavilyResults: results, currentDate: new Date().toISOString() }) }
      ]
    });
    return NextResponse.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error) {
    return NextResponse.json({ liveMode: "demo", opportunities: mockCareerTwin.opportunities });
  }
}
