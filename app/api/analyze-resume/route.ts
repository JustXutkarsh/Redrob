import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("resume") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "Resume PDF is required.", fallback: true }, { status: 200 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    if (!parsed.text?.trim()) return NextResponse.json({ success: false, error: "PDF parsing failed", fallback: true }, { status: 200 });
    return NextResponse.json({ success: true, text: parsed.text });
  } catch (error) {
    return NextResponse.json({ success: false, error: "PDF parsing failed", fallback: true }, { status: 200 });
  }
}
