import OpenAI from "openai";
import axios from "axios";
import { mockCareerTwin } from "@/lib/career-twin";

export function normalizeGithubUsername(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  const match = trimmed.match(/github\.com\/([^/?#]+)/i);
  const username = (match?.[1] ?? trimmed).replace(/^@/, "");
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    throw new Error("Enter a valid GitHub username or profile URL.");
  }
  return username;
}

export async function fetchGithubProfile(username: string) {
  const normalized = normalizeGithubUsername(username);
  const headers = process.env.GITHUB_TOKEN?.includes("YOUR_")
    ? undefined
    : { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` };
  const [user, repos] = await Promise.all([
    axios.get(`https://api.github.com/users/${encodeURIComponent(normalized)}`, { headers }),
    axios.get(`https://api.github.com/users/${encodeURIComponent(normalized)}/repos?sort=updated&per_page=8`, { headers })
  ]);

  return {
    user: user.data,
    repositories: repos.data.map((repo: any) => ({
      name: repo.name,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      description: repo.description
    }))
  };
}

export async function tavilySearch(query: string) {
  if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY.includes("YOUR_")) {
    throw new Error("Missing Tavily key");
  }
  const response = await axios.post("https://api.tavily.com/search", {
    api_key: process.env.TAVILY_API_KEY,
    query,
    search_depth: "basic",
    max_results: 10
  });
  return response.data.results ?? [];
}

export async function buildTwin(input: Record<string, unknown>) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("YOUR_")) {
    throw new Error("Missing OpenAI API key");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `Analyze this candidate. Recommend one startup-grade portfolio project that maximizes recruiter attention for the target role. Do not recommend CRUD apps, weather apps, to-do apps, blogs, chat apps, or basic clones. Return ONLY valid JSON. Never return markdown. Never return explanations. Only JSON.
Return exactly this shape:
{"careerScore":81,"strengths":["Python","FastAPI","AI Projects"],"weaknesses":["Docker","Kubernetes","System Design"],"skills":[{"name":"Docker","score":32,"missing":true,"recommendation":"Build a deployed containerized AI project."}],"recommendedProject":{"title":"Distributed AI Task Queue","reason":"Why this is the highest ROI project for this exact profile.","pitch":"A production-ready AI job orchestration platform for managing long-running LLM workflows.","techStack":["FastAPI","Redis","PostgreSQL","Docker","Celery","OpenAI","JWT","WebSockets"],"timeline":"21 days","careerGain":"+8","difficulty":"Medium-Hard","recruiterAppeal":"Very High","projectScore":98,"buildTime":"21 Days","prd":{"problemStatement":"Current AI workflows break when long-running tasks need orchestration.","goal":"Build a scalable AI workflow engine.","targetUsers":["AI startups","Internal engineering teams","Automation agencies"],"coreFeatures":["User Authentication","Create AI Jobs","Queue Management","Retry Failed Jobs","Monitor Agent Status","Execution Dashboard","Analytics","Admin Panel"],"successMetrics":["1000 concurrent jobs","Sub-second dashboard updates","95% successful execution rate"]},"systemDesign":["Frontend","API Gateway","Job Queue","Worker Nodes","Redis","PostgreSQL","OpenAI"],"databaseDesign":["Users","Projects","Jobs","Executions","Logs","Agents"],"apiEndpoints":["GET /jobs","POST /jobs","DELETE /jobs","GET /executions","POST /retry","GET /analytics"],"recruiterSignals":["Distributed Systems","Containerization","Real-time Communication","AI Integration","Backend Scaling","Production Thinking"],"recruiterAppealScore":95,"buildRoadmap":[{"week":"Week 1","items":["Authentication","Database","Backend APIs"]}],"githubStrategy":{"repositoryName":"distributed-ai-task-queue","readmeHeadline":"Production-grade AI job orchestration with FastAPI, Redis, Docker, and OpenAI.","architectureImageSuggestions":["Queue-to-worker architecture diagram"],"demoGifSuggestions":["Create an AI job and watch worker status update"],"topics":["fastapi","docker","redis","openai","backend","ai-agents","portfolio"],"readmeSections":["Problem","Architecture","Features","API Reference","Demo"]},"linkedInPost":"Built a distributed AI task orchestration platform using FastAPI, Redis, Docker and OpenAI APIs."},"futurePrediction":{"salary":"12-18 LPA","careerScore":92,"interviewProbability":81,"marketPosition":"Top 14%"},"opportunities":[{"title":"AI Startup Internship","match":92,"reason":"Why this fits","deadline":"14 days","impact":"+6 Career Score"}],"timeline":[{"year":"2027","title":"Backend AI Engineer","description":"Predicted next role.","predicted":true}],"activityFeed":[]}`
      },
      {
        role: "user",
        content: JSON.stringify(input)
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0]?.message?.content || JSON.stringify(mockCareerTwin));
}
