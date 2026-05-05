export type DecisionCategory =
  | "Finance"
  | "Career"
  | "Academic"
  | "Social"
  | "Health"
  | "Chaotic";

const CATEGORY_KEYWORDS: Record<DecisionCategory, RegExp[]> = {
  Finance: [
    /\b(invest|investment|sip|stocks?|equity|mutual fund|mf|crypto|bitcoin|eth|ethereum|fd|fixed deposit|loan|emi|rent|salary|tax|budget|save|savings|buy now|wait)\b/i,
  ],
  Career: [
    /\b(job|offer|resign|quit|switch|promotion|internship|interview|startup|freelance|client|ctc|salary|manager|work from home|wfh)\b/i,
  ],
  Academic: [
    /\b(class|lecture|attendance|semester|exam|midsem|endsem|assignment|submission|deadline|project|cgpa|gpa|backlog|subject|course)\b/i,
  ],
  Social: [
    /\b(text|dm|message|call|date|crush|ex|relationship|break up|party|friends?|hangout|reply|ghost)\b/i,
  ],
  Health: [
    /\b(gym|workout|diet|sleep|all[- ]?nighter|run|walking|steps|calories|protein|doctor|medicine|therapy|mental health)\b/i,
  ],
  Chaotic: [],
};

export function detectCategory(decisionRaw: string): DecisionCategory {
  const decision = (decisionRaw ?? "").trim();
  if (!decision) return "Chaotic";

  const order: DecisionCategory[] = [
    "Finance",
    "Career",
    "Academic",
    "Social",
    "Health",
  ];

  for (const cat of order) {
    const patterns = CATEGORY_KEYWORDS[cat];
    if (patterns.some((re) => re.test(decision))) return cat;
  }
  return "Chaotic";
}

