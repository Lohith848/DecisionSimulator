export function extractFirstJsonObject(text: string): string {
  const s = (text ?? "").trim();
  if (!s) throw new Error("Empty model response");

  let start = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") {
      start = i;
      break;
    }
  }
  if (start === -1) throw new Error("No JSON object start found");

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) return s.slice(start, i + 1);
  }

  throw new Error("Unterminated JSON object");
}

export function safeJsonParse<T>(jsonText: string): T {
  return JSON.parse(jsonText) as T;
}

export function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

