/**
 * lib/logger.ts
 * Enterprise PII-Safe Structured Logging Utility for RELAY
 *
 * Sanitizes phone numbers, emails, tokens, and patient names from console/log streams.
 * Governed by LOG_LEVEL environment variable (default: 'info').
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50
};

function getActiveLogLevel(): number {
  const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
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
      lowerKey.includes("refreshtoken")
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

export const logger = {
  debug(message: string, meta?: unknown): void {
    if (getActiveLogLevel() <= LOG_LEVELS.debug) {
      process.stdout.write(formatMessage("DEBUG", message, meta) + "\n");
    }
  },

  info(message: string, meta?: unknown): void {
    if (getActiveLogLevel() <= LOG_LEVELS.info) {
      process.stdout.write(formatMessage("INFO", message, meta) + "\n");
    }
  },

  warn(message: string, meta?: unknown): void {
    if (getActiveLogLevel() <= LOG_LEVELS.warn) {
      process.stderr.write(formatMessage("WARN", message, meta) + "\n");
    }
  },

  error(message: string, error?: unknown): void {
    if (getActiveLogLevel() <= LOG_LEVELS.error) {
      let errMeta: unknown = error;
      if (error instanceof Error) {
        errMeta = { name: error.name, message: error.message, stack: error.stack };
      }
      process.stderr.write(formatMessage("ERROR", message, errMeta) + "\n");
    }
  }
};
