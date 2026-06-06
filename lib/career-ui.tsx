"use client";

import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { CareerTwin } from "@/lib/career-twin";

export type AgentStatus = "Idle" | "Working" | "Completed" | "Error";

export type AgentRun = {
  name: string;
  status: AgentStatus;
  progress: number;
  task: string;
  result: string;
};

export type ExecutionLog = { time: string; message: string };

export type CareerTwinStore = {
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

export const CareerTwinContext = createContext<CareerTwinStore | null>(null);

export function useCareerTwin() {
  const value = useContext(CareerTwinContext);
  if (!value) throw new Error("CareerTwinContext missing");
  return value;
}

export const scanSteps = ["Scanning Resume...", "Reading Portfolio Signals...", "Analyzing Market...", "Building AI Twin...", "Generating Projects...", "Calculating Career Score..."];

export const architectSteps = ["Analyzing Resume...", "Reading Portfolio Signals...", "Checking Market Trends...", "Calculating Skill Gaps...", "Designing Product...", "Writing PRD...", "Generating Architecture...", "Finalizing Portfolio Strategy..."];

export function timestamp() {
  return new Date().toLocaleTimeString("en-IN", { hour12: false });
}

export function numberFrom(value: unknown, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replace(/[^\d.-]/g, "")) || fallback;
  return fallback;
}
