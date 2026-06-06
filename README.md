# Redrob Career OS

**Your career. Your AI twin.**

Redrob Career OS is an AI-native career strategy product that turns a user's current profile into the profile required for their dream role. It reads a resume, GitHub profile, target role, live market signals, and opportunity data, then builds a shared `CareerTwin` state that powers the whole experience.

## Core Idea

Redrob continuously answers:

- What is my dream role?
- How close am I?
- What is stopping me?
- What should I learn?
- What should I build?
- What opportunities will that unlock?

## Key Features

- **AI Twin Scan**: Upload resume, GitHub username, and target role to initialize the CareerTwin.
- **Agent Control Center**: Six-agent orchestration pipeline with live execution logs.
- **Opportunity Unlock Lab**: Closed-loop career optimizer showing blockers, learning resources, proof challenges, unlocked roles, and impact simulation.
- **Project Architect**: AI-generated startup-grade portfolio project with PRD, system design, database schema, APIs, GitHub strategy, and LinkedIn post.
- **Opportunity Radar**: AI Opportunity Intelligence Engine that discovers, ranks, explains, and improves career opportunities.
- **Career Score + Skill Map**: Dynamic score and skill gap visualization from shared CareerTwin state.
- **AI Mentor**: OpenAI-powered mentor for project, deployment, and skill guidance.

## Tech Stack

- Next.js 15
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

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Environment Variables

Create `.env.local`:

```bash
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
TAVILY_API_KEY=YOUR_TAVILY_API_KEY
GITHUB_TOKEN=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
OPENAI_MODEL=gpt-5-mini
DEMO_MODE=false
```

`GITHUB_TOKEN` is optional. If it is missing, the app uses public GitHub API requests.

## Demo / Continuity Mode

The app is designed for live demos. If OpenAI, Tavily, GitHub, or PDF parsing fails, Redrob falls back to realistic mock intelligence instead of crashing.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Product Flow

1. Upload resume PDF.
2. Enter GitHub username.
3. Select target role.
4. Initialize AI Twin.
5. CareerTwin is generated.
6. Opportunity Unlock Lab shows exactly what to learn, build, and unlock next.

## Notes

This repository intentionally does not include `.env.local`, `.next`, or `node_modules`.
