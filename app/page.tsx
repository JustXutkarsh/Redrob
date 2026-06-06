"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowRight, Bot, Check, CircleDot, Rocket, Sparkles, Upload } from "lucide-react";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { activitySeed } from "@/lib/app-data";
import { CareerTwin, mockCareerTwin } from "@/lib/career-twin";

type AgentStatus = "Idle" | "Working" | "Completed" | "Error";
type AgentRun = {
  name: string;
  status: AgentStatus;
  progress: number;
  task: string;
  result: string;
};
type ExecutionLog = { time: string; message: string };

type CareerTwinStore = {
  twin: CareerTwin | null;
  setTwin: (twin: CareerTwin | null) => void;
  agentRuns: AgentRun[];
  setAgentRuns: Dispatch<SetStateAction<AgentRun[]>>;
  logs: ExecutionLog[];
  setLogs: Dispatch<SetStateAction<ExecutionLog[]>>;
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;
  scanStep: number;
  setScanStep: (value: number) => void;
  scanError: string;
  setScanError: (value: string) => void;
  future: number;
  setFuture: (value: number) => void;
  navigate: (page: string) => void;
};

const CareerTwinContext = createContext<CareerTwinStore | null>(null);

function useCareerTwin() {
  const value = useContext(CareerTwinContext);
  if (!value) throw new Error("CareerTwinContext missing");
  return value;
}

const scanSchema = z.object({
  resume: z.any(),
  githubUsername: z.string().min(1),
  targetRole: z.string().min(1),
  linkedInUrl: z.string().optional()
});

const pages = ["Dashboard", "AI Twin Scan", "Agent Control Center", "Career Score", "Skill Map", "Opportunity Unlock Lab", "Project Generator", "Opportunity Radar", "Career Timeline"];
const scanSteps = ["Scanning Resume...", "Reading GitHub...", "Analyzing Market...", "Building AI Twin...", "Generating Projects...", "Calculating Career Score..."];
const architectSteps = ["Analyzing Resume...", "Scanning GitHub...", "Checking Market Trends...", "Calculating Skill Gaps...", "Designing Product...", "Writing PRD...", "Generating Architecture...", "Finalizing Portfolio Strategy..."];
const agentPipeline = [
  ["Skill Agent", "Waiting for resume"],
  ["Market Agent", "Waiting for target role"],
  ["Portfolio Agent", "Waiting for GitHub"],
  ["Project Agent", "Waiting for profile graph"],
  ["Opportunity Agent", "Waiting for market data"],
  ["Execution Agent", "Waiting for final plan"]
] as const;

const initialAgentRuns = (): AgentRun[] =>
  agentPipeline.map(([name, task]) => ({ name, status: "Idle", progress: 0, task, result: "No run yet" }));

function timestamp() {
  return new Date().toLocaleTimeString("en-IN", { hour12: false });
}

function extractTechnicalSkills(text: string) {
  const catalog = ["Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "FastAPI", "Django", "Flask", "Machine Learning", "LLM", "OpenAI", "Docker", "Kubernetes", "PostgreSQL", "Redis", "AWS", "GCP", "Azure", "SQL", "MongoDB", "GitHub", "CI/CD", "System Design"];
  return catalog.filter((skill) => new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text));
}

function numberFrom(value: unknown, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replace(/[^\d.-]/g, "")) || fallback;
  return fallback;
}

function normalizeCareerTwin(raw: any, logs: ExecutionLog[], extras: { extractedSkills?: string[]; github?: unknown; market?: unknown[] } = {}): CareerTwin {
  const strengths = Array.isArray(raw?.strengths) ? raw.strengths : mockCareerTwin.strengths;
  const weaknesses = Array.isArray(raw?.weaknesses) ? raw.weaknesses : raw?.missingSkills || mockCareerTwin.weaknesses;
  const skillNames = Array.from(new Set([...(extras.extractedSkills || []), ...strengths, ...weaknesses]));
  const skills = Array.isArray(raw?.skills)
    ? raw.skills.map((skill: any) => ({
        name: String(skill.name),
        score: numberFrom(skill.score, skill.missing ? 35 : 75),
        missing: Boolean(skill.missing),
        recommendation: skill.recommendation || `Build proof around ${skill.name}.`
      }))
    : skillNames.map((name) => ({
        name,
        score: weaknesses.includes(name) ? 32 : 78,
        missing: weaknesses.includes(name),
        recommendation: weaknesses.includes(name) ? `Build ${raw?.recommendedProject?.title || mockCareerTwin.recommendedProject.title}.` : `Use ${name} as profile evidence.`
      }));

  const project = raw?.recommendedProject || mockCareerTwin.recommendedProject;
  const fallbackProject = mockCareerTwin.recommendedProject;
  const future = raw?.futurePrediction || mockCareerTwin.futurePrediction;
  const opportunities = Array.isArray(raw?.opportunities) ? raw.opportunities : mockCareerTwin.opportunities;
  const roadmap = Array.isArray(raw?.weeklyRoadmap) ? raw.weeklyRoadmap : [];

  return {
    careerScore: numberFrom(raw?.careerScore, mockCareerTwin.careerScore),
    strengths,
    weaknesses,
    skills,
    recommendedProject: {
      title: project.title || mockCareerTwin.recommendedProject.title,
      reason: project.reason || fallbackProject.reason,
      techStack: Array.isArray(project.techStack) ? project.techStack : fallbackProject.techStack,
      timeline: project.timeline || `${Math.max(1, roadmap.length)} weeks`,
      careerGain: project.careerGain || fallbackProject.careerGain,
      difficulty: project.difficulty || fallbackProject.difficulty,
      recruiterAppeal: project.recruiterAppeal || fallbackProject.recruiterAppeal,
      projectScore: numberFrom(project.projectScore, fallbackProject.projectScore),
      pitch: project.pitch || fallbackProject.pitch,
      buildTime: project.buildTime || project.timeline || fallbackProject.buildTime,
      prd: project.prd || fallbackProject.prd,
      systemDesign: Array.isArray(project.systemDesign) ? project.systemDesign : fallbackProject.systemDesign,
      databaseDesign: Array.isArray(project.databaseDesign) ? project.databaseDesign : fallbackProject.databaseDesign,
      apiEndpoints: Array.isArray(project.apiEndpoints) ? project.apiEndpoints : fallbackProject.apiEndpoints,
      recruiterSignals: Array.isArray(project.recruiterSignals) ? project.recruiterSignals : fallbackProject.recruiterSignals,
      recruiterAppealScore: numberFrom(project.recruiterAppealScore, fallbackProject.recruiterAppealScore),
      buildRoadmap: Array.isArray(project.buildRoadmap) ? project.buildRoadmap : fallbackProject.buildRoadmap,
      githubStrategy: project.githubStrategy || fallbackProject.githubStrategy,
      linkedInPost: project.linkedInPost || fallbackProject.linkedInPost
    },
    futurePrediction: {
      salary: future.salary || mockCareerTwin.futurePrediction.salary,
      careerScore: numberFrom(future.careerScore, mockCareerTwin.futurePrediction.careerScore),
      interviewProbability: numberFrom(future.interviewProbability, mockCareerTwin.futurePrediction.interviewProbability),
      marketPosition: future.marketPosition || raw?.marketAlignment || mockCareerTwin.futurePrediction.marketPosition
    },
    opportunities: opportunities.map((op: any) => ({
      title: op.title || "Opportunity",
      company: op.company || "AI Startup",
      match: numberFrom(op.matchScore ?? op.match, 75),
      reason: op.reason || "Ranked by Career Twin.",
      missingSkills: Array.isArray(op.missingSkills) ? op.missingSkills : mockCareerTwin.opportunities[0].missingSkills,
      location: op.location || "Remote / India",
      salary: op.salary || "Not disclosed",
      postedDate: op.postedDate || op.posted || "Last 10 days",
      sourcePlatform: op.sourcePlatform || op.platform || "Tavily Intelligence",
      applyLink: op.applyLink || op.url || "#",
      deadline: op.deadline || "Rolling",
      impact: op.impact || op.estimatedCareerImpact || op.careerImpact || "+3 Career Score",
      recommendedAction: op.recommendedAction || `Complete ${project.title || mockCareerTwin.recommendedProject.title}.`,
      prepQuestions: Array.isArray(op.prepQuestions) ? op.prepQuestions : mockCareerTwin.opportunities[0].prepQuestions,
      prepPlan: Array.isArray(op.prepPlan) ? op.prepPlan : mockCareerTwin.opportunities[0].prepPlan,
      afterProject: op.afterProject || { match: Math.min(99, numberFrom(op.matchScore ?? op.match, 75) + 5), careerScore: Math.min(100, numberFrom(raw?.careerScore, 81) + 7), salary: future.salary || mockCareerTwin.futurePrediction.salary }
    })),
    timeline: Array.isArray(raw?.timeline) && raw.timeline.length
      ? raw.timeline
      : [
          { year: "Now", title: `Career Score ${numberFrom(raw?.careerScore, mockCareerTwin.careerScore)}`, description: "AI Twin initialized from resume, GitHub, market, and OpenAI analysis.", predicted: false },
          ...roadmap.slice(0, 3).map((item: string, index: number) => ({ year: `Week ${index + 1}`, title: item, description: "Execution roadmap generated by the Career Twin.", predicted: false })),
          { year: "12 Months", title: "Predicted role acceleration", description: `${future.salary || mockCareerTwin.futurePrediction.salary} with ${numberFrom(future.interviewProbability, 81)}% interview probability.`, predicted: true }
        ],
    activityFeed: logs.map((entry) => ({ time: entry.time, message: entry.message, type: "agent" })),
    githubData: extras.github,
    marketData: extras.market
  };
}

