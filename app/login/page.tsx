"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icons } from "@/components/Icons";
import { RelayLogo } from "@/components/RelayLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("alexander@relayoperations.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.user) {
          router.replace(redirectUrl);
        }
      })
      .catch(() => {});
  }, [redirectUrl, router]);

  const demoAccounts = [
    {
      id: "demo_admin",
      label: "Sign In as Administrator",
      email: "alexander@relayoperations.com",
      roleDesc: "Full Operations, PBX, IAM & Analytics"
    },
    {
      id: "demo_staff",
      label: "Sign In as Operator / Staff",
      email: "alex@relayoperations.com",
      roleDesc: "Live Call Triage & Booking Stream"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password, role: "operator", title: "Team Member" };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSuccessMessage(mode === "login" ? "Authenticated! Redirecting..." : "Account registered successfully!");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 300);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials.");
      setIsLoading(false);
    }
  };

  const handleSelectDemo = async (account: (typeof demoAccounts)[0]) => {
    setEmail(account.email);
    setPassword("password123");
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: account.email, password: "password123" })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);

      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <RelayLogo size="lg" />
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
          {mode === "login" ? "Sign in to Relay" : "Create Staff Account"}
        </h1>
        <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
          Autonomous Voice Operations & Telephony Console
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-8 shadow-elevated space-y-5">
        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-[#FAFAF8] dark:bg-[#081426] p-1 border border-[#E4E8E7] dark:border-[#20324A]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-[#0B1930] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "register"
                ? "bg-[#0B1930] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white"
            }`}
          >
            Register Account
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <Icons.AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Icons.CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
                Full Name
              </label>
              <div className="relative">
                <Icons.Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] outline-none focus:border-[#1B9A9C] transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
              Work Email Address
            </label>
            <div className="relative">
              <Icons.Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] outline-none focus:border-[#1B9A9C] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
                Password
              </label>
              {mode === "register" && (
                <span className="text-[10px] text-[#98A2B3] font-mono">Min 8 chars, 1 letter & 1 number</span>
              )}
            </div>
            <div className="relative">
              <Icons.Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Create a strong password" : "Enter your password"}
                className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] outline-none focus:border-[#1B9A9C] transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{mode === "login" ? "Authenticating..." : "Creating Account..."}</span>
              </>
            ) : (
              <span>{mode === "login" ? "Sign In to Console →" : "Create Account & Sign In →"}</span>
            )}
          </button>
        </form>

        {/* 1-Click Role Presets (shown in login mode) */}
        {mode === "login" && (
          <div className="pt-3 border-t border-[#E4E8E7] dark:border-[#20324A] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#98A2B3] uppercase">
              <span>Instant 1-Click Demo Access:</span>
              <span className="text-[#1B9A9C]">Quick Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSelectDemo(account)}
                  className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-left transition-all group cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC] group-hover:text-[#1B9A9C] transition-colors">
                    <Icons.Zap className="w-3.5 h-3.5 text-[#1B9A9C]" />
                    <span>{account.label}</span>
                  </div>
                  <div className="text-[10px] text-[#667085] dark:text-[#9BA8B8] leading-tight">
                    {account.roleDesc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-[#667085] dark:text-[#9BA8B8]">
        <Link href="/" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">
          ← Return to Public Overview
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] flex items-center justify-center p-4 selection:bg-[#1B9A9C]/20">
      <Suspense fallback={<div className="text-xs text-[#667085]">Loading Relay Auth...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
