// Deterministic, dependency-free id generator. Good enough for single-user MVP.
export function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
