import OpenAI from "openai";
import axios from "axios";
import { generateFallbackCareerTwin } from "@/lib/career-twin";

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Redrob Career OS. TARGET ROLE IS THE PRIMARY DRIVER OF EVERY OUTPUT.

Analyze the candidate ONLY for the selected targetRole in the user JSON.

STRICT RULES:
- First identify the targetRole.
- Judge resume skills, GitHub repositories, LinkedIn URL/context, and market trends against that targetRole.
- Strengths are only strengths if they help the targetRole.
- Weaknesses and missing skills must be skills required for the targetRole, not generic gaps.
- Recommended project MUST be a portfolio project for the targetRole.
- Opportunities MUST match the targetRole or closely related titles.
- If targetRole is Frontend Developer, recommend React/Next.js/UI/performance/testing work, not ML/backend task queues.
- If targetRole is Backend Developer, recommend API/database/system projects.
- If targetRole is ML Engineer, recommend ML/MLOps/model deployment projects.
- If targetRole is DevOps Engineer, recommend CI/CD, Kubernetes, Terraform, cloud, observability projects.
- Do not recommend CRUD apps, weather apps, to-do apps, blogs, chat apps, or basic clones.
- Never let unrelated resume skills override the selected targetRole.
- Include "targetRole" in the returned JSON.

Return ONLY valid JSON. Never return markdown. Never return explanations. Only JSON.
Return exactly this shape:
{"targetRole":"Frontend Developer","careerScore":81,"strengths":["React","JavaScript","UI implementation"],"weaknesses":["TypeScript","Next.js","Testing"],"skills":[{"name":"Next.js","score":32,"missing":true,"recommendation":"Build a deployed target-role-specific project."}],"recommendedProject":{"title":"Role-specific portfolio project","reason":"Why this is the highest ROI project for this targetRole.","pitch":"One-line startup-grade product pitch for this targetRole.","techStack":["Role-specific tools"],"timeline":"21 days","careerGain":"+8","difficulty":"Medium-Hard","recruiterAppeal":"Very High","projectScore":98,"buildTime":"21 Days","prd":{"problemStatement":"Target-role-specific problem.","goal":"Build a target-role-specific proof project.","targetUsers":["Relevant users"],"coreFeatures":["Relevant feature"],"successMetrics":["Relevant metric"]},"systemDesign":["Role-specific architecture blocks"],"databaseDesign":["Relevant entities"],"apiEndpoints":["Relevant endpoints if applicable"],"recruiterSignals":["Target-role-specific signals"],"recruiterAppealScore":95,"buildRoadmap":[{"week":"Week 1","items":["Target-role-specific work"]}],"githubStrategy":{"repositoryName":"target-role-project","readmeHeadline":"Target-role-specific README headline.","architectureImageSuggestions":["Relevant diagram"],"demoGifSuggestions":["Relevant demo"],"topics":["target-role"],"readmeSections":["Problem","Architecture","Features","Demo"]},"linkedInPost":"Target-role-specific project announcement."},"futurePrediction":{"salary":"Role-specific salary range","careerScore":92,"interviewProbability":81,"marketPosition":"Top target-role segment"},"opportunities":[{"title":"Target-role matching job","match":92,"reason":"Why this fits the selected targetRole","deadline":"14 days","impact":"+6 Career Score"}],"timeline":[{"year":"2027","title":"Selected targetRole","description":"Predicted next role for selected targetRole.","predicted":true}],"activityFeed":[]}`
        },
        {
          role: "user",
          content: JSON.stringify(input)
        }
      ],
      response_format: { type: "json_object" }
    }, { signal: controller.signal });

    return JSON.parse(completion.choices[0]?.message?.content || JSON.stringify(generateFallbackCareerTwin(String(input.targetRole || "Software Developer"))));
  } finally {
    clearTimeout(timeout);
  }
}
