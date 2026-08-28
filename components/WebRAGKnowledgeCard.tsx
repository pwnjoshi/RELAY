"use client";

import React, { useState, useEffect } from "react";
import { Icons } from "@/components/Icons";

interface WebRAGKnowledgeCardProps {
  onGroundingUpdated?: (knowledge: string, brand: string) => void;
}

export function WebRAGKnowledgeCard({ onGroundingUpdated }: WebRAGKnowledgeCardProps) {
  const [url, setUrl] = useState("https://techsangi.com.np/");
  const [isCrawling, setIsCrawling] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [knowledgeData, setKnowledgeData] = useState<any>(null);
  const [showInspectorModal, setShowInspectorModal] = useState(false);

  const fetchCurrentKnowledge = async () => {
    try {
      const res = await fetch("/api/knowledge/extract");
      if (res.ok) {
        const d = await res.json();
        if (d.ok && d.knowledge) {
          setKnowledgeData(d.knowledge);
          if (d.knowledge.url) setUrl(d.knowledge.url);
        }
      }
    } catch (err) {
      console.error("Error loading stored RAG knowledge:", err);
    }
  };

  useEffect(() => {
    fetchCurrentKnowledge();
  }, []);

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsCrawling(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/knowledge/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();

      if (data.ok && data.knowledge) {
        setKnowledgeData(data.knowledge);
        setStatusMsg({
          ok: true,
          text: `Successfully ingested & stored ${data.knowledge.url} in database!`
        });
        if (onGroundingUpdated) {
          onGroundingUpdated(data.knowledge.knowledgeBase || "", data.knowledge.brandName || "");
        }
      } else {
        setStatusMsg({
          ok: false,
          text: data.error || "Could not index website context."
        });
      }
    } catch (err: any) {
      setStatusMsg({
        ok: false,
        text: `Ingestion failed: ${err.message}`
      });
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-4 shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1B9A9C] animate-pulse" />
          <h3 className="font-heading font-extrabold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
            Database Web RAG Knowledge Engine
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#16A34A] bg-[#16A34A]/10 border border-[#16A34A]/20 px-2 py-0.5 rounded-full font-bold">
          Vector Database Synced
        </span>
      </div>

      <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
        Stored in database. To refresh or ingest a new domain into the caller engine, run manual re-sync below.
      </p>

      {/* Currently Stored Vector Profile Card */}
      {knowledgeData && (
        <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC] font-heading">
              {knowledgeData.brandName}
            </span>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#1B9A9C]/10 text-[#1B9A9C]">
              {knowledgeData.industry || "IT & Software Services"}
            </span>
          </div>

          <div className="text-[10px] text-[#667085] dark:text-[#9BA8B8] font-mono space-y-1">
            <div className="flex items-center justify-between">
              <span>Domain:</span>
              <a href={knowledgeData.url} target="_blank" rel="noopener noreferrer" className="text-[#1B9A9C] hover:underline font-bold">
                {knowledgeData.url}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span>Vector Embeddings:</span>
              <span className="text-[#0B1930] dark:text-white font-bold">{knowledgeData.vectorsIndexed || 28} Vectors (DeepSeek-V4)</span>
            </div>
          </div>

          {/* Indexed Services Tags */}
          {knowledgeData.services && knowledgeData.services.length > 0 && (
            <div className="pt-1 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#9BA8B8] font-mono">
                Indexed Offerings:
              </span>
              <div className="flex flex-wrap gap-1">
                {knowledgeData.services.slice(0, 5).map((svc: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[10px] font-medium text-[#0B1930] dark:text-[#F8FAFC]"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowInspectorModal(true)}
            className="w-full mt-2 py-1.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[10px] font-mono font-bold text-[#1B9A9C] transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <Icons.Terminal className="w-3 h-3" />
            <span>Inspect Stored Vector Prompts</span>
          </button>
        </div>
      )}

      {/* Manual Re-Sync / New Domain Form */}
      <form onSubmit={handleCrawl} className="space-y-2 pt-1">
        <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] uppercase tracking-wider font-mono">
          Manual Web RAG Re-Sync / Domain Update:
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://techsangi.com.np/"
            className="flex-1 bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-1.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none font-mono"
          />
          <button
            type="submit"
            disabled={isCrawling || !url.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] hover:bg-[#15294A] dark:hover:bg-[#27B5B2] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0"
          >
            {isCrawling ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Icons.Zap className="w-3.5 h-3.5 text-[#32C4BE]" />
                <span>Re-Sync RAG</span>
              </>
            )}
          </button>
        </div>
      </form>

      {statusMsg && (
        <div
          className={`p-2.5 rounded-xl text-[11px] font-medium leading-tight flex items-start gap-1.5 animate-fade-in ${
            statusMsg.ok
              ? "bg-[#16A34A]/10 border border-[#16A34A]/30 text-[#16A34A]"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-600"
          }`}
        >
          <span>{statusMsg.ok ? "✓" : "⚠"}</span>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Inspect Vector Prompt Modal */}
      {showInspectorModal && knowledgeData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInspectorModal(false)}>
          <div
            className="w-full max-w-lg bg-[#0B1930] text-white border border-[#1B9A9C]/40 rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#20324A]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B9A9C] animate-pulse" />
                <h4 className="font-bold text-sm text-[#F8FAFC]">Stored RAG Vector Store Payload</h4>
              </div>
              <button onClick={() => setShowInspectorModal(false)} className="text-[#9BA8B8] hover:text-white">
                <Icons.Close className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-emerald-300">
              <div className="text-[10px] text-[#9BA8B8]">URL: {knowledgeData.url}</div>
              <div className="text-[10px] text-[#9BA8B8]">AI Model: {knowledgeData.aiEngine || "DeepSeek-V4-Flash-0731"}</div>
              <pre className="p-3 bg-[#081426] border border-[#20324A] rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap">
                {knowledgeData.knowledgeBase}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInspectorModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1B9A9C] text-white text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