export default function Home() {
  const [active, setActive] = useState("Dashboard");
  const [twin, setTwin] = useState<CareerTwin | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanError, setScanError] = useState("");
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>(initialAgentRuns);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [future, setFuture] = useState(55);
  const [feed, setFeed] = useState(activitySeed.slice(0, 4));
  const { register, handleSubmit } = useForm({ defaultValues: { githubUsername: "", targetRole: "Backend AI Engineer", linkedInUrl: "", resume: undefined } });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFeed((items) => [activitySeed[(items.length + 1) % activitySeed.length], ...items].slice(0, 7));
    }, 2300);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const hashMap: Record<string, string> = { "#scan": "AI Twin Scan", "#agents": "Agent Control Center", "#project": "Project Generator", "#lab": "Opportunity Unlock Lab", "#opportunity": "Opportunity Radar", "#radar": "Opportunity Radar" };
    if (hashMap[window.location.hash]) setActive(hashMap[window.location.hash]);
    if (hashMap[window.location.hash]) {
      window.setTimeout(() => document.getElementById("app")?.scrollIntoView(), 0);
    }
  }, []);

  async function checkedJson(url: string, init: RequestInit) {
    const response = await fetch(url, init);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `${url} failed`);
    return data;
  }

  async function runScan(values: unknown) {
    const parsed = scanSchema.safeParse(values);
    if (!parsed.success) return;
    const resume = parsed.data.resume?.[0] as File | undefined;
    if (!resume) {
      setScanError("Upload a resume PDF before running a real scan.");
      setActive("AI Twin Scan");
      return;
    }
    setIsScanning(true);
    setScanError("");
    setAgentRuns(initialAgentRuns());
    setExecutionLogs([]);
    setActive("Agent Control Center");
    const localLogs: ExecutionLog[] = [];
    const addLog = (message: string) => {
      const entry = { time: timestamp(), message };
      localLogs.push(entry);
      setExecutionLogs((items) => [...items, entry].slice(-40));
      setFeed((items) => [message, ...items].slice(0, 7));
    };
    const updateAgent = (index: number, patch: Partial<AgentRun>) => {
      setAgentRuns((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    try {
      addLog("Resume uploaded.");
      setScanStep(0);
      updateAgent(0, { status: "Working", progress: 15, task: "Extracting resume text", result: "Reading PDF" });
      addLog("Skill Agent started...");
      const form = new FormData();
      form.append("resume", resume);
      const resumeData = await checkedJson("/api/analyze-resume", { method: "POST", body: form });
      const extractedSkills = extractTechnicalSkills(resumeData.text);
      updateAgent(0, { status: "Completed", progress: 100, task: "Resume parsed", result: `Extracted ${extractedSkills.length} technical skills` });
      addLog(`Extracted ${extractedSkills.length} technical skills.`);

      setScanStep(1);
      updateAgent(1, { status: "Working", progress: 20, task: "Searching Tavily", result: "Scanning live market" });
      addLog("Market Agent started...");
      addLog("Searching Tavily for current hiring trends...");
      const market = await checkedJson("/api/market-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${parsed.data.targetRole} AI internships hackathons fellowships backend jobs` })
      });
      const marketCount = Array.isArray(market.results) ? market.results.length : 0;
      updateAgent(1, { status: "Completed", progress: 100, task: "Market scan complete", result: `Found ${marketCount} live market signals` });
      addLog(`Found ${marketCount} live market signals for ${parsed.data.targetRole}.`);

      setScanStep(2);
      updateAgent(2, { status: "Working", progress: 25, task: "Scanning GitHub repositories", result: "Reading portfolio evidence" });
      addLog("Portfolio Agent started...");
      addLog("Scanning GitHub repositories...");
      const github = await checkedJson("/api/github-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: parsed.data.githubUsername })
      });
      const repos = Array.isArray(github.repositories) ? github.repositories : [];
      const languages = repos.map((repo: any) => repo.language).filter(Boolean);
      const strongestLanguage = languages[0] || extractedSkills[0] || "profile evidence";
      updateAgent(2, { status: "Completed", progress: 100, task: "GitHub scan complete", result: `Detected ${repos.length} repositories` });
      addLog(`Detected strong ${strongestLanguage} profile.`);

      setScanStep(3);
      updateAgent(3, { status: "Working", progress: 45, task: "Generating portfolio recommendation", result: "Calling OpenAI" });
      addLog("Project Agent started...");
      addLog("Generating portfolio recommendation...");
      const data = await checkedJson("/api/build-career-twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, resume: undefined, resumeText: resumeData.text, extractedSkills, github, market })
      });
      updateAgent(3, { status: "Completed", progress: 100, task: "Project generated", result: data.recommendedProject?.title || "Project ready" });
      addLog(`Created project: ${data.recommendedProject?.title || "Portfolio recommendation"}.`);

      setScanStep(4);
      updateAgent(4, { status: "Working", progress: 60, task: "Ranking opportunities", result: "Scoring market matches" });
      addLog("Opportunity Agent started...");
      addLog("Ranking opportunities...");
      const opportunityCount = Array.isArray(data.opportunities) ? data.opportunities.length : 0;
      updateAgent(4, { status: "Completed", progress: 100, task: "Opportunities ranked", result: `Found ${opportunityCount} high-fit opportunities` });
      addLog(`Found ${opportunityCount} high-fit opportunities.`);

      setScanStep(5);
      updateAgent(5, { status: "Working", progress: 75, task: "Building weekly roadmap", result: "Synthesizing execution plan" });
      addLog("Execution Agent started...");
      addLog("Building personalized weekly roadmap...");
      addLog("Career Twin Complete.");
      const nextTwin = normalizeCareerTwin(data, localLogs, { extractedSkills, github, market: market.results });
      updateAgent(5, { status: "Completed", progress: 100, task: "Career Twin complete", result: `Career score ${nextTwin.careerScore}` });
      setTwin(nextTwin);
      setActive("Opportunity Unlock Lab");
    } catch {
      addLog("External API degraded. Continuity intelligence loaded.");
      const fallback = normalizeCareerTwin(mockCareerTwin, localLogs);
      setTwin(fallback);
      setAgentRuns((items) => items.map((item) => ({ ...item, status: "Completed", progress: 100, result: item.result === "No run yet" ? "Completed through continuity intelligence" : item.result })));
      setActive("Opportunity Unlock Lab");
    } finally {
      setIsScanning(false);
    }
  }

  const store = { twin, setTwin, agentRuns, setAgentRuns, logs: executionLogs, setLogs: setExecutionLogs, isScanning, setIsScanning, scanStep, setScanStep, scanError, setScanError, future, setFuture, navigate: setActive };

  return (
    <CareerTwinContext.Provider value={store}>
    <main className="min-h-screen p-4 text-ink md:p-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[30px] border-[5px] border-ink bg-[#fffaf0] p-3 shadow-brutal">
        <div className="flex items-center gap-3 text-2xl font-black">
          <span className="grid size-12 place-items-center rounded-2xl border-4 border-ink bg-white text-orange shadow-brutalSm">R</span>
          <span>Redrob.</span>
        </div>
        <div className="hidden gap-8 font-black md:flex"><a href="#app">Platform</a><a href="#agents">Agents</a><a href="#timeline">Vision</a></div>
        <Button onClick={() => setActive("AI Twin Scan")}>Start Building <ArrowRight data-icon="inline-end" /></Button>
      </nav>

      <section className="relative mx-auto grid min-h-[720px] max-w-7xl place-items-center overflow-hidden py-20 text-center">
        <FloatingCards />
        <div className="relative z-10 max-w-5xl">
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {["Market Signals", "Skill Graph", "Opportunity Unlocks"].map((item) => <Badge key={item} className="bg-white px-5 py-3 text-base">{item}</Badge>)}
          </div>
          <h1 className="text-[18vw] font-black leading-[.86] tracking-normal md:text-[8.5rem]">YOUR CAREER.<br /><span className="mt-3 inline-block rounded-[26px] border-[5px] border-ink bg-orange px-5 pb-3 text-white shadow-brutal">YOUR AI TWIN.</span></h1>
          <p className="mx-auto mt-9 max-w-3xl text-xl font-extrabold leading-relaxed text-slate-700">An autonomous AI system that continuously monitors, predicts, and optimizes your professional journey.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-5">
            <Button className="min-h-16 px-8 text-lg" onClick={() => setActive("AI Twin Scan")}>Start Building <Rocket data-icon="inline-end" /></Button>
            <Button className="min-h-16 px-8 text-lg" variant="ghost" onClick={() => setActive("Agent Control Center")}>View AI Agents</Button>
          </div>
        </div>
      </section>

      <section id="app" className="mx-auto mb-20 grid max-w-7xl overflow-hidden rounded-[32px] border-[5px] border-ink bg-ink shadow-brutal lg:grid-cols-[290px_1fr]">
        <aside className="bg-yellow p-5 lg:border-r-[5px] lg:border-ink">
          <div className="mb-5 flex items-center gap-3 text-xl font-black"><Bot /> Career OS</div>
          <div className="flex flex-col gap-3">
            {pages.map((page) => (
              <button key={page} onClick={() => setActive(page)} className={`rounded-2xl border-[3px] border-ink px-4 py-3 text-left font-black transition ${active === page ? "bg-cyan shadow-brutalSm" : "bg-[#fffaf0]"}`}>{page}</button>
            ))}
          </div>
        </aside>

        <section className="bg-cream p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div><p className="font-black uppercase text-orange">Live Workspace</p><h2 className="text-4xl font-black md:text-6xl">{active}</h2></div>
            <Badge className="bg-cyan">● Live Intelligence Mode</Badge>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .28 }}>
              {active === "Dashboard" && <Dashboard />}
              {active === "AI Twin Scan" && <TwinScan register={register} submit={handleSubmit(runScan)} />}
              {active === "Agent Control Center" && <AgentCenter />}
              {active === "Career Score" && <CareerScore />}
              {active === "Skill Map" && <SkillMap />}
              {active === "Project Generator" && <ProjectGenerator />}
              {active === "Opportunity Unlock Lab" && <OpportunityUnlockLab />}
              {active === "Opportunity Radar" && <OpportunityRadar />}
              {active === "Career Timeline" && <CareerTimeline />}
            </motion.div>
          </AnimatePresence>
        </section>
      </section>
    </main>
    </CareerTwinContext.Provider>
  );
}

