import { promises as fs } from "node:fs";
import path from "node:path";

// Path is resolved at first call so it tracks the running process's cwd.
function envFilePath(): string {
  return path.join(process.cwd(), ".env.local");
}

/**
 * Merge updates into .env.local without clobbering unrelated entries or comments.
 * `null` deletes a key. Also mirrors changes into process.env so the running
 * server picks them up immediately (no restart required).
 */
export async function updateEnvFile(
  updates: Record<string, string | null>,
): Promise<void> {
  const file = envFilePath();

  let existing = "";
  try {
    existing = await fs.readFile(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  const lines = existing.split(/\r?\n/);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=/i);
    if (match && match[1] in updates) {
      const key = match[1];
      seen.add(key);
      const val = updates[key];
      if (val === null) continue;
      out.push(`${key}=${formatValue(val)}`);
    } else {
      out.push(line);
    }
  }

  for (const [key, val] of Object.entries(updates)) {
    if (seen.has(key) || val === null) continue;
    out.push(`${key}=${formatValue(val)}`);
  }

  // Trim trailing empty lines, keep exactly one final newline.
  while (out.length > 0 && out[out.length - 1].trim() === "") out.pop();
  out.push("");

  await fs.writeFile(file, out.join("\n"), "utf8");

  for (const [key, val] of Object.entries(updates)) {
    if (val === null) delete process.env[key];
    else process.env[key] = val;
  }
}

function formatValue(val: string): string {
  // Quote when the value has whitespace, quotes, equals signs, or comment markers.
  if (/[\s"'#=]/.test(val)) {
    return `"${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return val;
}
