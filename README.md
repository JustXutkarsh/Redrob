# Redrob Career OS

**Your career. Your AI twin.**

Redrob Career OS is an AI-native career strategy platform that transforms a user's current profile into the profile required for their dream job.

It does not behave like a static resume analyzer or a job board. It builds a living `CareerTwin` from resume data, GitHub repositories, target role, market search, and AI analysis, then uses that shared intelligence across every page.

## Product Thesis

Most career tools only answer: "What is on my resume?"

Redrob answers:

- What is my dream role?
- How close am I right now?
- What is stopping me?
- Which skills need proof, not just learning?
- What should I build next?
- Which opportunities will that unlock?
- How does one action change my career trajectory?

## Live Demo Flow

1. Upload a resume PDF.
2. Enter a GitHub username.
3. Choose a target role.
4. Click **Initialize AI Twin**.
5. Redrob runs a multi-agent pipeline.
6. The app generates a shared `CareerTwin`.
7. Every page updates from the same AI state.
8. The user lands in the **Opportunity Unlock Lab**.

## Core Experience

### AI Twin Scan

The entry point for the app.

Inputs:

- Resume PDF
- GitHub username
- Target role
- Optional LinkedIn URL

The scan extracts resume text, fetches GitHub profile data, searches live market trends, sends the combined profile to OpenAI, and returns structured career intelligence.

### Agent Control Center

A command-center view of the orchestration pipeline.

Agents:

- Skill Agent
- Market Agent
- Portfolio Agent
- Project Agent
- Opportunity Agent
- Execution Agent

Each agent has status, progress, current task, latest result, and live execution logs.

### Opportunity Unlock Lab

The main product idea.

**Complete one action. Watch your career evolve.**

This page shows:

- Current target-role match
- Current career score
- Blocking skills
- Missing proof
- Fastest unlock plan
- Learning resources
- Proof-building challenges
- Recommended project
- Before/after opportunity impact
- Alternate career scenarios
- Live opportunity unlocks
- AI Mentor guidance

The important concept: learning alone does not increase the score. Proof does.

### Project Architect

An AI Product Architect that recommends the one project with the highest recruiter ROI.

It generates:

- Project score
- One-line pitch
- Why this project fits the user
- Tech stack
- Product Requirements Document
- System design
- Database design
- API endpoints
- Recruiter signal analysis
- Build roadmap
- GitHub strategy
- LinkedIn launch post

Example project:

**Distributed AI Task Queue**

A production-ready AI job orchestration platform for managing long-running LLM workflows.

### Opportunity Radar

An AI Opportunity Intelligence Engine.

It does more than display jobs. It discovers, ranks, explains, and improves career opportunities.

Features:

- Tavily-powered opportunity search
- OpenAI-powered job ranking
- Moving radar visualization
- Match-distance nodes
- Opportunity details panel
- Missing skill roadmap
- Recommended unlock project
- Interview prep questions
- Preparation plan
- Alternate future impact
- Live opportunity feed

### Career Score

Shows the user's current score and explains why it was calculated.

Breakdown includes:

- Technical skill strength
- Portfolio proof
- Market alignment
- Communication
- Interview readiness
- Network signal

### Skill Map

Interactive skill graph powered by `CareerTwin.skills`.

Each skill includes:

- Current score
- Missing or mastered state
- Recommendation
- Estimated career score gain

### AI Mentor

An OpenAI-powered mentor built into the Opportunity Unlock Lab.

Example prompts:

- What is Docker Compose?
- Help me deploy this project.
- Explain Redis queues.
- How should I structure this repository?

## Architecture

The app is built around one shared AI state:

```ts
type CareerTwin = {
  careerScore: number;
  strengths: string[];
  weaknesses: string[];
  skills: Skill[];
  recommendedProject: RecommendedProject;
  futurePrediction: FuturePrediction;
  opportunities: Opportunity[];
  timeline: TimelineEvent[];
  activityFeed: ActivityEvent[];
  marketData?: unknown[];
  githubData?: unknown;
};
```

