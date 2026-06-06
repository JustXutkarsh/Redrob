import { NextResponse } from "next/server";
import OpenAI from "openai";
import { generateFallbackCareerTwin } from "@/lib/career-twin";

export async function POST(request: Request) {
  let targetRole = "Software Developer";
  try {
    const body = await request.json();
    const careerTwin = body.careerTwin || body.currentTwin;
    targetRole = body.targetRole || careerTwin?.targetRole || targetRole;
    if (!careerTwin) throw new Error("CareerTwin is required.");
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("YOUR_")) throw new Error("Missing OpenAI key");

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `Generate the single best startup-grade portfolio project for someone targeting: ${targetRole}

RULES:
- The project MUST be a ${targetRole} project.
- If target is "Frontend Developer": recommend a React/Next.js/UI project.
- If target is "Backend Developer": recommend an API/database/system project.
- If target is "ML Engineer": recommend an ML/data pipeline/MLOps project.
- If target is "Full Stack Developer": recommend a full stack project.
- If target is "DevOps Engineer": recommend CI/CD, cloud, Kubernetes, Terraform, or observability work.
- Do NOT recommend projects outside the scope of ${targetRole}.
- Do NOT recommend generic CRUD apps, weather apps, to-do apps, blogs, chat apps, or basic clones.

The project should use the candidate's strengths, fill gaps required by ${targetRole}, impress recruiters hiring for ${targetRole}, and be buildable in 2-4 weeks.

Return ONLY JSON: {"project":{"title":"...","reason":"...","pitch":"...","techStack":["..."],"timeline":"21 days","careerGain":"+8","difficulty":"...","recruiterAppeal":"Very High","projectScore":98,"buildTime":"21 Days","prd":{"problemStatement":"...","goal":"...","targetUsers":["..."],"coreFeatures":["..."],"successMetrics":["..."]},"systemDesign":["..."],"databaseDesign":["..."],"apiEndpoints":["..."],"recruiterSignals":["..."],"recruiterAppealScore":95,"buildRoadmap":[{"week":"Week 1","items":["..."]}],"githubStrategy":{"repositoryName":"...","readmeHeadline":"...","architectureImageSuggestions":["..."],"demoGifSuggestions":["..."],"topics":["..."],"readmeSections":["..."]},"linkedInPost":"..."}}` },
          { role: "user", content: JSON.stringify({ mode: body.mode, targetRole, careerTwin, githubData: careerTwin.githubData, marketData: careerTwin.marketData }) }
        ]
      }, { signal: controller.signal });
      return NextResponse.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Project generation failed", fallback: true, project: generateFallbackCareerTwin(targetRole).recommendedProject }, { status: 200 });
  }
}
