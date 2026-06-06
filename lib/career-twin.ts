export type CareerTwin = {
  careerScore: number;
  strengths: string[];
  weaknesses: string[];
  skills: {
    name: string;
    score: number;
    missing: boolean;
    recommendation: string;
  }[];
  recommendedProject: {
    title: string;
    reason: string;
    techStack: string[];
    timeline: string;
    careerGain: string;
    difficulty?: string;
    recruiterAppeal?: string;
    projectScore?: number;
    pitch?: string;
    buildTime?: string;
    prd?: {
      problemStatement: string;
      goal: string;
      targetUsers: string[];
      coreFeatures: string[];
      successMetrics: string[];
    };
    systemDesign?: string[];
    databaseDesign?: string[];
    apiEndpoints?: string[];
    recruiterSignals?: string[];
    recruiterAppealScore?: number;
    buildRoadmap?: { week: string; items: string[] }[];
    githubStrategy?: {
      repositoryName: string;
      readmeHeadline: string;
      architectureImageSuggestions: string[];
      demoGifSuggestions: string[];
      topics: string[];
      readmeSections: string[];
    };
    linkedInPost?: string;
  };
  futurePrediction: {
    salary: string;
    careerScore: number;
    interviewProbability: number;
    marketPosition: string;
  };
  opportunities: {
    title: string;
    company?: string;
    match: number;
    reason: string;
    missingSkills?: {
      name: string;
      reason: string;
      action: string;
      estimatedTime: string;
      careerScoreGain: string;
      matchImprovement: string;
      currentProof?: string;
      targetProof?: string;
    }[];
    location?: string;
    salary?: string;
    postedDate?: string;
    sourcePlatform?: string;
    applyLink?: string;
    deadline: string;
    impact: string;
    recommendedAction?: string;
    prepQuestions?: string[];
    prepPlan?: string[];
    afterProject?: {
      match: number;
      careerScore: number;
      salary: string;
    };
  }[];
  timeline: {
    year: string;
    title: string;
    description: string;
    predicted: boolean;
  }[];
  activityFeed: {
    time: string;
    message: string;
    type: string;
  }[];
  marketData?: unknown[];
  githubData?: unknown;
};

