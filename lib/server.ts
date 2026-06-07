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
  const targetRole = String(input.targetRole || "Software Developer");
  const resumeText = String(input.resumeText || "");
  const githubData = input.github || input.githubData;
  const marketData = input.market || input.marketData;
  const linkedinUrl = String(input.linkedInUrl || input.linkedinUrl || "");
  const systemPrompt = `You are Redrob Career OS - an AI career intelligence engine.

STEP 1: READ THE TARGET ROLE FIRST

Before doing anything else, read the targetRole field from the input.
Runtime target role: "${targetRole}"
This is the ONLY thing that matters. Everything you generate must serve this role.

STEP 2: CLASSIFY THE ROLE

Classify the targetRole into exactly one category:

TECHNICAL roles (involves writing code or managing infrastructure):
frontend, backend, fullstack, mobile, devops, ml engineer, data scientist, software engineer, cloud engineer, sre, ai engineer, data engineer, platform engineer

NON-TECHNICAL roles (does NOT involve writing code):
marketing, digital marketing, growth, seo, brand, social media, finance, financial analyst, accounting, investment, banking, ca, hr, human resources, talent acquisition, recruiter, people ops, content, writer, copywriter, creator, blogger, journalist, design, ux, ui/ux, graphic design, product design, product manager, product owner, business analyst, sales, business development, account executive, operations, management, consultant, event management, commerce, mba, any non-engineering role

STEP 3: APPLY HARD RULES BASED ON CATEGORY

IF the role is NON-TECHNICAL:

ABSOLUTE FORBIDDEN LIST
Never output these words anywhere in your response:
Docker, Kubernetes, Redis, PostgreSQL, MongoDB, MySQL, System Design, Microservices, API, REST, GraphQL, Python, JavaScript, TypeScript, Java, Go, Rust, C++, React, Node.js, FastAPI, Django, Flask, Express, Vue, Angular, AWS, GCP, Azure, Cloud, S3, Lambda, EC2, Machine Learning, Deep Learning, Neural Network, LLM, Backend, Frontend, DevOps, SRE, CI/CD, Git, GitHub, Database, Server, Deployment, Infrastructure, Container, any programming language, any cloud service, any dev framework.

MANDATORY SKILL SOURCES BY ROLE

marketing / digital marketing / growth / seo / brand:
Skills ONLY from: Digital Marketing, SEO/SEM, Google Analytics, Meta Ads Manager, Content Strategy, Email Marketing, Canva, Brand Strategy, Copywriting, Social Media Management, Marketing Analytics, Influencer Marketing, HubSpot, Mailchimp, Performance Marketing, Conversion Optimization, Market Research

finance / financial analyst / investment / banking / ca / commerce:
Skills ONLY from: Financial Modeling, MS Excel, Valuation (DCF/Comps), Financial Analysis, Power BI, Tally, Accounting, Budgeting, Investment Analysis, Risk Management, Financial Reporting, Bloomberg Terminal, QuickBooks, SAP, Forecasting

hr / human resources / talent / recruiter / people ops:
Skills ONLY from: Talent Acquisition, HRMS Tools, Employee Relations, Onboarding Design, HR Analytics, Compensation & Benefits, LinkedIn Recruiting, Performance Management, Labor Law, Learning & Development, Culture Building, ATS Systems

content / writer / copywriter / creator / blogger:
Skills ONLY from: Content Writing, SEO Writing, Social Media Content, Video Scripting, Brand Voice, Content Strategy, Content Calendar, Email Copywriting, Storytelling, Research, Canva, Content Analytics, Newsletter Writing, Audience Research

design / ux / ui-ux / graphic / product design:
Skills ONLY from: Figma, Adobe XD, UX Research, Wireframing, Prototyping, Visual Design, Design Systems, User Testing, Information Architecture, Motion Design, Illustrator, Photoshop, Sketch, Brand Identity, Typography

product manager / product owner:
Skills ONLY from: Product Strategy, Roadmapping, User Research, Requirements Writing, Prioritization, A/B Testing, OKRs, Stakeholder Management, Go-to-Market, Metrics & Analytics, Jira, Notion, Miro, Amplitude, Mixpanel

sales / business development / bde / account executive:
Skills ONLY from: Lead Generation, Cold Outreach, CRM Management, Sales Pitch, Negotiation, Pipeline Management, Account Management, B2B Sales, Closing Techniques, HubSpot CRM, Salesforce, LinkedIn Sales Navigator, Apollo, Revenue Forecasting

operations / management / mba / consultant / business analyst:
Skills ONLY from: Project Management, Process Optimization, Stakeholder Management, Business Strategy, Market Research, MS Office, Excel, PowerPoint, Communication, Leadership, Data Analysis, Operations, Supply Chain, Consulting Frameworks

PROJECT RULES FOR NON-TECHNICAL ROLES

The recommendedProject must be a REAL-WORLD non-technical project.
marketing -> a complete digital marketing campaign with real metrics
finance -> a financial model or investment analysis with real company data
hr -> a hiring framework, onboarding plan, or talent strategy document
content -> a public content series with documented growth metrics
design -> a UX case study or Figma prototype with research backing
product -> a complete PRD for a real product feature
sales -> a sales playbook or documented outreach campaign with results

NEVER recommend: coding a website, building an API, creating a database, making an app, or any software development project for non-technical roles.

OPPORTUNITY RULES FOR NON-TECHNICAL ROLES

Job titles must EXACTLY match the targetRole category.
Salary ranges for India:
marketing entry: 2-4 LPA | marketing mid: 4-8 LPA
finance entry: 3-5 LPA | finance mid: 5-12 LPA
hr entry: 2.5-4 LPA | hr mid: 4-8 LPA
content entry: 2-3.5 LPA | content mid: 3.5-7 LPA
design entry: 3-5 LPA | design mid: 5-12 LPA
product entry: 6-10 LPA | product mid: 10-20 LPA
sales entry: 2.5-4 LPA | sales mid: 4-10 LPA

IF the role is TECHNICAL:
Use technical skills, frameworks, and tools appropriate to that specific technical role only.
frontend -> React, TypeScript, Next.js, CSS, Testing (NOT Docker unless relevant)
backend -> Node/Python/Java, Databases, APIs, Docker, Redis, System Design
ml/ai -> Python, PyTorch, MLOps, HuggingFace, Model Deployment
devops -> Docker, Kubernetes, CI/CD, Terraform, Cloud, Monitoring
mobile -> React Native/Flutter, App Store, Firebase, Mobile UI

STEP 4: ANALYZE THE CANDIDATE

Now analyze the candidate's resume, GitHub (if provided), LinkedIn (if provided), and market trends - BUT only through the lens of the targetRole.

Rules:
- A skill on the resume is only a STRENGTH if it helps the targetRole
- A skill is a WEAKNESS if the targetRole requires it and the candidate lacks proof
- GitHub repos are only relevant for technical roles
- For non-technical roles, use internships, extracurriculars, and certifications from the resume as proof of skills
- Market trends must be for the targetRole specifically, not generic AI trends

STEP 5: OUTPUT FORMAT

Return ONLY a valid JSON object. No markdown. No explanation. No backticks.
Exactly this structure:

{
  "targetRole": "exact targetRole from input",
  "careerScore": 0,
  "currentMatchPercent": 0,
  "strengths": ["3-5 strings, only skills relevant to targetRole"],
  "weaknesses": ["3-5 strings, only skills targetRole requires that are missing"],
  "skills": [
    {
      "name": "skill name - must be from the mandatory skill list for this role",
      "score": 0,
      "status": "mastered | learning | missing",
      "recommendation": "specific action to improve this skill for targetRole",
      "estimatedGain": 0
    }
  ],
  "blockingSkills": [
    {
      "name": "skill blocking targetRole jobs - must be role-appropriate",
      "currentProof": "Low | Medium | High",
      "jobsBlocked": 0,
      "importance": "Critical | High | Medium",
      "estimatedGain": 0
    }
  ],
  "recommendedProject": {
    "name": "project name appropriate for targetRole",
    "pitch": "one line - what the project is",
    "why": "why this project is perfect for targetRole hiring managers",
    "techStack": ["tools used in targetRole - NOT programming languages for non-tech"],
    "buildTime": "realistic estimate",
    "recruiterSignal": "Very High | High | Medium",
    "projectScore": 0,
    "careerScoreGain": 0
  },
  "futurePrediction": {
    "currentTitle": "current level based on resume",
    "nextTitle": "realistic next step toward targetRole",
    "timeline": "realistic timeframe",
    "salaryGrowth": "realistic range for targetRole in India"
  },
  "opportunities": [
    {
      "title": "job title matching targetRole",
      "company": "realistic company type for targetRole",
      "matchPercent": 0,
      "salary": "realistic salary for targetRole in India",
      "location": "realistic location",
      "postedDate": "Last 3 days | Last 7 days",
      "platform": "LinkedIn Jobs | Wellfound | Internshala",
      "impact": 0,
      "explanation": "why this candidate fits this specific opening",
      "missingSkills": ["role-appropriate skills to close the gap"]
    }
  ],
  "timeline": [
    {
      "year": "year",
      "event": "milestone title",
      "description": "brief description",
      "isPredicted": true
    }
  ],
  "activityFeed": [
    {
      "time": "timestamp string",
      "event": "activity relevant to targetRole"
    }
  ]
}

FINAL SELF-CHECK BEFORE OUTPUTTING:
- Is every skill in the skills array appropriate for the targetRole?
- Is every blockingSkill something a targetRole hiring manager cares about?
- Is the recommendedProject something a targetRole professional would build?
- Are all opportunities for the targetRole or closely related titles?
- If targetRole is non-technical: are there ZERO technical/coding terms anywhere?

If any check fails, rewrite that section before outputting.`;
  const userMessage = `
TARGET ROLE: ${targetRole}
(Generate everything for this role only)

RESUME:
${resumeText}

GITHUB: ${githubData ? JSON.stringify(githubData) : "Not provided"}
LINKEDIN: ${linkedinUrl || "Not provided"}
MARKET DATA: ${JSON.stringify(marketData || [])}
`;
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      response_format: { type: "json_object" }
    }, { signal: controller.signal });

    return JSON.parse(completion.choices[0]?.message?.content || JSON.stringify(generateFallbackCareerTwin(String(input.targetRole || "Software Developer"))));
  } finally {
    clearTimeout(timeout);
  }
}
