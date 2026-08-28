/**
 * lib/validation.ts
 * Enterprise Input Validation, Sanitization & Password Strength Rules
 */
import { UserRole } from "./types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, ""); // Basic HTML tag strip
}

export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "Email address is required." };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.length > 254) {
    return { valid: false, error: "Email address is too long." };
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, error: "Please provide a valid email address (e.g. name@company.com)." };
  }
  return { valid: true };
}

export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== "string" || !password) {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password cannot exceed 128 characters." };
  }
  // At least 1 letter and 1 number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, error: "Password must contain at least one letter and one number." };
  }

  return { valid: true };
}

export function validateName(name: unknown): ValidationResult {
  if (typeof name !== "string" || !name.trim()) {
    return { valid: false, error: "Full name is required." };
  }
  const clean = name.trim();
  if (clean.length < 2 || clean.length > 80) {
    return { valid: false, error: "Full name must be between 2 and 80 characters." };
  }
  return { valid: true };
}

export function validateRole(role: unknown): { valid: boolean; role: UserRole } {
  const allowed: UserRole[] = ["owner", "dept_admin", "operator", "media_pr"];
  if (typeof role === "string" && allowed.includes(role as UserRole)) {
    return { valid: true, role: role as UserRole };
  }
  return { valid: true, role: "operator" }; // Default fallback
}