export const mockCareerTwin: CareerTwin = {
  careerScore: 81,
  strengths: ["Python", "FastAPI", "AI Projects"],
  weaknesses: ["Docker", "Kubernetes", "System Design"],
  skills: [
    { name: "Python", score: 88, missing: false, recommendation: "Use Python as the anchor skill in every project explanation." },
    { name: "FastAPI", score: 76, missing: false, recommendation: "Ship one production-style API with auth, queues, and observability." },
    { name: "Machine Learning", score: 72, missing: false, recommendation: "Connect ML work to measurable product outcomes." },
    { name: "Docker", score: 32, missing: true, recommendation: "Containerize the Distributed AI Task Queue and publish deployment notes." },
    { name: "Kubernetes", score: 24, missing: true, recommendation: "Add a small Kubernetes deployment manifest to the portfolio project." },
    { name: "System Design", score: 41, missing: true, recommendation: "Write an architecture teardown for queues, workers, retries, and scaling." }
  ],
  recommendedProject: {
    title: "Distributed AI Task Queue",
    reason: "Current profile shows Python, FastAPI, and AI API strength, but needs production proof for Docker, Redis, distributed systems, and backend architecture.",
    pitch: "A production-ready AI job orchestration platform for managing long-running LLM workflows.",
    techStack: ["FastAPI", "Redis", "PostgreSQL", "Docker", "Celery", "OpenAI", "JWT", "WebSockets"],
    timeline: "21 days",
    careerGain: "+8",
    difficulty: "Medium-Hard",
    recruiterAppeal: "Very High",
    projectScore: 98,
    buildTime: "21 Days",
    prd: {
      problemStatement: "Current AI workflows break when long-running tasks need orchestration, retries, and live monitoring.",
      goal: "Build a scalable AI workflow engine that queues, executes, retries, and observes LLM jobs in production style.",
      targetUsers: ["AI startups", "Internal engineering teams", "Automation agencies"],
      coreFeatures: ["User Authentication", "Create AI Jobs", "Queue Management", "Retry Failed Jobs", "Monitor Agent Status", "Execution Dashboard", "Analytics", "Admin Panel"],
      successMetrics: ["1000 concurrent jobs", "Sub-second dashboard updates", "95% successful execution rate"]
    },
    systemDesign: ["Frontend", "API Gateway", "Job Queue", "Worker Nodes", "Redis", "PostgreSQL", "OpenAI"],
    databaseDesign: ["Users", "Projects", "Jobs", "Executions", "Logs", "Agents"],
    apiEndpoints: ["GET /jobs", "POST /jobs", "DELETE /jobs", "GET /executions", "POST /retry", "GET /analytics"],
    recruiterSignals: ["Distributed Systems", "Containerization", "Real-time Communication", "AI Integration", "Backend Scaling", "Production Thinking"],
    recruiterAppealScore: 95,
    buildRoadmap: [
      { week: "Week 1", items: ["Authentication", "Database", "Backend APIs"] },
      { week: "Week 2", items: ["Redis Queue", "Worker Engine", "Job Scheduler"] },
      { week: "Week 3", items: ["AI Integration", "Dashboard", "Analytics"] },
      { week: "Week 4", items: ["Docker", "Deployment", "Portfolio Polish"] }
    ],
    githubStrategy: {
      repositoryName: "distributed-ai-task-queue",
      readmeHeadline: "Production-grade AI job orchestration with FastAPI, Redis, Docker, and OpenAI.",
      architectureImageSuggestions: ["Queue-to-worker architecture diagram", "Realtime execution dashboard screenshot", "Retry and failure lifecycle flow"],
      demoGifSuggestions: ["Create an AI job and watch worker status update", "Retry a failed workflow", "Dashboard analytics updating live"],
      topics: ["fastapi", "docker", "redis", "openai", "backend", "ai-agents", "portfolio"],
      readmeSections: ["Problem", "Architecture", "Features", "System Design", "API Reference", "Local Setup", "Demo", "Recruiter Notes"]
    },
    linkedInPost: "Built a distributed AI task orchestration platform using FastAPI, Redis, Docker, and OpenAI APIs.\n\nKey learnings:\n- Background workers\n- Queue systems\n- Production AI architecture\n\nWould love feedback from the community."
  },
  futurePrediction: {
    salary: "12-18 LPA",
    careerScore: 92,
    interviewProbability: 81,
    marketPosition: "Top 14%"
  },
  opportunities: [
    {
      title: "Backend AI Engineer",
      company: "AgentStack AI",
      match: 92,
      reason: "Strong FastAPI experience, AI project portfolio, and agent architecture direction make this a high-fit opening.",
      missingSkills: [
        { name: "Docker", reason: "No GitHub repositories demonstrate containerized deployment proof.", action: "Build Docker deployment for the AI Task Queue project.", estimatedTime: "3 Days", careerScoreGain: "+3", matchImprovement: "92% -> 96%", currentProof: "Low", targetProof: "High" },
        { name: "Redis", reason: "Queue systems appear in the target role but are not yet visible in shipped projects.", action: "Implement background queue workers and retry logic.", estimatedTime: "4 Days", careerScoreGain: "+2", matchImprovement: "92% -> 95%", currentProof: "Medium", targetProof: "High" }
      ],
      location: "Bengaluru, India",
      salary: "12-18 LPA",
      postedDate: "Last 3 days",
      sourcePlatform: "LinkedIn Jobs",
      applyLink: "https://linkedin.com/jobs",
      deadline: "10 days",
      impact: "+6 Career Score",
      recommendedAction: "Complete Distributed AI Task Queue project and add deployment evidence before applying.",
      prepQuestions: ["Explain FastAPI dependency injection.", "How would you scale Redis queues?", "Difference between synchronous and asynchronous workers?"],
      prepPlan: ["Publish Dockerized project demo.", "Practice queue and worker system design.", "Prepare a 90-second architecture walkthrough."],
      afterProject: { match: 97, careerScore: 88, salary: "18 LPA" }
    },
    {
      title: "LLM Backend Intern",
      company: "VectorForge Labs",
      match: 88,
      reason: "Good Python and AI API fit with missing production queue evidence.",
      location: "Remote",
      salary: "Stipend 35k-60k",
      postedDate: "Last 7 days",
      sourcePlatform: "Wellfound",
      applyLink: "https://wellfound.com/jobs",
      deadline: "7 days",
      impact: "+5 Career Score",
      recommendedAction: "Show FastAPI plus Redis worker proof.",
      missingSkills: [{ name: "System Design", reason: "The role expects backend scaling decisions.", action: "Write architecture notes for queue retries and worker pools.", estimatedTime: "2 Days", careerScoreGain: "+2", matchImprovement: "88% -> 93%", currentProof: "Medium", targetProof: "High" }],
      prepQuestions: ["How do you design retries for LLM jobs?", "How would you prevent duplicate job execution?"],
      prepPlan: ["Review Redis streams and queues.", "Create a small system design diagram."],
      afterProject: { match: 94, careerScore: 87, salary: "60k stipend" }
    },
    { title: "AI Agents Hackathon", company: "Buildspace AI", match: 84, reason: "Fast path to visible proof and public demo momentum.", location: "Online", salary: "Prize pool", postedDate: "Last 24 hours", sourcePlatform: "Hackathon", applyLink: "https://devpost.com", deadline: "14 days", impact: "+4 Career Score", recommendedAction: "Submit the AI Task Queue as an agent infrastructure project.", prepQuestions: ["What makes your agent system reliable?"], prepPlan: ["Polish demo video.", "Add README architecture section."], afterProject: { match: 91, careerScore: 86, salary: "Portfolio boost" } },
    { title: "Open Source AI Fellowship", company: "OpenInfra AI", match: 79, reason: "Good for collaboration proof and public credibility.", location: "Remote", salary: "Grant based", postedDate: "Last 10 days", sourcePlatform: "Fellowship", applyLink: "https://github.com", deadline: "Rolling", impact: "+4 Career Score", recommendedAction: "Contribute worker orchestration examples.", prepQuestions: ["How do you review unfamiliar backend code?"], prepPlan: ["Open two targeted PRs.", "Document your contribution decisions."], afterProject: { match: 88, careerScore: 85, salary: "Grant based" } }
  ],
  timeline: [
    { year: "2024", title: "Started DSA", description: "Built core problem-solving muscle.", predicted: false },
    { year: "2025", title: "Built AI Projects", description: "Converted learning into visible project proof.", predicted: false },
    { year: "2026", title: "Win Redrob Hackathon", description: "Ship a polished AI Career OS demo.", predicted: false },
    { year: "2027", title: "Backend AI Engineer", description: "Move into production AI platform work.", predicted: true },
    { year: "2028", title: "Senior AI Engineer", description: "Own agentic systems and infra strategy.", predicted: true }
  ],
  activityFeed: []
};
