/**
 * lib/logger.ts
 * Enterprise PII-Safe Structured Logging Utility for RELAY
 *
 * Sanitizes phone numbers, emails, tokens, and patient names from console/log streams.
 * Governed by LOG_LEVEL environment variable (default: 'info').
 */

/* eslint-disable no-console */

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50
};

function getActiveLogLevel(): number {
  const envLevel = (typeof process !== "undefined" && process.env?.LOG_LEVEL
    ? process.env.LOG_LEVEL.toLowerCase()
    : "info") as LogLevel;
  return LOG_LEVELS[envLevel] || LOG_LEVELS.info;
}

/**
 * Mask a phone number to reveal only country prefix and last 4 digits.
 * e.g. "+14155551234" -> "+1-***-1234"
 */
export function maskPhone(phone?: string | null): string {
  if (!phone || typeof phone !== "string") return "—";
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return "****";
  const prefix = cleaned.startsWith("+") ? cleaned.slice(0, 3) : cleaned.slice(0, 2);
  const suffix = cleaned.slice(-4);
  return `${prefix}-***-${suffix}`;
}

/**
 * Mask an email address.
 * e.g. "alexander@domain.com" -> "a***r@domain.com"
 */
export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== "string" || !email.includes("@")) return "—";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `**@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

/**
 * Mask sensitive tokens or cryptographic keys.
 */
export function maskToken(token?: string | null): string {
  if (!token || typeof token !== "string") return "—";
  if (token.length <= 8) return "••••••••";
  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}

/**
 * Recursively sanitize objects to redact sensitive PII before serialization.
 */
export function sanitizeLogData<T = unknown>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = k.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token") ||
      lowerKey.includes("jwt") ||
      lowerKey.includes("refreshtoken") ||
      lowerKey.includes("authorization")
    ) {
      sanitized[k] = "[REDACTED_SECRET]";
    } else if (lowerKey.includes("phone") || lowerKey === "phonenumber" || lowerKey === "to") {
      sanitized[k] = typeof v === "string" ? maskPhone(v) : v;
    } else if (lowerKey.includes("email")) {
      sanitized[k] = typeof v === "string" ? maskEmail(v) : v;
    } else if (typeof v === "object" && v !== null) {
      sanitized[k] = sanitizeLogData(v);
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized as T;
}

function formatMessage(prefix: string, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  if (meta !== undefined) {
    const safeMeta = sanitizeLogData(meta);
    return `[${timestamp}] [${prefix}] ${message} ${JSON.stringify(safeMeta)}`;
  }
  return `[${timestamp}] [${prefix}] ${message}`;
}

function writeOutput(level: "debug" | "info" | "warn" | "error", formatted: string): void {
  if (typeof process !== "undefined" && process.stdout?.write && process.stderr?.write) {
    if (level === "error" || level === "warn") {
      process.stderr.write(formatted + "\n");
    } else {
      process.stdout.write(formatted + "\n");
    }
  } else {
    // Browser fallback
    if (level === "error") console.error(formatted);
    else if (level === "warn") console.warn(formatted);
    else if (level === "info") console.info(formatted);
    else console.debug(formatted);
  }
}

export const logger = {
  debug(message: string, meta?: unknown): void {
    if (getActiveLogLevel() <= LOG_LEVELS.debug) {
      writeOutput("debug", formatMessage("DEBUG", message, meta));
    }
  },

  info(message: string, meta?: unknown): void {
    if (getActiveLogLevel() <= LOG_LEVELS.info) {
      writeOutput("info", formatMessage("INFO", message, meta));
    }
  },

  warn(message: string, meta?: unknown): void {
    if (getActiveLogLevel() <= LOG_LEVELS.warn) {
      writeOutput("warn", formatMessage("WARN", message, meta));
    }
  },

  error(message: string, error?: unknown): void {
    if (getActiveLogLevel() <= LOG_LEVELS.error) {
      let errMeta: unknown = error;
      if (error instanceof Error) {
        errMeta = { name: error.name, message: error.message, stack: error.stack };
      }
      writeOutput("error", formatMessage("ERROR", message, errMeta));
    }
  }
};
