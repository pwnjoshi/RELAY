"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RelayLogo } from "@/components/RelayLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icons } from "@/components/Icons";

export default function DeveloperDocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "javascript" | "python" | "go">("curl");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Live API Sandbox State
  const [testEndpoint, setTestEndpoint] = useState("/api/call-results/stats");
  const [testMethod, setTestMethod] = useState("GET");
  const [testPayload, setTestPayload] = useState('{\n  "action": "summary"\n}');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("relay_auth_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isLoggedIn) setIsLoggedIn(true);
        } catch {}
      }
    }

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.user) {
          setIsLoggedIn(true);
          sessionStorage.setItem("relay_auth_user", JSON.stringify({ isLoggedIn: true, name: d.user.name, role: d.user.role }));
        } else {
          setIsLoggedIn(false);
          sessionStorage.removeItem("relay_auth_user");
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunApiTest = async () => {
    setIsLoadingApi(true);
    setTestResponse(null);
    try {
      let options: RequestInit = { method: testMethod };
      if (testMethod === "POST") {
        options.headers = { "Content-Type": "application/json" };
        options.body = testPayload;
      }
      const res = await fetch(testEndpoint, options);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ ok: false, error: err.message || "Request failed" }, null, 2));
    } finally {
      setIsLoadingApi(false);
    }
  };

  const sections = [
    { id: "overview", label: "Architecture & Flow Diagrams", icon: Icons.Activity },
    { id: "telephony-api", label: "Voice Dispatch REST API", icon: Icons.PhoneCall },
    { id: "rag-engine", label: "Real-Time Web RAG Engine", icon: Icons.Zap },
    { id: "calendar-api", label: "Calendar & EHR Interconnect", icon: Icons.Calendar },
    { id: "webhooks", label: "Webhooks & Fact Extractors", icon: Icons.Layers },
    { id: "sandbox", label: "Interactive API Sandbox", icon: Icons.Cpu },
    { id: "languages", label: "Multilingual Voice Locales", icon: Icons.Globe },
    { id: "carrier-security", label: "Carrier Guardrails & Safety", icon: Icons.Shield }
  ];

  const getCodeSnippet = (endpoint: string, method: string, lang: string) => {
    if (lang === "curl") {
      return `curl -X ${method} https://api.relay.operations.ai${endpoint} \\
  -H "Authorization: Bearer sk_live_relay_98127394102" \\
  -H "Content-Type: application/json" ${method === "POST" ? `\\
  -d '{\n    "phoneNumber": "+919810012345",\n    "language": "hi",\n    "customGoal": "Schedule technical discovery consultation"\n  }'` : ''}`;
    }
    if (lang === "javascript") {
      return `const response = await fetch("https://api.relay.operations.ai${endpoint}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer sk_live_relay_98127394102",
    "Content-Type": "application/json"
  }${method === "POST" ? `,\n  body: JSON.stringify({\n    phoneNumber: "+919810012345",\n    language: "hi",\n    customGoal: "Schedule technical discovery consultation"\n  })` : ''}
});
const data = await response.json();
console.log("Relay Telephony Sync:", data);`;
    }
    if (lang === "python") {
      return `import requests

headers = {
    "Authorization": "Bearer sk_live_relay_98127394102",
    "Content-Type": "application/json"
}

${method === "POST" ? `payload = {
    "phoneNumber": "+919810012345",
    "language": "hi",
    "customGoal": "Schedule technical discovery consultation"
}
response = requests.post("https://api.relay.operations.ai${endpoint}", json=payload, headers=headers)` : `response = requests.get("https://api.relay.operations.ai${endpoint}", headers=headers)`}

print(response.json())`;
    }
    if (lang === "go") {
      return `package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://api.relay.operations.ai${endpoint}"
	req, _ := http.NewRequest("${method}", url, nil)
	req.Header.Add("Authorization", "Bearer sk_live_relay_98127394102")

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] transition-colors flex flex-col font-sans">
      {/* Top Docs Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#10223A]/90 backdrop-blur-md border-b border-[#E4E8E7] dark:border-[#20324A] px-6 sm:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <RelayLogo size="sm" />
          </div>
          <span className="text-xs font-mono font-bold bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/30 px-2.5 py-0.5 rounded-full">
            Developer Documentation v1.0 (SDK & API Portal)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!mounted || isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95"
            >
              <span>Go to Console &rarr;</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95"
            >
              <Icons.Lock className="w-3.5 h-3.5 text-[#1B9A9C]" />
              <span>Sign In &rarr;</span>
            </Link>
          )}
        </div>
      </header>

      {/* Docs Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sticky Navigation Menu */}
        <aside className="md:col-span-1 space-y-4">
          <div className="sticky top-20 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-4 space-y-1 shadow-subtle text-xs">
            <div className="px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#667085] dark:text-[#9BA8B8]">
              API Documentation Modules
            </div>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1B9A9C] text-white shadow-sm"
                      : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#081426] hover:text-[#0B1930] dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-[#E4E8E7] dark:border-[#20324A] mt-4 space-y-2">
              <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#667085] dark:text-[#9BA8B8]">
                SDKs & Tools
              </div>
              <Link
                href="/diagnostics"
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[#667085] dark:text-[#9BA8B8] hover:text-[#1B9A9C] text-xs font-semibold"
              >
                <span>Live Gateway Health</span>
                <Icons.ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/batch"
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[#667085] dark:text-[#9BA8B8] hover:text-[#1B9A9C] text-xs font-semibold"
              >
                <span>Batch CSV/Excel Dialer</span>
                <Icons.ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Main Documentation Content */}
        <main className="md:col-span-3 space-y-10 text-xs sm:text-sm">
          {/* Section 1: System Architecture & High-Level Flow Diagram */}
          {activeSection === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-[#1B9A9C]/10 text-[#1B9A9C] px-2.5 py-0.5 rounded-full">
                    SYSTEM OVERVIEW
                  </span>
                  <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8]">
                    Sub-14s Latency Pipeline
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                  Relay Platform Architecture & Data Flow
                </h1>
                <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Relay is an autonomous multi-industry voice operations platform that connects incoming phone lines, CRM records, and scheduled batch workflows to intelligent real-time conversational agents.
                </p>
              </div>

              {/* High-Level Architecture Flowchart Diagram */}
              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 space-y-6 shadow-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC]">
                    End-to-End Realtime Telephony & RAG Sync Topology
                  </span>
                  <span className="text-[10px] font-mono text-[#16A34A] font-bold bg-[#16A34A]/10 px-2 py-0.5 rounded">
                    HTTP / WebSocket / SIP Interconnect
                  </span>
                </div>

                {/* Flow Nodes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative text-xs">
                  <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 relative">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#1B9A9C]">
                      <span>STAGE 01</span>
                      <Icons.PhoneCall className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-bold text-[#0B1930] dark:text-white">1. Trigger & Interconnect</div>
                    <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
                      Inbound PSTN ring, REST API trigger, or scheduled Excel batch campaign.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 relative">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#32C4BE]">
                      <span>STAGE 02</span>
                      <Icons.Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-bold text-[#0B1930] dark:text-white">2. Neural Voice & Web RAG</div>
                    <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
                      24kHz Opus audio stream + real-time website knowledge retrieval.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 relative">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#1B9A9C]">
                      <span>STAGE 03</span>
                      <Icons.Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-bold text-[#0B1930] dark:text-white">3. Privacy Free/Busy Check</div>
                    <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
                      Strict temporal privacy masking for calendar availability & EHR slots.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 relative">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#16A34A]">
                      <span>STAGE 04</span>
                      <Icons.Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-bold text-[#0B1930] dark:text-white">4. Fact Extract & CRM Sync</div>
                    <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
                      Extracts JSON facts, lead score, and dispatches webhook notifications.
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Isolation & Security Blueprint */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-3 shadow-subtle">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                    <Icons.Shield className="w-4 h-4 text-[#1B9A9C]" />
                    <span>Multi-Tenant Enterprise Isolation</span>
                  </div>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                    Each corporate entity operates inside an isolated workspace context with isolated call records, staff roles, and vector search embeddings.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-3 shadow-subtle">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                    <Icons.Lock className="w-4 h-4 text-[#16A34A]" />
                    <span>Privacy-Preserving Free/Busy Masking</span>
                  </div>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                    Only open time windows are exposed to conversational agents. Caller PII and confidential notes are never leaked between tenant environments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Voice Dispatch REST API */}
          {activeSection === "telephony-api" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                  Voice Dispatch REST API
                </h1>
                <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Programmatically trigger autonomous telephony runs, manage call queues, and query call statuses in real time.
                </p>
              </div>

              {/* Code Snippet Tabs */}
              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-4 shadow-subtle">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1B9A9C]">POST /api/trigger-recall</span>
                    <span className="text-[10px] font-mono bg-[#1B9A9C]/10 text-[#32C4BE] px-2 py-0.5 rounded font-bold">Outbound / Inbound Dispatch</span>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 bg-[#FAFAF8] dark:bg-[#081426] p-1 rounded-lg border border-[#E4E8E7] dark:border-[#20324A]">
                    {(["curl", "javascript", "python", "go"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveCodeTab(lang)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                          activeCodeTab === lang
                            ? "bg-[#0B1930] text-white"
                            : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => handleCopy(getCodeSnippet("/api/trigger-recall", "POST", activeCodeTab), "telephony-code")}
                    className="absolute right-3 top-3 text-[10px] font-mono text-[#98A2B3] hover:text-white bg-[#10223A] px-2 py-1 rounded border border-[#20324A] cursor-pointer"
                  >
                    {copiedKey === "telephony-code" ? "✓ Copied" : "Copy Code"}
                  </button>
                  <pre className="p-4 rounded-xl bg-[#081426] border border-[#20324A] text-xs font-mono text-[#32C4BE] overflow-x-auto leading-relaxed">
                    {getCodeSnippet("/api/trigger-recall", "POST", activeCodeTab)}
                  </pre>
                </div>
              </div>

              {/* Status Polling Endpoint */}
              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-3 shadow-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1B9A9C]">GET /api/call-results/status?runId=...</span>
                  <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">Real-Time Polling</span>
                </div>
                <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                  Returns live carrier progression: <code className="font-mono text-[#1B9A9C]">queued</code> &rarr; <code className="font-mono text-[#1B9A9C]">ringing</code> &rarr; <code className="font-mono text-[#1B9A9C]">in-progress</code> &rarr; <code className="font-mono text-[#1B9A9C]">completed</code>.
                </p>
              </div>
            </div>
          )}

          {/* Section 3: Real-Time Web RAG Engine */}
          {activeSection === "rag-engine" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                  Real-Time Website RAG Knowledge Engine
                </h1>
                <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Ground conversational voice agents on your live company website or documentation with zero manual prompt re-typing.
                </p>
              </div>

              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-4 shadow-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1B9A9C]">POST /api/knowledge/extract</span>
                  <button
                    onClick={() => handleCopy(`curl -X POST https://api.relay.operations.ai/api/knowledge/extract -H "Content-Type: application/json" -d '{"url": "https://mycompany.com"}'`, "rag-curl")}
                    className="text-[11px] font-mono text-[#667085] hover:text-[#1B9A9C] cursor-pointer"
                  >
                    {copiedKey === "rag-curl" ? "✓ Copied" : "Copy cURL"}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#081426] border border-[#20324A] text-xs font-mono text-[#32C4BE] overflow-x-auto leading-relaxed">
{`// Request Payload
{
  "url": "https://techsangi.com"
}

// Response (200 OK)
{
  "ok": true,
  "url": "https://techsangi.com",
  "brandName": "Tech Sangi IT & AI Operations",
  "overview": "Software development agency & AI consulting firm handling incoming client discovery calls.",
  "services": [
    "Web Development & MVP Architecture",
    "LLM RAG & Vector Search Systems",
    "24/7 Cloud Operations"
  ],
  "knowledgeBase": "ORGANIZATION KNOWLEDGE (GROUNDED FROM https://techsangi.com)..."
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Section 4: Calendar & EHR Interconnect */}
          {activeSection === "calendar-api" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                  Google Calendar & EHR FHIR Interconnect
                </h1>
                <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Query real-time availability slots and commit confirmed appointments directly into Google Calendar, Salesforce, or AthenaHealth EHR.
                </p>
              </div>

              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-4 shadow-subtle">
                <span className="font-mono text-xs font-bold text-[#1B9A9C]">POST /api/calendar (Book Appointment)</span>
                <pre className="p-3.5 rounded-xl bg-[#081426] border border-[#20324A] text-xs font-mono text-[#32C4BE] overflow-x-auto leading-relaxed">
{`// Booking Request Payload
{
  "action": "book",
  "customerName": "Neev Badu",
  "customerPhone": "+9779742494897",
  "serviceType": "Technical Discovery Consultation",
  "startIso": "2026-08-28T14:30:00.000Z",
  "durationMinutes": 45
}

// Response (200 OK)
{
  "ok": true,
  "event": {
    "id": "evt_99182301",
    "status": "confirmed",
    "calendarId": "primary",
    "summary": "Technical Discovery Consultation - Neev Badu",
    "startIso": "2026-08-28T14:30:00.000Z"
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Section 5: Webhooks & Fact Extractors */}
          {activeSection === "webhooks" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                  Webhook Event Contracts & Fact Extraction
                </h1>
                <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Upon call completion, Relay validates extracted conversational facts against strict JSON schemas before committing to your CRM or database.
                </p>
              </div>

              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-3 shadow-subtle">
                <span className="font-mono text-xs font-bold text-[#1B9A9C]">CALL_RESULT_SCHEMA Validation Output</span>
                <pre className="p-3.5 rounded-xl bg-[#081426] border border-[#20324A] text-xs font-mono text-[#32C4BE] overflow-x-auto leading-relaxed">
{`{
  "call_id": "call_Kc-FrIU4Xgx8WdkcKTQlHg",
  "outcome": "booked",
  "appointment_booked": "yes",
  "confirmed_datetime": "2026-08-28T14:30:00.000Z",
  "service_type": "Web Architecture Consultation",
  "requires_callback": "no",
  "callback_priority": "none",
  "patient_sentiment": "positive",
  "opt_out_requested": "no",
  "summary": "Client confirmed consultation for Friday at 2:30 PM regarding web architecture."
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Section 6: Interactive REST API Sandbox */}
          {activeSection === "sandbox" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-[#16A34A]/10 text-[#16A34A] px-2.5 py-0.5 rounded-full">
                    LIVE REST TESTER
                  </span>
                  <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8]">
                    Interactive Endpoint Playground
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                  Interactive API Gateway Playground
                </h1>
                <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Test live API endpoints right inside your browser with instant responses and schema validation.
                </p>
              </div>

              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 space-y-4 shadow-subtle">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0B1930] dark:text-white">HTTP Method</label>
                    <select
                      value={testMethod}
                      onChange={(e) => setTestMethod(e.target.value)}
                      className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0B1930] dark:text-white outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-[#0B1930] dark:text-white">Endpoint Route</label>
                    <select
                      value={testEndpoint}
                      onChange={(e) => {
                        setTestEndpoint(e.target.value);
                        if (e.target.value === "/api/call-results/stats") {
                          setTestMethod("GET");
                        } else if (e.target.value === "/api/calendar?action=availability") {
                          setTestMethod("GET");
                        } else if (e.target.value === "/api/locations") {
                          setTestMethod("GET");
                        } else if (e.target.value === "/api/knowledge/extract") {
                          setTestMethod("POST");
                          setTestPayload('{\n  "url": "https://techsangi.com"\n}');
                        }
                      }}
                      className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0B1930] dark:text-white outline-none"
                    >
                      <option value="/api/call-results/stats">GET /api/call-results/stats</option>
                      <option value="/api/calendar?action=availability">GET /api/calendar?action=availability</option>
                      <option value="/api/locations">GET /api/locations</option>
                      <option value="/api/knowledge/extract">POST /api/knowledge/extract</option>
                    </select>
                  </div>
                </div>

                {testMethod === "POST" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0B1930] dark:text-white">Request Body (JSON)</label>
                    <textarea
                      rows={4}
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                      className="w-full bg-[#081426] border border-[#20324A] rounded-xl p-3 text-xs font-mono text-[#32C4BE] outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleRunApiTest}
                    disabled={isLoadingApi}
                    className="px-5 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Icons.Refresh className={`w-3.5 h-3.5 text-[#1B9A9C] ${isLoadingApi ? "animate-spin" : ""}`} />
                    <span>{isLoadingApi ? "Executing API Ping..." : "Run Request Live"}</span>
                  </button>
                </div>

                {testResponse && (
                  <div className="space-y-1 pt-3 border-t border-[#E4E8E7] dark:border-[#20324A]">
                    <span className="font-mono text-xs font-bold text-[#16A34A] block">Response Output (200 OK)</span>
                    <pre className="p-4 rounded-xl bg-[#081426] border border-[#20324A] text-xs font-mono text-[#32C4BE] overflow-x-auto leading-relaxed max-h-72">
                      {testResponse}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 7: Multilingual Voice Locales */}
          {activeSection === "languages" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                  Supported Multilingual Voice Locales
                </h1>
                <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Relay agents are fluent across major world languages with dynamic mid-call language switching.
                </p>
              </div>

              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl overflow-hidden shadow-subtle">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3F5F4] dark:bg-[#081426] border-b border-[#E4E8E7] dark:border-[#20324A] font-mono text-[10px] uppercase font-bold text-[#667085] dark:text-[#9BA8B8]">
                    <tr>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Locale Tag</th>
                      <th className="py-3 px-4">Carrier Region Routing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E8E7] dark:divide-[#20324A] text-xs">
                    <tr><td className="py-3 px-4 font-bold">हिन्दी (Hindi)</td><td className="py-3 px-4 font-mono text-[#1B9A9C]">hi</td><td className="py-3 px-4 font-mono">hi-IN</td><td className="py-3 px-4">India (+91 Direct Interconnect)</td></tr>
                    <tr><td className="py-3 px-4 font-bold">नेपाली (Nepali)</td><td className="py-3 px-4 font-mono text-[#1B9A9C]">ne</td><td className="py-3 px-4 font-mono">ne-NP</td><td className="py-3 px-4">Nepal (+977 Gateway)</td></tr>
                    <tr><td className="py-3 px-4 font-bold">English (US/UK/Global)</td><td className="py-3 px-4 font-mono text-[#1B9A9C]">en</td><td className="py-3 px-4 font-mono">en-US</td><td className="py-3 px-4">North America & Global (+1)</td></tr>
                    <tr><td className="py-3 px-4 font-bold">Español (Spanish)</td><td className="py-3 px-4 font-mono text-[#1B9A9C]">es</td><td className="py-3 px-4 font-mono">es-US</td><td className="py-3 px-4">LATAM & Europe (+34 / +1)</td></tr>
                    <tr><td className="py-3 px-4 font-bold">Français (French)</td><td className="py-3 px-4 font-mono text-[#1B9A9C]">fr</td><td className="py-3 px-4 font-mono">fr-FR</td><td className="py-3 px-4">Europe (+33)</td></tr>
                    <tr><td className="py-3 px-4 font-bold">Deutsch (German)</td><td className="py-3 px-4 font-mono text-[#1B9A9C]">de</td><td className="py-3 px-4 font-mono">de-DE</td><td className="py-3 px-4">Europe (+49)</td></tr>
                    <tr><td className="py-3 px-4 font-bold">中文 (Mandarin)</td><td className="py-3 px-4 font-mono text-[#1B9A9C]">zh</td><td className="py-3 px-4 font-mono">zh-CN</td><td className="py-3 px-4">Asia-Pacific (+86)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 8: Carrier Guardrails & Safety */}
          {activeSection === "carrier-security" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                  Carrier Guardrails, Rate Limiting & Safety
                </h1>
                <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Enterprise-grade safeguards protecting against carrier abuse, denial of service, and unexpected telephony overruns.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-2 shadow-subtle">
                  <div className="font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
                    <span>Rate Limiter Policies</span>
                  </div>
                  <ul className="text-xs text-[#667085] dark:text-[#9BA8B8] space-y-1.5 list-disc pl-4">
                    <li><strong>2 Calls / 24-Hour Day Quota:</strong> Strictly limits demo visitors to 2 live PSTN runs per day.</li>
                    <li><strong>60-Second Cooldown:</strong> Enforces a 1-minute mandatory delay between consecutive dispatches.</li>
                    <li><strong>HTTP 429 Status:</strong> Returns structured retry-after timestamps and countdown data.</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-2 shadow-subtle">
                  <div className="font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span>Credential & Key Hygiene</span>
                  </div>
                  <ul className="text-xs text-[#667085] dark:text-[#9BA8B8] space-y-1.5 list-disc pl-4">
                    <li>Zero API key leakage to browser clients.</li>
                    <li>All carrier credentials isolated in secure server-side Node.js runtimes.</li>
                    <li>Fail-closed webhook validation with cryptographic signature headers.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
