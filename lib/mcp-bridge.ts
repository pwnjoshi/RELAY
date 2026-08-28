import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function getCalleApiKey(): string {
  const key = process.env.CALLE_API_KEY;
  if (!key) {
    throw new Error(
      "[MCP Bridge] Missing required environment variable: CALLE_API_KEY. Please configure CALLE_API_KEY in your environment or .env.local file."
    );
  }
  return key;
}

const DEFAULT_ENV = {
  ...process.env,
  CALLE_API_KEY: process.env.CALLE_API_KEY || "",
  CALLE_SOURCE: "skills_sh",
  CALLE_INTEGRATION: "skills_sh_skill",
  CALLE_INTEGRATION_VERSION: "0.1.0"
};

export interface McpCallResult<T = any> {
  ok: boolean;
  result?: T;
  error?: string;
  raw?: string;
}

/**
 * Execute CALL-E CLI commands natively with proper quote escaping on Windows and Unix
 */
export async function runCalleCli<T = any>(commandArgs: string): Promise<McpCallResult<T>> {
  try {
    let cmd = `calle ${commandArgs}`;
    if (process.platform === "win32") {
      cmd = `powershell -NoProfile -NonInteractive -Command "& calle ${commandArgs}"`;
    }

    console.log(`[CALL-E CLI] Executing: ${cmd}`);

    const { stdout, stderr } = await execAsync(cmd, {
      env: DEFAULT_ENV,
      maxBuffer: 10 * 1024 * 1024,
      timeout: 160000
    });

    const trimmed = stdout.trim();
    if (!trimmed) {
      if (stderr) return { ok: false, error: stderr };
      return { ok: false, error: "Empty output from CALL-E CLI" };
    }

    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const extracted = trimmed.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(extracted);
      return { ok: true, result: (parsed.result !== undefined ? parsed.result : parsed) as T, raw: trimmed };
    }

    const parsed = JSON.parse(trimmed);
    return { ok: true, result: (parsed.result !== undefined ? parsed.result : parsed) as T, raw: trimmed };
  } catch (err: any) {
    console.error(`[CALL-E CLI] Error executing command:`, err.message || err);
    return {
      ok: false,
      error: err.message || String(err),
      raw: err.stdout || err.stderr
    };
  }
}
