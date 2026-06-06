import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("resume") as File | null;
    if (!file) return NextResponse.json({ error: "Resume PDF is required." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = (await import("pdf-parse")).default;
    const parsed = await pdf(buffer);
    if (!parsed.text?.trim()) return NextResponse.json({ error: "Could not extract text from this PDF." }, { status: 422 });
    return NextResponse.json({ text: parsed.text });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Resume extraction failed." }, { status: 500 });
  }
}