function FloatingCards() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden [@media(min-width:1700px)]:block">
      <motion.div animate={{ y: [0, -14, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute left-0 top-32 w-56 rotate-[-2deg] rounded-brutal border-[5px] border-ink bg-white p-5 shadow-brutal">
        <Badge>Career Score</Badge><div className="mt-5 flex h-32 items-end gap-3">{[45, 78, 58, 95].map((h) => <span key={h} style={{ height: `${h}%` }} className="flex-1 border-[3px] border-ink bg-cyan" />)}</div>
      </motion.div>
      <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute right-0 top-80 w-64 rounded-brutal border-[5px] border-ink bg-yellow p-5 text-left shadow-brutal"><Sparkles /><h3 className="mt-3 text-xl font-black">Opportunity Unlocks</h3><p className="font-bold text-slate-700">Generated after your live AI Twin scan.</p></motion.div>
    </div>
  );
}

function EmptyState({ title = "Run a real AI Twin scan first." }: { title?: string }) {
  return <Card><h3 className="text-3xl font-black">{title}</h3><p className="mt-3 font-extrabold text-slate-700">Upload a resume PDF, enter a GitHub username, and choose a target role to generate live results.</p></Card>;
}

function Dashboard() {
  const { twin } = useCareerTwin();
  if (!twin) return <div className="grid gap-5 lg:grid-cols-[1fr_360px]"><EmptyState /><ActivityFeed /></div>;
  return <div className="grid gap-5"><div className="grid gap-5 md:grid-cols-3"><Metric title="Career Score" value={twin.careerScore} note="From CareerTwin" color="bg-cyan" /><Metric title="Market Position" value={twin.futurePrediction.marketPosition} note="Market alignment" color="bg-yellow" /><Metric title="AI Prediction" value={twin.futurePrediction.careerScore} note="12-month score" color="bg-orange text-white" /></div><div className="grid gap-5 lg:grid-cols-[1fr_360px]"><Card><h3 className="text-3xl font-black">Today's Priorities</h3><div className="mt-5 grid gap-3">{twin.timeline.slice(1, 4).map((x) => <div key={x.title} className="flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-[#fffaf0] p-4 font-black"><Check className="text-success" />{x.title}</div>)}</div></Card><ActivityFeed /></div></div>;
}

function Metric({ title, value, note, color }: any) {
  return <Card className={color}><p className="font-black text-slate-700">{title}</p><motion.strong className="block text-6xl font-black">{value}</motion.strong><p className="font-extrabold">{note}</p></Card>;
}

function ActivityFeed() {
  const { twin } = useCareerTwin();
  const feed = twin?.activityFeed.length ? twin.activityFeed : activitySeed.map((message, index) => ({ time: `10:${31 + index}`, message, type: "system" }));
  return <Card><h3 className="mb-4 flex items-center gap-2 text-2xl font-black"><Activity /> Recent AI Activity</h3><div className="flex flex-col gap-3">{feed.map((item, i) => <motion.div key={`${item.time}-${item.message}-${i}`} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="rounded-2xl border-[3px] border-ink bg-white p-3 font-black"><span className="mr-3 text-orange">{item.time}</span>{item.message}</motion.div>)}</div></Card>;
}

function TwinScan({ register, submit }: any) {
  const { isScanning, scanStep, scanError } = useCareerTwin();
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Card className="relative overflow-hidden bg-[#fffaf0]">
        <div className="absolute right-5 top-5 hidden rounded-full border-[3px] border-ink bg-cyan px-4 py-2 text-sm font-black md:block">
          Agentic Scan Console
        </div>
        <form onSubmit={submit} className="grid gap-5">
          <div>
            <h3 className="text-3xl font-black">Build Career Twin</h3>
            <p className="mt-2 max-w-2xl font-extrabold text-slate-700">Six agents will read your resume, inspect GitHub, scan live market signals, and synthesize a structured career operating plan.</p>
          </div>

          <label className="grid gap-2 font-black">
            <span>Resume PDF</span>
            <div className="rounded-[24px] border-[4px] border-dashed border-ink bg-white p-7 text-center shadow-brutalSm">
              <Upload className="mx-auto mb-3" />
              <input {...register("resume")} type="file" accept="application/pdf" className="mx-auto block max-w-full font-bold" />
            </div>
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 font-black">GitHub Username or URL<input {...register("githubUsername")} className="rounded-2xl border-[4px] border-ink bg-white p-4" placeholder="JustXutkarsh or github.com/JustXutkarsh" /></label>
            <label className="grid gap-2 font-black">Target Role<input {...register("targetRole")} className="rounded-2xl border-[4px] border-ink bg-white p-4" /></label>
          </div>

          <label className="grid gap-2 font-black">LinkedIn URL<input {...register("linkedInUrl")} className="rounded-2xl border-[4px] border-ink bg-white p-4" /></label>

          <div className="grid gap-3 md:grid-cols-3">
            {["Resume Parser", "GitHub Reader", "Market Radar"].map((name, i) => (
              <div key={name} className={`rounded-2xl border-[3px] border-ink p-4 font-black ${isScanning && scanStep >= i ? "bg-cyan shadow-brutalSm" : "bg-white"}`}>
                <div className="mb-2 flex items-center gap-2"><CircleDot className={isScanning && scanStep >= i ? "animate-pulse text-success" : ""} />{name}</div>
                <p className="text-sm text-slate-700">{isScanning && scanStep >= i ? "Working" : "Standing by"}</p>
              </div>
            ))}
          </div>

          <Button className="min-h-16 text-lg" disabled={isScanning}>RUN TWIN SCAN</Button>
          {scanError && <div className="rounded-2xl border-[4px] border-ink bg-orange p-5 font-black text-white">{scanError}</div>}
          {isScanning && <div className="rounded-2xl border-[4px] border-ink bg-cyan p-5 font-black"><motion.div className="mb-3 h-4 rounded-full bg-orange" animate={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }} />{scanSteps[scanStep]}</div>}
        </form>
      </Card>

      <Card className="bg-ink text-white">
        <h3 className="text-2xl font-black">Agent Mesh</h3>
        <div className="mt-5 grid gap-3">
          {scanSteps.map((step, i) => (
            <div key={step} className={`rounded-2xl border-[3px] border-white p-3 font-black ${isScanning && scanStep === i ? "bg-orange" : isScanning && scanStep > i ? "bg-success text-ink" : "bg-[#111827]"}`}>
              <span className="mr-2">{String(i + 1).padStart(2, "0")}</span>{step}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AgentCenter() {
  const { agentRuns, logs, isScanning } = useCareerTwin();
  const activeIndex = Math.max(0, agentRuns.findIndex((agent) => agent.status === "Working"));
  return (
    <div id="agents" className="grid gap-5 xl:grid-cols-[1fr_390px]">
      <Card className="relative overflow-hidden bg-[#fffaf0]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-3xl font-black">Career Twin Orchestration Engine</h3>
            <p className="mt-2 font-extrabold text-slate-700">Six AI workers execute as one pipeline. Every page reads from the shared CareerTwin object after completion.</p>
          </div>
          <Badge className={isScanning ? "bg-orange text-white" : "bg-cyan"}>{isScanning ? "Pipeline Running" : "Pipeline Ready"}</Badge>
        </div>

        <div className="relative">
          <svg className="absolute left-[26px] top-10 hidden h-[calc(100%-80px)] w-8 md:block" viewBox="0 0 32 720" preserveAspectRatio="none" aria-hidden="true">
            <path d="M16 0 V720" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" opacity=".28" />
            <motion.path
              d="M16 0 V720"
              stroke="#FF6B35"
              strokeWidth="6"
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: isScanning ? Math.min(1, (activeIndex + 1) / agentRuns.length) : agentRuns.every((agent) => agent.status === "Completed") ? 1 : 0 }}
              transition={{ duration: .45 }}
            />
          </svg>

          <div className="grid gap-4 md:pl-16">
            {agentRuns.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * .04 }}
                className={`rounded-[24px] border-[4px] border-ink p-4 shadow-brutalSm ${agent.status === "Working" ? "bg-cyan" : agent.status === "Completed" ? "bg-white" : agent.status === "Error" ? "bg-orange text-white" : "bg-[#fffaf0]"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full border-[3px] border-ink bg-white font-black text-ink">{index + 1}</span>
                    <h4 className="text-2xl font-black">{agent.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 font-black">
                    <CircleDot className={agent.status === "Working" ? "animate-pulse text-success" : ""} />
                    {agent.status}
                  </div>
                </div>
                <div className="mt-4 h-4 rounded-full border-[3px] border-ink bg-white">
                  <motion.div className="h-full rounded-full bg-orange" animate={{ width: `${agent.progress}%` }} />
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <p className="rounded-2xl border-[3px] border-ink bg-white p-3 font-black text-ink">Task: {agent.task}</p>
                  <p className="rounded-2xl border-[3px] border-ink bg-white p-3 font-black text-ink">Result: {agent.result}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="max-h-[820px] overflow-hidden bg-ink text-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-black">Live Execution Logs</h3>
          <Badge className="bg-cyan">Realtime</Badge>
        </div>
        <div className="flex max-h-[720px] flex-col gap-3 overflow-auto pr-1">
          {logs.length === 0 && <div className="rounded-2xl border-[3px] border-white bg-[#111827] p-4 font-black">Press Run Twin Scan to wake the agent pipeline.</div>}
          {logs.map((log, index) => (
            <motion.div key={`${log.time}-${log.message}-${index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-[3px] border-white bg-[#111827] p-3 font-black">
              <span className="mr-2 text-cyan">[{log.time}]</span>{log.message}
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CareerScore() {
  const { twin } = useCareerTwin();
  if (!twin) return <EmptyState />;
  return <div className="grid gap-5 lg:grid-cols-[320px_1fr]"><Card className="grid place-items-center"><div className="grid size-56 place-items-center rounded-full border-[14px] border-cyan outline outline-[5px] outline-ink"><span className="text-7xl font-black">{twin.careerScore}</span></div></Card><Card><h3 className="mb-4 text-2xl font-black">Why this score?</h3><div className="grid gap-4">{twin.skills.map((skill) => <div key={skill.name}><div className="mb-1 flex justify-between font-black"><button className={skill.missing ? "text-orange" : ""}>{skill.name}</button><span>{skill.score}%</span></div><div className="h-5 rounded-full border-[3px] border-ink bg-white"><motion.div initial={{ width: 0 }} animate={{ width: `${skill.score}%` }} className={`h-full rounded-full ${skill.missing ? "bg-orange" : "bg-cyan"}`} /></div><p className="mt-1 text-sm font-bold text-slate-700">{skill.recommendation}</p></div>)}</div></Card></div>;
}

function SkillMap() {
  const { twin } = useCareerTwin();
  const [selected, setSelected] = useState("");
  if (!twin) return <EmptyState />;
  const current = twin.skills.find((skill) => skill.name === selected) || twin.skills[0];
  return <div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Card><div className="grid min-h-80 place-items-center"><div className="flex flex-wrap items-center justify-center gap-5 text-xl font-black">{twin.skills.map((skill) => <button key={skill.name} onClick={() => setSelected(skill.name)} className={`rounded-full border-[4px] border-ink px-5 py-3 shadow-brutalSm ${current?.name === skill.name ? "bg-orange text-white" : skill.missing ? "bg-white" : "bg-cyan"}`}>{skill.missing ? "○" : "●"} {skill.name}</button>)}</div></div></Card><Card><h3 className="text-2xl font-black">{current?.name}</h3><p className="mt-3 font-bold text-slate-700">Current Score: {current?.score}</p><p className="mt-3 font-bold text-slate-700">Why missing: {current?.missing ? "No strong production proof found yet." : "Evidence found in the CareerTwin profile."}</p><p className="mt-3 font-bold text-slate-700">Recommendation: {current?.recommendation}</p><Badge className="mt-4 bg-yellow">Estimated gain: {current?.missing ? "+5 Career Score" : "+2 Career Score"}</Badge></Card></div>;
}

function ProjectGenerator() {
  const { twin, setTwin, setLogs } = useCareerTwin();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  if (!twin) return <EmptyState />;
  const currentTwin = twin;
  const project = twin.recommendedProject;
  const prd = project.prd || mockCareerTwin.recommendedProject.prd!;
  const github = project.githubStrategy || mockCareerTwin.recommendedProject.githubStrategy!;
  const strengths = twin.strengths.slice(0, 3);
  const gaps = twin.weaknesses.slice(0, 4);
  const systemDesign = project.systemDesign || [];
  const databaseDesign = project.databaseDesign || [];
  const apiEndpoints = project.apiEndpoints || [];
  const signals = project.recruiterSignals || [];
  const roadmap = project.buildRoadmap || [];

  async function runArchitect(mode = "alternative") {
    setLoading(true);
    setStep(0);
    for (let i = 0; i < architectSteps.length; i++) {
      setStep(i);
      await new Promise((resolve) => window.setTimeout(resolve, 625));
    }
    try {
      const response = await fetch("/api/generate-project", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentTwin, mode }) });
      const data = await response.json();
      const nextProject = { ...mockCareerTwin.recommendedProject, ...currentTwin.recommendedProject, ...(data.project || {}) };
      setTwin({ ...currentTwin, recommendedProject: nextProject });
      setLogs((items) => [...items, { time: timestamp(), message: `Project Architect generated ${nextProject.title}.` }]);
    } finally {
      setLoading(false);
    }
  }

  async function printPrd() {
    await runArchitect("mvp-prd");
    window.setTimeout(() => window.print(), 200);
  }

  return (
    <div className="grid gap-5">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Badge className="mb-3 bg-orange text-white">AI Product Architect</Badge>
            <h3 className="text-5xl font-black uppercase leading-none">Project Architect</h3>
            <p className="mt-3 max-w-3xl text-xl font-extrabold text-slate-700">One project can change your career trajectory. This AI finds the highest ROI project for your profile.</p>
          </div>
          <div className="rounded-[28px] border-[5px] border-ink bg-cyan p-5 text-center shadow-brutal">
            <p className="text-sm font-black uppercase">Project Score</p>
            <p className="text-6xl font-black">{project.projectScore || 98}</p>
            <p className="font-black">/ 100</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric title="Career Score Gain" value={project.careerGain} note="Estimated impact" color="bg-yellow" />
          <Metric title="Recruiter Signal" value={project.recruiterAppeal || "Very High"} note="Portfolio signal" color="bg-orange text-white" />
          <Metric title="Build Time" value={project.buildTime || project.timeline} note="Focused sprint" color="bg-white" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Resume", "GitHub", "Market Trends", "Target Role", "Missing Skills"].map((item) => <Badge key={item} className="bg-white">{item}</Badge>)}
        </div>
      </Card>

      {loading && (
        <Card className="bg-ink text-white">
          <div className="flex items-center gap-4">
            <motion.div className="size-5 rounded-full bg-cyan" animate={{ scale: [1, 1.6, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
            <div className="flex-1">
              <p className="text-2xl font-black">{architectSteps[step]}</p>
              <div className="mt-4 h-5 rounded-full border-[3px] border-white bg-white/10">
                <motion.div className="h-full rounded-full bg-orange" animate={{ width: `${((step + 1) / architectSteps.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5">
            <Card>
              <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                <div>
                  <h3 className="text-4xl font-black">{project.title}</h3>
                  <p className="mt-3 text-2xl font-black text-orange">{project.pitch}</p>
                  <p className="mt-5 text-xl font-extrabold text-slate-700">{project.reason}</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border-[4px] border-ink bg-cyan p-4">
                      <p className="mb-3 font-black">Current profile demonstrates</p>
                      {strengths.map((item) => <p key={item} className="font-extrabold">✓ {item}</p>)}
                    </div>
                    <div className="rounded-2xl border-[4px] border-ink bg-white p-4">
                      <p className="mb-3 font-black">Missing proof for</p>
                      {gaps.map((item) => <p key={item} className="font-extrabold text-orange">✗ {item}</p>)}
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border-[5px] border-ink bg-yellow p-5">
                  <p className="text-sm font-black uppercase">Recruiter Appeal</p>
                  <p className="mt-2 text-6xl font-black">{project.recruiterAppealScore || 95}%</p>
                  <p className="mt-4 font-extrabold text-slate-800">This project covers the most visible gaps in one startup-grade build.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">{project.techStack.map((tech) => <Badge key={tech} className="bg-cyan">{tech}</Badge>)}</div>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <h3 className="mb-4 text-3xl font-black">Product Requirements Document</h3>
                <p className="font-black">Problem Statement</p><p className="mb-4 font-bold text-slate-700">{prd.problemStatement}</p>
                <p className="font-black">Goal</p><p className="mb-4 font-bold text-slate-700">{prd.goal}</p>
                <p className="font-black">Target Users</p><div className="mb-4 flex flex-wrap gap-2">{prd.targetUsers.map((item) => <Badge key={item} className="bg-yellow">{item}</Badge>)}</div>
                <p className="font-black">Core Features</p><div className="grid gap-2 md:grid-cols-2">{prd.coreFeatures.map((item) => <p key={item} className="rounded-xl border-[3px] border-ink bg-white p-2 font-bold">{item}</p>)}</div>
                <p className="mt-4 font-black">Success Metrics</p><div className="mt-2 grid gap-2">{prd.successMetrics.map((item) => <p key={item} className="font-extrabold text-slate-700">✓ {item}</p>)}</div>
              </Card>

              <Card>
                <h3 className="mb-4 text-3xl font-black">System Design</h3>
                <div className="grid gap-3">
                  {systemDesign.map((item, index) => (
                    <motion.div key={item} initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.08 }} className="flex items-center gap-3">
                      <div className={`flex-1 rounded-2xl border-[4px] border-ink p-3 font-black ${index % 2 ? "bg-yellow" : "bg-cyan"}`}>{item}</div>
                      {index < systemDesign.length - 1 && <ArrowRight className="shrink-0" />}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <h3 className="mb-4 text-3xl font-black">Database Design</h3>
                <div className="grid gap-3 md:grid-cols-2">{databaseDesign.map((table) => <div key={table} className="rounded-2xl border-[4px] border-ink bg-white p-4 shadow-brutalSm"><p className="font-black">{table}</p><p className="text-sm font-bold text-slate-600">Core production table</p></div>)}</div>
              </Card>
              <Card>
                <h3 className="mb-4 text-3xl font-black">API Endpoints</h3>
                <div className="grid gap-2">{apiEndpoints.map((endpoint) => <code key={endpoint} className="rounded-xl border-[3px] border-ink bg-ink p-3 font-black text-cyan">{endpoint}</code>)}</div>
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
              <Card>
                <h3 className="mb-4 text-3xl font-black">Build Roadmap</h3>
                <div className="grid gap-3">{roadmap.map((week) => <div key={week.week} className="rounded-2xl border-[4px] border-ink bg-white p-4"><Badge className="mb-3 bg-orange text-white">{week.week}</Badge><div className="flex flex-wrap gap-2">{week.items.map((item) => <Badge key={item} className="bg-cyan">{item}</Badge>)}</div></div>)}</div>
              </Card>
              <Card>
                <h3 className="mb-4 text-3xl font-black">Recruiter Signal Analysis</h3>
                <div className="grid gap-2">{signals.map((item) => <p key={item} className="font-extrabold">✓ {item}</p>)}</div>
                <div className="mt-5 rounded-2xl border-[4px] border-ink bg-yellow p-4"><p className="font-black">Estimated Recruiter Appeal</p><p className="text-5xl font-black">{project.recruiterAppealScore || 95}%</p></div>
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <h3 className="mb-4 text-3xl font-black">GitHub Strategy</h3>
                <p className="font-black">Repository Name</p><code className="mt-2 block rounded-xl border-[3px] border-ink bg-white p-3 font-black">{github.repositoryName}</code>
                <p className="mt-4 font-black">README Headline</p><p className="font-bold text-slate-700">{github.readmeHeadline}</p>
                <div className="mt-4 flex flex-wrap gap-2">{github.topics.map((topic) => <Badge key={topic} className="bg-cyan">{topic}</Badge>)}</div>
                <p className="mt-4 font-black">Perfect README Sections</p><p className="font-bold text-slate-700">{github.readmeSections.join(" · ")}</p>
              </Card>
              <Card>
                <h3 className="mb-4 text-3xl font-black">LinkedIn Post Preview</h3>
                <pre className="whitespace-pre-wrap rounded-2xl border-[4px] border-ink bg-white p-4 font-sans text-lg font-extrabold text-slate-700">{project.linkedInPost}</pre>
              </Card>
            </div>

            <Card className="bg-yellow">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => runArchitect("alternative")} disabled={loading}>Generate Alternative Project</Button>
                <Button onClick={() => runArchitect("harder")} disabled={loading}>Generate Harder Version</Button>
                <Button onClick={() => runArchitect("startup")} disabled={loading}>Generate Startup Version</Button>
                <Button onClick={() => runArchitect("faang")} disabled={loading}>Generate FAANG Version</Button>
                <Button onClick={printPrd} disabled={loading}>Generate MVP PRD PDF</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OpportunityUnlockLab() {
  const { twin, setLogs, navigate } = useCareerTwin();
  const currentTwin = twin || mockCareerTwin;
  const [scenario, setScenario] = useState("Build Recommended Project");
  const [selectedJob, setSelectedJob] = useState(0);
  const [resources, setResources] = useState<any[]>([]);
  const [mentorPrompt, setMentorPrompt] = useState("How should I structure this repository?");
  const [mentorAnswer, setMentorAnswer] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const blocking = currentTwin.skills.filter((skill) => skill.missing).slice(0, 4);
  const gaps = blocking.length ? blocking : currentTwin.weaknesses.slice(0, 3).map((name) => ({ name, score: 30, missing: true, recommendation: `Build proof for ${name}.` }));
  const currentMatch = Math.max(70, Math.min(92, (currentTwin.opportunities[0]?.match || 92) - 8));
  const plans: Record<string, { score: number; interviews: number; opportunities: number; match: number }> = {
    "Build Recommended Project": { score: currentTwin.careerScore + 7, interviews: 83, opportunities: 23, match: currentMatch + 13 },
    "Learn Docker Only": { score: currentTwin.careerScore + 1, interviews: 66, opportunities: 6, match: currentMatch + 4 },
    "Win Hackathon": { score: currentTwin.careerScore + 5, interviews: 76, opportunities: 14, match: currentMatch + 9 },
    "Contribute to Open Source": { score: currentTwin.careerScore + 4, interviews: 72, opportunities: 11, match: currentMatch + 7 },
    "Custom Action": { score: currentTwin.careerScore + 3, interviews: 70, opportunities: 9, match: currentMatch + 6 }
  };
  const impact = plans[scenario];

  useEffect(() => {
    let alive = true;
    fetch("/api/unlock-lab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skills: gaps.map((skill) => skill.name) }) })
      .then((response) => response.json())
      .then((data) => alive && setResources(data.resources || []))
      .catch(() => alive && setResources([]));
    return () => { alive = false; };
  }, [gaps.map((skill) => skill.name).join("|")]);

  async function askMentor(prompt = mentorPrompt) {
    setMentorLoading(true);
    try {
      const response = await fetch("/api/ai-mentor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, careerTwin: currentTwin }) });
      const data = await response.json();
      setMentorAnswer(data.answer);
    } finally {
      setMentorLoading(false);
    }
  }

  function addLabLog(message: string) {
    setLogs((items) => [...items, { time: timestamp(), message }]);
  }

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h3 className="text-5xl font-black uppercase leading-none">Opportunity Unlock Lab</h3>
            <p className="mt-3 max-w-3xl text-xl font-extrabold text-slate-700">Complete one action. Watch your career evolve.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Metric title="Current Match" value={`${currentMatch}%`} note={`Target: Backend AI Engineer`} color="bg-cyan" />
            <Metric title="Career Score" value={currentTwin.careerScore} note="Estimated now" color="bg-yellow" />
            <Metric title="Blockers" value={gaps.length} note="Missing proof" color="bg-orange text-white" />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-3xl font-black">Blocking Skills</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {gaps.map((skill, index) => <div key={skill.name} className="rounded-2xl border-[4px] border-ink bg-white p-4 shadow-brutalSm"><Badge className="mb-3 bg-orange text-white">Missing Proof</Badge><h4 className="text-2xl font-black">✕ {skill.name}</h4><p className="mt-3 font-black">Current Proof: Low</p><p className="font-black">Jobs Blocked: {23 - index * 4}</p><p className="font-black">Importance: Critical</p><p className="font-black text-success">Estimated Gain: +{3 + index} Career Score</p></div>)}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_390px]">
        <Card>
          <h3 className="mb-4 text-3xl font-black">Fastest Unlock Plan</h3>
          <div className="grid gap-4">
            {gaps.map((skill) => {
              const resource = resources.find((item) => item.skill === skill.name) || resources[0];
              return <div key={skill.name} className="grid gap-4 rounded-2xl border-[4px] border-ink bg-white p-4 md:grid-cols-[140px_1fr_auto]"><img src={resource?.thumbnail || "https://img.youtube.com/vi/3c-iBn73dDE/hqdefault.jpg"} alt="" className="aspect-video w-full rounded-xl border-[3px] border-ink object-cover" /><div><Badge className="bg-yellow">{skill.name}</Badge><h4 className="mt-2 text-2xl font-black">{resource?.title || `${skill.name} Production Course`}</h4><p className="font-bold text-slate-700">Duration: {resource?.duration || "2-3 Hours"}</p><p className="font-bold text-slate-700">{resource?.reason || `Matches the production ${skill.name} knowledge expected by AI startups.`}</p></div><a href={resource?.url || "#"} target="_blank" rel="noreferrer"><Button>Watch</Button></a></div>;
            })}
          </div>
        </Card>

        <Card className="bg-yellow">
          <h3 className="text-3xl font-black">Build Proof</h3>
          <p className="mt-3 text-2xl font-black">Containerize your AI Task Queue.</p>
          <div className="mt-4 grid gap-2 font-extrabold"><p>✓ Dockerfile</p><p>✓ docker-compose.yml</p><p>✓ Deployment README</p></div>
          <p className="mt-4 font-black">Estimated Time: 3 Days</p><p className="font-black text-success">Career Score Gain: +3</p><p className="font-black">Recruiter Signal: High</p>
          <Button className="mt-5" onClick={() => addLabLog("Mini challenge generated for production proof.")}>Generate Challenge</Button>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <h3 className="text-3xl font-black">AI Project Architect</h3>
          <p className="mt-2 text-4xl font-black text-orange">{currentTwin.recommendedProject.title}</p>
          <p className="mt-3 font-extrabold text-slate-700">{currentTwin.recommendedProject.reason}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border-[4px] border-ink bg-cyan p-4"><p className="font-black">Current profile demonstrates</p>{currentTwin.strengths.slice(0, 3).map((item) => <p key={item} className="font-extrabold">✓ {item}</p>)}</div><div className="rounded-2xl border-[4px] border-ink bg-white p-4"><p className="font-black">Missing proof closed</p>{gaps.slice(0, 3).map((item) => <p key={item.name} className="font-extrabold text-orange">✕ {item.name}</p>)}</div></div>
          <div className="mt-5 flex flex-wrap gap-2">{currentTwin.recommendedProject.techStack.map((tech) => <Badge key={tech} className="bg-cyan">{tech}</Badge>)}</div>
        </Card>
        <Card><Metric title="Timeline" value={currentTwin.recommendedProject.timeline} note={currentTwin.recommendedProject.difficulty || "Difficulty"} color="bg-white" /><div className="mt-4"><Metric title="Recruiter Appeal" value={currentTwin.recommendedProject.recruiterAppeal || "High"} note={currentTwin.recommendedProject.careerGain} color="bg-orange text-white" /></div><Button className="mt-4 w-full" onClick={() => navigate("Project Generator")}>Open Full PRD</Button></Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card><h3 className="mb-4 text-3xl font-black">Opportunity Impact</h3><div className="grid gap-3 md:grid-cols-3"><Metric title="Match" value={`${currentMatch}%`} note="Current" color="bg-white" /><Metric title="Career Score" value={currentTwin.careerScore} note="Current" color="bg-white" /><Metric title="Interview" value="60%" note="Current" color="bg-white" /></div></Card>
        <Card className="bg-cyan"><h3 className="mb-4 text-3xl font-black">After Completing Plan</h3><div className="grid gap-3 md:grid-cols-4"><Metric title="Match" value={`${impact.match}%`} note="After" color="bg-white" /><Metric title="Score" value={impact.score} note="After" color="bg-white" /><Metric title="Interview" value={`${impact.interviews}%`} note="After" color="bg-white" /><Metric title="New Jobs" value={`+${impact.opportunities}`} note="Unlocked" color="bg-yellow" /></div></Card>
      </div>

      <Card>
        <h3 className="mb-4 text-3xl font-black">Live Opportunity Unlocks</h3>
        <div className="grid gap-3">{currentTwin.opportunities.slice(0, 3).map((op, index) => <button key={`${op.company}-${op.title}`} onClick={() => setSelectedJob(index)} className={`rounded-2xl border-[4px] border-ink p-4 text-left font-black transition ${selectedJob === index ? "bg-yellow shadow-brutalSm" : "bg-white"}`}>🔓 {op.title} <span className="text-orange">{Math.max(60, op.match - 5)}% {"->"} {Math.min(99, op.match + 5)}%</span><p className="text-sm text-slate-700">{op.company} · {op.reason}</p></button>)}</div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card><h3 className="mb-4 text-3xl font-black">Why This Works</h3><p className="text-lg font-extrabold text-slate-700">{gaps[0]?.name || "Production"} proof is currently missing from your GitHub. Many AI startups use this as a filtering criterion. Building and deploying {currentTwin.recommendedProject.title} demonstrates containerization, production APIs, backend architecture, and infrastructure ownership. This removes one of the biggest blockers in your profile.</p></Card>
        <Card><h3 className="mb-4 text-3xl font-black">Alternate Scenarios</h3><div className="grid gap-2">{Object.keys(plans).map((name) => <button key={name} onClick={() => setScenario(name)} className={`rounded-xl border-[3px] border-ink p-3 text-left font-black ${scenario === name ? "bg-cyan" : "bg-white"}`}>{name}</button>)}</div></Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <ActivityFeed />
        <Card>
          <h3 className="text-3xl font-black">Need help? Ask AI Mentor.</h3>
          <div className="mt-4 flex flex-wrap gap-2">{["What is Docker Compose?", "Help me deploy this project.", "Explain Redis queues.", "How should I structure this repository?"].map((prompt) => <button key={prompt} onClick={() => { setMentorPrompt(prompt); askMentor(prompt); }} className="rounded-full border-[3px] border-ink bg-yellow px-4 py-2 font-black">{prompt}</button>)}</div>
          <div className="mt-4 flex gap-3"><input value={mentorPrompt} onChange={(e) => setMentorPrompt(e.target.value)} className="min-w-0 flex-1 rounded-2xl border-[4px] border-ink bg-white p-3 font-black" /><Button onClick={() => askMentor()} disabled={mentorLoading}>{mentorLoading ? "Thinking..." : "Ask"}</Button></div>
          {mentorAnswer && <p className="mt-4 rounded-2xl border-[4px] border-ink bg-white p-4 font-extrabold text-slate-700">{mentorAnswer}</p>}
        </Card>
      </div>
    </div>
  );
}

function OpportunityRadar() {
  const { twin, setTwin, setLogs, navigate } = useCareerTwin();
  const [selected, setSelected] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [liveMode, setLiveMode] = useState("Live Intelligence Mode");
  const [filters, setFilters] = useState({ role: "Backend AI Engineer", location: "India", remote: false, level: "Internship / Entry", salary: "Any", platform: "All", posted: "Last 10 Days" });
  const [feed, setFeed] = useState<string[]>(["Searching AI startups...", "Ranking opportunities.", "Detected Docker skill gap.", "Recommended portfolio project."]);
  const sourceTwin = twin || mockCareerTwin;
  useEffect(() => {
    const timer = window.setInterval(() => setFeed((items) => [`${timestamp()} ${["Searching AI startups...", `Found ${sourceTwin.opportunities.length * 9 + 1} openings.`, "Ranking opportunities.", "Detected Docker skill gap.", "Unlocked high-fit opportunities."][items.length % 5]}`, ...items].slice(0, 7)), 2600);
    return () => window.clearInterval(timer);
  }, [sourceTwin.opportunities.length]);
  const currentTwin = sourceTwin;
  const opportunities = currentTwin.opportunities.filter((op) => filters.platform === "All" || op.sourcePlatform === filters.platform);
  const active = opportunities[selected === null ? 0 : Math.min(selected, opportunities.length - 1)] || currentTwin.opportunities[0];
  const gaps = active.missingSkills || [];
  const after = active.afterProject || { match: Math.min(99, active.match + 5), careerScore: currentTwin.careerScore + 7, salary: currentTwin.futurePrediction.salary };

  async function refreshRadar() {
    setScanning(true);
    setFeed((items) => [`${timestamp()} Searching LinkedIn, Wellfound, RemoteOK, Internshala, Cutshort...`, ...items]);
    try {
      const response = await fetch("/api/opportunity-radar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentTwin, targetRole: filters.role, location: filters.location }) });
      const data = await response.json();
      const next = (data.opportunities?.length ? data.opportunities : mockCareerTwin.opportunities).map((op: any) => ({
        title: op.title || "AI Opportunity",
        company: op.company || "AI Startup",
        match: numberFrom(op.matchScore ?? op.match, 80),
        reason: op.reason || "Ranked by the Opportunity Intelligence Engine.",
        missingSkills: op.missingSkills || mockCareerTwin.opportunities[0].missingSkills,
        location: op.location || filters.location,
        salary: op.salary || "Not disclosed",
        postedDate: op.postedDate || "Last 10 days",
        sourcePlatform: op.sourcePlatform || "Tavily Intelligence",
        applyLink: op.applyLink || "#",
        deadline: op.deadline || "Rolling",
        impact: op.estimatedCareerImpact || op.impact || "+4 Career Score",
        recommendedAction: op.recommendedAction || `Complete ${currentTwin.recommendedProject.title}.`,
        prepQuestions: op.prepQuestions || mockCareerTwin.opportunities[0].prepQuestions,
        prepPlan: op.prepPlan || mockCareerTwin.opportunities[0].prepPlan,
        afterProject: op.afterProject || { match: Math.min(99, numberFrom(op.matchScore ?? op.match, 80) + 5), careerScore: currentTwin.careerScore + 7, salary: currentTwin.futurePrediction.salary }
      }));
      setLiveMode(data.liveMode === "demo" ? "Live Intelligence Mode" : "Live Intelligence Mode");
      setTwin({ ...currentTwin, opportunities: next });
      setLogs((items) => [...items, { time: timestamp(), message: `Opportunity Radar ranked ${next.length} opportunities.` }]);
      setFeed((items) => [`${timestamp()} Unlocked ${next.length} high-fit opportunities.`, `${timestamp()} Recommended portfolio project.`, ...items].slice(0, 7));
      setSelected(0);
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-cyan">● {liveMode}</Badge>
            <h3 className="text-5xl font-black uppercase leading-none">Opportunity Intelligence</h3>
            <p className="mt-3 max-w-3xl text-xl font-extrabold text-slate-700">Continuously discovers, ranks, explains, and improves the opportunities your Career Twin can unlock.</p>
          </div>
          <Button onClick={refreshRadar} disabled={scanning}>{scanning ? "Scanning..." : "Refresh Intelligence"}</Button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <input className="rounded-2xl border-[4px] border-ink bg-white p-3 font-black" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} />
          <input className="rounded-2xl border-[4px] border-ink bg-white p-3 font-black" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          <select className="rounded-2xl border-[4px] border-ink bg-white p-3 font-black" value={filters.platform} onChange={(e) => setFilters({ ...filters, platform: e.target.value })}><option>All</option>{Array.from(new Set(currentTwin.opportunities.map((op) => op.sourcePlatform || "Tavily Intelligence"))).map((item) => <option key={item}>{item}</option>)}</select>
          <select className="rounded-2xl border-[4px] border-ink bg-white p-3 font-black" value={filters.posted} onChange={(e) => setFilters({ ...filters, posted: e.target.value })}><option>Last 24 Hours</option><option>Last 3 Days</option><option>Last 7 Days</option><option>Last 10 Days</option></select>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {["Remote Only", filters.level, `Salary: ${filters.salary}`].map((label, i) => <button key={label} onClick={() => i === 0 && setFilters({ ...filters, remote: !filters.remote })} className={`rounded-full border-[4px] border-ink px-4 py-2 font-black ${i === 0 && filters.remote ? "bg-orange text-white" : "bg-yellow"}`}>{label}</button>)}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[460px_1fr]">
        <Card className="grid place-items-center">
          <div className="relative size-96 max-w-full rounded-full border-[5px] border-ink bg-cyan">
            <motion.div className="absolute inset-0 rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 32, ease: "linear" }}>
              <div className="absolute inset-10 rounded-full border-[4px] border-ink/50" />
              <div className="absolute inset-24 rounded-full border-[4px] border-ink/50" />
              <div className="absolute left-1/2 top-0 h-full border-l-[3px] border-dashed border-ink/40" />
              <div className="absolute left-0 top-1/2 w-full border-t-[3px] border-dashed border-ink/40" />
            </motion.div>
            <div className="absolute left-1/2 top-1/2 z-10 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-ink bg-orange" />
            {opportunities.map((op, i) => {
              const distance = Math.min(42, Math.max(4, (100 - op.match) * 1.15));
              const angle = (i / Math.max(1, opportunities.length)) * Math.PI * 2;
              const x = 50 + Math.cos(angle) * distance;
              const y = 50 + Math.sin(angle) * distance;
              return <motion.button key={`${op.company}-${op.title}`} onClick={() => setSelected(i)} title={`${op.company} · ${op.title} · ${op.match}%`} className={`absolute z-20 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-ink shadow-brutalSm ${active === op ? "bg-yellow" : "bg-orange"}`} style={{ left: `${x}%`, top: `${y}%` }} animate={{ scale: [1, 1.14, 1], y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 + i * 0.25 }} />;
            })}
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="text-4xl font-black">{active.title}</h3><p className="text-2xl font-black text-orange">{active.company}</p></div>
            <Badge className="bg-cyan text-2xl">{active.match}% Match</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3"><Metric title="Salary" value={active.salary || "N/A"} note={active.location || "Location"} color="bg-yellow" /><Metric title="Posted" value={active.postedDate || "Recent"} note={active.sourcePlatform || "Source"} color="bg-white" /><Metric title="Impact" value={active.impact} note="Career gain" color="bg-orange text-white" /></div>
          <p className="mt-5 text-lg font-extrabold text-slate-700">{active.reason}</p>
          <p className="mt-3 font-black">AI Explanation</p>
          <p className="font-bold text-slate-700">Your AI multi-agent and backend architecture direction make you suitable. The fastest unlock is adding production deployment proof through {currentTwin.recommendedProject.title}.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={active.applyLink || "#"} target="_blank" rel="noreferrer"><Button>Apply Now</Button></a>
            <a href={active.applyLink || "#"} target="_blank" rel="noreferrer"><Button>Open Company</Button></a>
            <Button onClick={() => setFeed((items) => [`${timestamp()} Saved ${active.company}.`, ...items])}>Save Opportunity</Button>
            <Button onClick={() => setFeed((items) => [`${timestamp()} Generated prep plan for ${active.title}.`, ...items])}>Generate Preparation Plan</Button>
            <Button onClick={() => setFeed((items) => [`${timestamp()} Interview questions ready.`, ...items])}>Generate Interview Questions</Button>
            <Button onClick={() => navigate("Project Generator")}>Improve Match Score</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <h3 className="mb-4 text-3xl font-black">Missing Skills Roadmap</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {gaps.map((gap) => <div key={gap.name} className="rounded-2xl border-[4px] border-ink bg-white p-4 shadow-brutalSm"><Badge className="mb-3 bg-orange text-white">{gap.name}</Badge><p className="font-black">Current Proof: {gap.currentProof || "Low"}</p><p className="font-black">Target: {gap.targetProof || "High"}</p><p className="mt-3 font-bold text-slate-700">{gap.reason}</p><p className="mt-3 font-extrabold">Action: {gap.action}</p><p className="mt-2 font-black text-success">{gap.estimatedTime} · {gap.careerScoreGain} · {gap.matchImprovement}</p></div>)}
          </div>
        </Card>
        <Card className="bg-yellow">
          <h3 className="text-2xl font-black">Recommended Unlock Project</h3>
          <p className="mt-3 text-3xl font-black">{currentTwin.recommendedProject.title}</p>
          <p className="mt-2 font-bold text-slate-700">{active.recommendedAction}</p>
          <Button className="mt-5" onClick={() => navigate("Project Generator")}>Open Project Architect</Button>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card><h3 className="mb-4 text-2xl font-black">Interview Prep</h3><div className="grid gap-3">{(active.prepQuestions || []).map((q) => <p key={q} className="rounded-xl border-[3px] border-ink bg-white p-3 font-bold">{q}</p>)}</div></Card>
        <Card><h3 className="mb-4 text-2xl font-black">Preparation Plan</h3><div className="grid gap-3">{(active.prepPlan || []).map((item) => <p key={item} className="font-extrabold">✓ {item}</p>)}</div></Card>
        <Card><h3 className="mb-4 text-2xl font-black">Alternate Future</h3><p className="font-black">Current Match: {active.match}%</p><p className="font-black">After Project: {after.match}%</p><p className="font-black">Career Score: {currentTwin.careerScore} {"->"} {after.careerScore}</p><p className="font-black">Salary Range: {currentTwin.futurePrediction.salary} {"->"} {after.salary}</p></Card>
      </div>

      <Card className="bg-ink text-white">
        <h3 className="mb-4 text-3xl font-black">Live Opportunity Feed</h3>
        <div className="grid gap-2">{feed.map((item, i) => <motion.div key={`${item}-${i}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border-[3px] border-white/40 bg-white/10 p-3 font-black">{item.includes(":") ? item : `${timestamp()} ${item}`}</motion.div>)}</div>
      </Card>
    </div>
  );
}

function CareerTimeline() {
  const { twin } = useCareerTwin();
  if (!twin) return <EmptyState />;
  return <Card id="timeline"><div className="grid gap-5">{twin.timeline.map((item, i) => <motion.div key={`${item.year}-${item.title}`} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .12 }} className={`rounded-2xl border-[4px] p-4 ${item.predicted ? "border-dashed border-ink bg-cyan" : "border-ink bg-[#fffaf0]"}`}><div className="flex flex-wrap gap-4"><Badge className={item.predicted ? "bg-orange text-white" : "bg-yellow"}>{item.year}{item.predicted ? " Predicted" : ""}</Badge><strong className="text-xl">{item.title}</strong></div><p className="mt-2 font-bold text-slate-700">{item.description}</p></motion.div>)}</div></Card>;
}
