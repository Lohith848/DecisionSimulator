export type HistoryItem = {
  id: string;
  decision: string;
  roastMode: boolean;
  createdAt: number;
};

const HISTORY_KEY = "ds_history_v1";
const MAX_HISTORY = 5;

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

export function pushHistory(item: HistoryItem) {
  const current = loadHistory();
  const deduped = current.filter((x) => x.decision !== item.decision || x.roastMode !== item.roastMode);
  saveHistory([item, ...deduped].slice(0, MAX_HISTORY));
}

const LATEST_RESULT_KEY = "ds_latest_result_v1";

export function saveLatestResult(result: unknown) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(result));
}

export function loadLatestResult<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LATEST_RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

