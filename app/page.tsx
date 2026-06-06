"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bot, Rocket } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { activitySeed } from "@/lib/app-data";
import { CareerTwin, generateFallbackCareerTwin } from "@/lib/career-twin";
import { AgentRun, CareerTwinContext, ExecutionLog, scanSteps } from "@/lib/career-ui";

const Dashboard = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.Dashboard })));
const TwinScan = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.TwinScan })));
const AgentCenter = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.AgentCenter })));
const CareerScore = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.CareerScore })));
const SkillMap = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.SkillMap })));
const ProjectGenerator = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.ProjectGenerator })));
const OpportunityUnlockLab = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.OpportunityUnlockLab })));
const OpportunityRadar = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.OpportunityRadar })));
const CareerTimeline = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.CareerTimeline })));
const FloatingCards = lazy(() => import("@/components/pages/career-pages").then((mod) => ({ default: mod.FloatingCards })));

const scanSchema = z.object({
  resume: z.any(),
  githubUsername: z.string().optional(),
  targetRole: z.string().min(1),
  linkedInUrl: z.string().optional()
});

const pages = ["Dashboard", "AI Twin Scan", "Agent Control Center", "Career Score", "Skill Map", "Opportunity Unlock Lab", "Project Generator", "Opportunity Radar", "Career Timeline"];
const agentPipeline = [
  ["Skill Agent", "Waiting for resume"],
  ["Market Agent", "Waiting for target role"],
  ["Portfolio Agent", "Waiting for portfolio signals"],
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

function isWrongRoleShape(targetRole: string, raw: any) {
  const role = targetRole.toLowerCase();
  const text = JSON.stringify({
    weaknesses: raw?.weaknesses || raw?.missingSkills,
    skills: raw?.skills,
    project: raw?.recommendedProject,
    opportunities: raw?.opportunities
  }).toLowerCase();
  if (role.includes("frontend")) return /docker|kubernetes|redis|fastapi|backend ai|task queue|system design/.test(text);
  if (role.includes("ml") || role.includes("data scientist")) return /frontend developer|react workbench|next\.js app|ui component/.test(text);
  if (role.includes("devops")) return /frontend developer|ml engineer|react|model training/.test(text);
  return false;
}

function normalizeCareerTwin(raw: any, logs: ExecutionLog[], extras: { extractedSkills?: string[]; github?: unknown; market?: unknown[]; targetRole?: string } = {}): CareerTwin {
  const targetRole = extras.targetRole || raw?.targetRole || "Software Developer";
  const roleFallback = generateFallbackCareerTwin(targetRole);
  const wrongRole = isWrongRoleShape(targetRole, raw);
  const roleRaw = wrongRole ? roleFallback : raw;
  const strengths = Array.isArray(roleRaw?.strengths) ? roleRaw.strengths : roleFallback.strengths;
  const weaknesses = Array.isArray(roleRaw?.weaknesses) ? roleRaw.weaknesses : roleRaw?.missingSkills || roleFallback.weaknesses;
  const skillNames = Array.from(new Set([...(extras.extractedSkills || []), ...strengths, ...weaknesses]));
  const skills = Array.isArray(roleRaw?.skills)
    ? roleRaw.skills.map((skill: any) => ({
        name: String(skill.name),
        score: numberFrom(skill.score, skill.missing ? 35 : 75),
        missing: Boolean(skill.missing),
        recommendation: skill.recommendation || `Build proof around ${skill.name}.`
      }))
    : skillNames.map((name) => ({
        name,
        score: weaknesses.includes(name) ? 32 : 78,
        missing: weaknesses.includes(name),
        recommendation: weaknesses.includes(name) ? `Build ${roleRaw?.recommendedProject?.title || roleFallback.recommendedProject.title}.` : `Use ${name} as profile evidence.`
      }));

  const project = roleRaw?.recommendedProject || roleFallback.recommendedProject;
  const fallbackProject = roleFallback.recommendedProject;
  const future = roleRaw?.futurePrediction || roleFallback.futurePrediction;
  const opportunities = Array.isArray(roleRaw?.opportunities) ? roleRaw.opportunities : roleFallback.opportunities;
  const roadmap = Array.isArray(roleRaw?.weeklyRoadmap) ? roleRaw.weeklyRoadmap : [];

  return {
    targetRole,
    careerScore: numberFrom(raw?.careerScore, roleFallback.careerScore),
    strengths,
    weaknesses,
    skills,
    recommendedProject: {
      title: project.title || roleFallback.recommendedProject.title,
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
      salary: future.salary || roleFallback.futurePrediction.salary,
      careerScore: numberFrom(future.careerScore, roleFallback.futurePrediction.careerScore),
      interviewProbability: numberFrom(future.interviewProbability, roleFallback.futurePrediction.interviewProbability),
      marketPosition: future.marketPosition || raw?.marketAlignment || roleFallback.futurePrediction.marketPosition
    },
    opportunities: opportunities.map((op: any) => ({
      title: op.title || "Opportunity",
      company: op.company || "AI Startup",
      match: numberFrom(op.matchScore ?? op.match, 75),
      reason: op.reason || "Ranked by Career Twin.",
      missingSkills: Array.isArray(op.missingSkills) ? op.missingSkills : roleFallback.opportunities[0].missingSkills,
      location: op.location || "Remote / India",
      salary: op.salary || "Not disclosed",
      postedDate: op.postedDate || op.posted || "Last 10 days",
      sourcePlatform: op.sourcePlatform || op.platform || "Tavily Intelligence",
      applyLink: op.applyLink || op.url || "#",
      deadline: op.deadline || "Rolling",
      impact: op.impact || op.estimatedCareerImpact || op.careerImpact || "+3 Career Score",
      recommendedAction: op.recommendedAction || `Complete ${project.title || roleFallback.recommendedProject.title}.`,
      prepQuestions: Array.isArray(op.prepQuestions) ? op.prepQuestions : roleFallback.opportunities[0].prepQuestions,
      prepPlan: Array.isArray(op.prepPlan) ? op.prepPlan : roleFallback.opportunities[0].prepPlan,
      afterProject: op.afterProject || { match: Math.min(99, numberFrom(op.matchScore ?? op.match, 75) + 5), careerScore: Math.min(100, numberFrom(raw?.careerScore, roleFallback.careerScore) + 7), salary: future.salary || roleFallback.futurePrediction.salary }
    })),
    timeline: Array.isArray(raw?.timeline) && raw.timeline.length
      ? raw.timeline
      : [
          { year: "Now", title: `Career Score ${numberFrom(raw?.careerScore, roleFallback.careerScore)}`, description: "AI Twin initialized from resume, portfolio signals, market, and OpenAI analysis.", predicted: false },
          ...roadmap.slice(0, 3).map((item: string, index: number) => ({ year: `Week ${index + 1}`, title: item, description: "Execution roadmap generated by the Career Twin.", predicted: false })),
          { year: "12 Months", title: targetRole, description: `${future.salary || roleFallback.futurePrediction.salary} with ${numberFrom(future.interviewProbability, 81)}% interview probability.`, predicted: true }
        ],
    activityFeed: logs.map((entry) => ({ time: entry.time, message: entry.message, type: "agent" })),
    githubData: extras.github,
    marketData: extras.market
  } as CareerTwin;
}

export default function Home() {
  const [active, setActive] = useState("AI Twin Scan");
  const [twin, setTwin] = useState<CareerTwin | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanError, setScanError] = useState("");
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>(initialAgentRuns);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [future, setFuture] = useState(55);
  const [feed, setFeed] = useState(activitySeed.slice(0, 4));
  const { register, handleSubmit, setValue, watch } = useForm({ defaultValues: { githubUsername: "", targetRole: "", linkedInUrl: "", resume: undefined } });

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
    if (data.fallback && url !== "/api/build-career-twin") throw new Error(data.error || `${url} fallback`);
    if (data.fallback && data.success === false) throw new Error(data.error || `${url} fallback`);
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
        body: JSON.stringify({ targetRole: parsed.data.targetRole })
      });
      const marketCount = Array.isArray(market.results) ? market.results.length : 0;
      updateAgent(1, { status: "Completed", progress: 100, task: "Market scan complete", result: `Found ${marketCount} live market signals` });
      addLog(`Found ${marketCount} live market signals for ${parsed.data.targetRole}.`);

      setScanStep(2);
      updateAgent(2, { status: "Working", progress: 25, task: "Reading portfolio signals", result: "Checking GitHub or LinkedIn evidence" });
      addLog("Portfolio Agent started...");
      const githubInput = parsed.data.githubUsername?.trim();
      addLog(githubInput ? "Scanning GitHub repositories..." : "GitHub skipped. Using resume and LinkedIn profile signals.");
      const github = githubInput
        ? await checkedJson("/api/github-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: githubInput })
          })
        : { skipped: true, repositories: [], user: null };
      const repos = Array.isArray(github.repositories) ? github.repositories : [];
      const languages = repos.map((repo: any) => repo.language).filter(Boolean);
      const strongestSignal = languages[0] || parsed.data.linkedInUrl || extractedSkills[0] || "resume evidence";
      updateAgent(2, { status: "Completed", progress: 100, task: "Portfolio scan complete", result: githubInput ? `Detected ${repos.length} repositories` : "Used resume and LinkedIn signals" });
      addLog(`Detected ${strongestSignal} profile signal.`);

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
      const nextTwin = normalizeCareerTwin(data, localLogs, { extractedSkills, github, market: market.results, targetRole: parsed.data.targetRole });
      updateAgent(5, { status: "Completed", progress: 100, task: "Career Twin complete", result: `Career score ${nextTwin.careerScore}` });
      setTwin(nextTwin);
      setActive("Opportunity Unlock Lab");
    } catch {
      addLog("External API degraded. Continuity intelligence loaded.");
      const fallback = normalizeCareerTwin(generateFallbackCareerTwin(parsed.data.targetRole), localLogs, { targetRole: parsed.data.targetRole });
      setTwin(fallback);
      setAgentRuns((items) => items.map((item) => ({ ...item, status: "Completed", progress: 100, result: item.result === "No run yet" ? "Completed through continuity intelligence" : item.result })));
      setActive("Opportunity Unlock Lab");
    } finally {
      setIsScanning(false);
    }
  }

  const store = { twin, setTwin, agentRuns, setAgentRuns, logs: executionLogs, setLogs: setExecutionLogs, isScanning, setIsScanning, scanStep, setScanStep, scanError, setScanError, future, setFuture, navigate: setActive };

  return (
    <ErrorBoundary>
    <CareerTwinContext.Provider value={store}>
    <main className="min-h-screen p-4 text-ink md:p-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[30px] border-[5px] border-ink bg-[#fffaf0] p-3 shadow-brutal">
        <div className="flex items-center gap-3 text-2xl font-black">
          <span>Redrob.</span>
        </div>
        <div className="hidden gap-8 font-black md:flex"><a href="#app">Platform</a><a href="#agents" onClick={() => setActive("Agent Control Center")}>Agents</a><a href="#timeline" onClick={() => setActive("Career Timeline")}>Vision</a></div>
        <Button onClick={() => setActive("AI Twin Scan")}>Start Building <ArrowRight data-icon="inline-end" /></Button>
      </nav>

      <section className="relative mx-auto grid min-h-[720px] max-w-7xl place-items-center overflow-hidden py-20 text-center">
        <Suspense fallback={null}><FloatingCards /></Suspense>
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
              <Suspense fallback={<div className="rounded-2xl border-[4px] border-ink bg-white p-5 font-black">Loading intelligence workspace...</div>}>
                {active === "Dashboard" && <Dashboard />}
                {active === "AI Twin Scan" && <TwinScan register={register} submit={handleSubmit(runScan)} setValue={setValue} targetRole={watch("targetRole")} />}
                {active === "Agent Control Center" && <AgentCenter />}
                {active === "Career Score" && <CareerScore />}
                {active === "Skill Map" && <SkillMap />}
                {active === "Project Generator" && <ProjectGenerator />}
                {active === "Opportunity Unlock Lab" && <OpportunityUnlockLab />}
                {active === "Opportunity Radar" && <OpportunityRadar />}
                {active === "Career Timeline" && <CareerTimeline />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </section>
      </section>
    </main>
    </CareerTwinContext.Provider>
    </ErrorBoundary>
  );
}
