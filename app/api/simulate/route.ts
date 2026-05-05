import { NextResponse } from "next/server";
import { detectCategory } from "@/lib/categories";
import { extractFirstJsonObject, safeJsonParse, clampInt } from "@/lib/json";
import { getGroqClient } from "@/lib/groq";
import { getGeminiClient } from "@/lib/gemini";
import { buildSimulationPrompt, type SimulationResult } from "@/lib/prompt";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

type SimulateBody = {
  decision: string;
  roastMode?: boolean;
};

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function normalizeResult(parsed: SimulationResult): SimulationResult {
  return {
    category: parsed.category,
    confidence_percent: clampInt(parsed.confidence_percent, 1, 99),
    timelines: parsed.timelines,
  };
}

async function simulateWithGroq(prompt: string) {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.9,
    messages: [
      { role: "system", content: "Return ONLY valid JSON. No markdown." },
      { role: "user", content: prompt },
    ],
  });

  const text = completion.choices?.[0]?.message?.content ?? "";
  const json = extractFirstJsonObject(text);
  return safeJsonParse<SimulationResult>(json);
}

async function simulateWithGemini(prompt: string) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.9,
      responseMimeType: "application/json",
    },
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const json = extractFirstJsonObject(text);
  return safeJsonParse<SimulationResult>(json);
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit({
      key: `simulate:${ip}`,
      limit: RATE_LIMIT,
      windowMs: RATE_WINDOW_MS,
    });

    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded. Try again in a bit." }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": String(rl.retryAfterSec),
          },
        },
      );
    }

    const body = (await req.json()) as SimulateBody;
    const decision = (body.decision ?? "").trim();
    const roastMode = Boolean(body.roastMode);

    if (!decision || decision.length < 3) {
      return NextResponse.json(
        { error: "Please type a real decision (at least 3 characters)." },
        { status: 400 },
      );
    }
    if (decision.length > 500) {
      return NextResponse.json(
        { error: "Keep it under 500 characters for the MVP." },
        { status: 400 },
      );
    }

    const autoCategory = detectCategory(decision);
    const prompt = buildSimulationPrompt({
      userDecision: decision,
      autoCategory,
      roastMode,
    });

    let parsed: SimulationResult | null = null;
    let provider: "groq" | "gemini" | null = null;

    try {
      parsed = await simulateWithGroq(prompt);
      provider = "groq";
    } catch {
      parsed = await simulateWithGemini(prompt);
      provider = "gemini";
    }

    const normalized = normalizeResult(parsed);
    return NextResponse.json(
      { ...normalized, provider },
      {
        headers: {
          "x-ratelimit-limit": String(RATE_LIMIT),
          "x-ratelimit-remaining": String(rl.remaining),
          "x-ratelimit-reset": String(rl.resetAt),
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