All major pages consume this same object. There are no disconnected mock dashboards after scan completion.

## API Routes

| Route | Purpose |
| --- | --- |
| `/api/analyze-resume` | Extracts text from uploaded resume PDF |
| `/api/github-profile` | Fetches GitHub user and repository data |
| `/api/market-search` | Searches current market trends with Tavily |
| `/api/build-career-twin` | Builds the complete CareerTwin with OpenAI |
| `/api/generate-project` | Generates alternative Project Architect outputs |
| `/api/opportunity-radar` | Searches and ranks opportunities |
| `/api/unlock-lab` | Finds learning resources for blocking skills |
| `/api/ai-mentor` | Answers career/project questions with OpenAI |
| `/api/career-score` | Calculates score-oriented analysis |
| `/api/generate-roadmap` | Generates roadmap-style guidance |

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- OpenAI SDK
- Tavily Search API
- GitHub REST API
- Axios
- pdf-parse
- React Hook Form
- Zod
- Lucide React
- shadcn-style local UI primitives

## Design System

The UI uses a bold neo-brutalist SaaS style:

- Soft cream background
- Thick dark borders
- Huge typography
- Cyan and orange accents
- Yellow highlights
- Large rounded panels
- Flat cards
- Minimal shadows
- No glassmorphism
- Agentic, animated command-center feel

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/JustXutkarsh/Redrob.git
cd Redrob
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env.local
```

### 4. Add API keys

Open `.env.local` and add:

```bash
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
TAVILY_API_KEY=YOUR_TAVILY_API_KEY
GITHUB_TOKEN=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
OPENAI_MODEL=gpt-5-mini
DEMO_MODE=false
```

Notes:

- `OPENAI_API_KEY` is used for CareerTwin generation, AI Mentor, project generation, and opportunity ranking.
- `TAVILY_API_KEY` is used for market search, opportunities, and learning resources.
- `GITHUB_TOKEN` is optional. If missing, the app falls back to public GitHub API requests.

### 5. Run locally

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## Demo Mode

Redrob is designed to never break during demos.

If OpenAI, Tavily, GitHub, or PDF parsing fails, the app automatically loads realistic fallback intelligence.

This means judges and users always see a working product experience.

## Project Structure

```txt
app/
  api/
    ai-mentor/
    analyze-resume/
    build-career-twin/
    career-score/
    generate-project/
    generate-roadmap/
    github-profile/
    market-search/
    opportunity-radar/
    unlock-lab/
  globals.css
  layout.tsx
  page.tsx

components/
  ui/

lib/
  app-data.ts
  career-twin.ts
  server.ts
  utils.ts

types/
  pdf-parse.d.ts
```

## Important Files

- `app/page.tsx`: Main app UI, CareerTwin context, pages, scan flow, and orchestration.
- `lib/career-twin.ts`: CareerTwin type and realistic fallback intelligence.
- `lib/server.ts`: GitHub, Tavily, and OpenAI server helpers.
- `app/api/build-career-twin/route.ts`: Main AI generation endpoint.
- `app/api/opportunity-radar/route.ts`: Opportunity search and ranking endpoint.
- `app/api/unlock-lab/route.ts`: Learning resource discovery endpoint.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Start production server
```

## Security Notes

Never commit real API keys.

This repo intentionally ignores:

- `.env.local`
- `.env`
- `.next`
- `node_modules`
- `.DS_Store`

Use `.env.example` as the template for local configuration.

## Hackathon Positioning

Redrob Career OS is built to feel like a funded AI startup product:

- AI-native workflow
- Real orchestration
- Shared state architecture
- Live opportunity intelligence
- Career strategy, not generic chat
- Polished neo-brutalist interface
- Demo-safe fallback mode

## License

This project is for hackathon and portfolio use.
