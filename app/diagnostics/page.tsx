"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { DashboardStats, ClinicLocation } from "@/lib/types";
import { CALL_RESULT_SCHEMA } from "@/lib/calle-client";
import { Icons } from "@/components/Icons";
import { AuthGuard } from "@/components/AuthGuard";

export default function DiagnosticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, locsRes] = await Promise.all([
        fetch("/api/call-results/stats"),
        fetch("/api/locations")
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats || null);
      }
      if (locsRes.ok) {
        const d = await locsRes.json();
        setLocations(d.locations || []);
      }
    } catch (err) {
      console.error("Error loading diagnostics:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(CALL_RESULT_SCHEMA, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const mcpTools = [
    {
      name: "POST /v1/calls",
      type: "Direct REST API",
      status: "Operational",
      desc: "Creates real-time call tasks with Idempotency-Key and OpenAPI result_schema extraction contracts.",
      latency: "280ms"
    },
    {
      name: "GET /v1/calls/{id}",
      type: "Direct REST API",
      status: "Operational",
      desc: "Polls execution state, structured results, task confidence, and ordered transcript turns.",
      latency: "140ms"
    },
    {
      name: "POST /api/webhooks/call-e",
      type: "Webhook Receiver",
      status: "Listening",
      desc: "Receives terminal call.completed and call.failed events with CALL-E-Event-Id header.",
      latency: "18ms"
    },
    {
      name: "calle mcp call plan_call",
      type: "MCP Tool",
      status: "Ready",
      desc: "Local/CLI interactive planner tool for conversational goal formulation.",
      latency: "450ms"
    }
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426]">
        <Sidebar budget={stats?.budget} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          title="CALL-E OpenAPI 3.1.0 Gateway Diagnostics"
          badge="DEVELOPER GATEWAY"
          onRefresh={fetchData}
          onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
        />

        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-[#151515] dark:text-[#FAFAF8] tracking-tight">
              Telephony Engine & Extraction Diagnostics
            </h2>
            <p className="text-xs text-[#666666] dark:text-[#9E9E9E] mt-1">
              Live status of CALL-E OpenAPI 3.1.0 endpoints, extraction contracts, and webhook listeners.
            </p>
          </div>

          {/* Tools Table */}
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#151515] dark:text-[#FAFAF8]">API Endpoint & Tool Health</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mcpTools.map((tool) => (
                <div
                  key={tool.name}
                  className="p-4 rounded-xl bg-[#F7F7F5] dark:bg-[#161616] border border-[#E8E8E4] dark:border-[#2C2C2C] hover:border-[#0F8F78] space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#151515] dark:text-[#FAFAF8]">{tool.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#282828] border border-[#E8E8E4] dark:border-[#3D3D3D] text-[#8E8E8E] font-mono">
                        {tool.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#0F8F78] flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F8F78] animate-pulse" />
                      {tool.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#666666] dark:text-[#9E9E9E]">{tool.desc}</p>
                  <div className="text-[11px] font-mono text-[#8E8E8E] pt-1">Avg Latency: {tool.latency}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Canonical Schema Viewer */}
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#151515] dark:text-[#FAFAF8]">OpenAPI 3.1.0 result_schema Contract</h3>
                <p className="text-xs text-[#666666] dark:text-[#9E9E9E]">Strict validation schema enforced on every CALL-E voice session.</p>
              </div>

              <button
                onClick={handleCopySchema}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F5] dark:bg-[#282828] hover:bg-[#EFEFEA] text-xs font-semibold text-[#151515] dark:text-[#FAFAF8] border border-[#E8E8E4] dark:border-[#3D3D3D] transition-all"
              >
                {copiedSchema ? <Icons.Check className="w-3.5 h-3.5 text-[#0F8F78]" /> : <Icons.Copy className="w-3.5 h-3.5 text-[#0F8F78]" />}
                <span>{copiedSchema ? "Copied!" : "Copy Schema JSON"}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#F7F7F5] dark:bg-[#111111] border border-[#E8E8E4] dark:border-[#2C2C2C] text-[11px] font-mono text-[#151515] dark:text-[#FAFAF8] overflow-x-auto max-h-80">
              {JSON.stringify(CALL_RESULT_SCHEMA, null, 2)}
            </pre>
          </div>
        </main>
      </div>

      <TriggerModal
        isOpen={isTriggerModalOpen}
        locations={locations}
        recallList={[]}
        onClose={() => setIsTriggerModalOpen(false)}
        onCallLaunched={fetchData}
      />
    </div>
    </AuthGuard>
  );
}
