import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("YOUR_")) throw new Error("Missing OpenAI key");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Redrob AI Mentor. Give concise, practical career-building guidance tied to the user's target role, missing skills, and recommended project. No markdown tables." },
          { role: "user", content: JSON.stringify(body) }
        ]
      }, { signal: controller.signal });
      return NextResponse.json({ answer: completion.choices[0]?.message?.content || "Start by converting the skill into proof inside your recommended project." });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI mentor failed", fallback: true, answer: "Start with the recommended project. Learn the concept only enough to ship proof, then publish the code, README, architecture diagram, and deployment notes. That proof is what improves your match score." }, { status: 200 });
  }
}
