"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { logger } from "@/lib/logger";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { Icons } from "@/components/Icons";
import { BatchCampaign, BatchFollowupItem, ClinicLocation, DashboardStats, Department, SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/types";
import { AuthGuard } from "@/components/AuthGuard";
import * as XLSX from "xlsx";

export default function BatchPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campaigns, setCampaigns] = useState<BatchCampaign[]>([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);

  // Campaign State
  const [campaignTitle, setCampaignTitle] = useState("Q3 Enterprise Client Outreach & Scheduling Batch");
  const [selectedDept, setSelectedDept] = useState("dept_general");
  const [selectedLang, setSelectedLang] = useState<LanguageCode>("en");
  const [parsedRows, setParsedRows] = useState<BatchFollowupItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<BatchCampaign | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, locsRes, iamRes, batchRes] = await Promise.all([
        fetch("/api/call-results/stats"),
        fetch("/api/locations"),
        fetch("/api/iam"),
        fetch("/api/batch")
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats || null);
      }
      if (locsRes.ok) {
        const d = await locsRes.json();
        setLocations(d.locations || []);
      }
      if (iamRes.ok) {
        const d = await iamRes.json();
        setDepartments(d.departments || []);
      }
      if (batchRes.ok) {
        const d = await batchRes.json();
        setCampaigns(d.campaigns || []);
        if (d.campaigns?.length > 0 && !activeCampaign) {
          setActiveCampaign(d.campaigns[0]);
        }
      }
    } catch (err) {
      logger.error("Error loading batch data:", err);
    }
  }, [activeCampaign]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Default staged clients/contacts if none
  useEffect(() => {
    if (parsedRows.length === 0) {
      setParsedRows([
        {
          id: "item_init_1",
          patientName: "Aarav Sharma",
          phoneNumber: "+919810012345",
          departmentId: "dept_general",
          reason: "Project Milestone & Architecture Consultation",
          customGoal: "Check on client requirements for upcoming cloud architecture phase and confirm availability for brief technical review on Friday.",
          language: "hi",
          status: "queued"
        },
        {
          id: "item_init_2",
          patientName: "Bikash Thapa",
          phoneNumber: "+9779801234567",
          departmentId: "dept_general",
          reason: "Enterprise Fleet Service & Maintenance Schedule",
          customGoal: "Inquire about vehicle availability for scheduled 10,000-mile diagnostic maintenance inspection next Tuesday.",
          language: "ne",
          status: "queued"
        },
        {
          id: "item_init_3",
          patientName: "Carlos Mendez",
          phoneNumber: "+14155552345",
          departmentId: "dept_general",
          reason: "Corporate Contract & Advisory Follow-up",
          customGoal: "Confirm review of revised partnership agreement terms and offer consultation slot with senior legal counsel.",
          language: "es",
          status: "queued"
        },
        {
          id: "item_init_4",
          patientName: "Emily Watson",
          phoneNumber: "+14155559876",
          departmentId: "dept_general",
          reason: "Annual Service Account Review & Scheduling",
          customGoal: "Client account is due for annual service checkup. Offer upcoming booking slots for Tuesday 10am or Thursday 2pm.",
          language: "en",
          status: "queued"
        }
      ]);
    }
  }, [parsedRows.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data.length > 0) {
          const mapped: BatchFollowupItem[] = data.map((row, idx) => {
            const name = row["Contact Name"] || row["Patient Name"] || row["Name"] || row["patient_name"] || row["Client"] || `Contact ${idx + 1}`;
            const phone = row["Phone Number"] || row["Phone"] || row["phone_number"] || row["Mobile"] || "";
            const reason = row["Reason"] || row["Reason for Call"] || row["Condition"] || "Service Follow-up";
            const goal = row["Goal"] || row["Custom Goal"] || row["Instructions"] || `Follow up regarding ${reason}`;
            const lang = (row["Language"] || row["language"] || "en").toLowerCase() as LanguageCode;

            return {
              id: `item_up_${Date.now()}_${idx + 1}`,
              patientName: String(name),
              phoneNumber: String(phone),
              departmentId: selectedDept,
              reason: String(reason),
              customGoal: String(goal),
              language: (["en", "hi", "ne", "es", "fr", "de", "zh"].includes(lang) ? lang : "en") as LanguageCode,
              status: "queued"
            };
          });

          setParsedRows(mapped);
          setCampaignTitle(file.name.replace(/\.[^/.]+$/, "") + " Campaign");
        }
      } catch (err) {
        logger.error("Excel parse error:", err);
        alert("Failed to parse file. Please check format.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDownloadSampleTemplate = () => {
    const sampleData = [
      {
        "Contact Name": "Aarav Sharma",
        "Phone Number": "+919810012345",
        "Department": "Solutions & Engineering",
        "Reason for Call": "Architecture Review Follow-up",
        "Custom Goal": "Confirm availability for technical consultation on Friday",
        "Language": "hi"
      },
      {
        "Contact Name": "Bikash Thapa",
        "Phone Number": "+9779801234567",
        "Department": "Fleet Operations",
        "Reason for Call": "Scheduled Fleet Maintenance",
        "Custom Goal": "Confirm vehicle intake time for 10k mile diagnostics",
        "Language": "ne"
      },
      {
        "Contact Name": "Carlos Mendez",
        "Phone Number": "+14155552345",
        "Department": "Corporate Advisory",
        "Reason for Call": "Partnership Agreement Follow-up",
        "Custom Goal": "Confirm receipt of contracts and offer review call with counsel",
        "Language": "es"
      },
      {
        "Contact Name": "Sarah Jenkins",
        "Phone Number": "+14155558901",
        "Department": "Client Success",
        "Reason for Call": "Annual Account Review",
        "Custom Goal": "Offer available slots this Thursday 2:30pm or Monday 10am",
        "Language": "en"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FollowupContacts");
    XLSX.writeFile(wb, "relay_patient_followup_template.xlsx");
  };

  const batchIdempotencyKeyRef = React.useRef<string | null>(null);

  const handleCreateAndExecuteCampaign = async () => {
    if (parsedRows.length === 0) return;
    setIsExecuting(true);

    if (!batchIdempotencyKeyRef.current) {
      batchIdempotencyKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp_batch_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
    const currentIdempotencyKey = batchIdempotencyKeyRef.current;

    try {
      const createRes = await fetch("/api/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": currentIdempotencyKey
        },
        body: JSON.stringify({
          title: campaignTitle,
          departmentId: selectedDept,
          contacts: parsedRows
        })
      });

      const createData = await createRes.json();
      if (!createData.ok) throw new Error(createData.error);

      const campaign: BatchCampaign = createData.campaign;
      setActiveCampaign(campaign);

      await fetch("/api/batch/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": currentIdempotencyKey
        },
        body: JSON.stringify({ campaignId: campaign.id })
      });

      // Reset on successful initiation so next campaign gets a fresh key
      batchIdempotencyKeyRef.current = null;
      fetchData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Error launching batch campaign: ${errMsg}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["owner", "media_pr", "dept_admin"]}>
      <div className="flex h-screen overflow-hidden bg-[#F7F7F5] dark:bg-[#111111]">
        <Sidebar budget={stats?.budget} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          title="Automated Excel / CSV Batch Follow-up Engine"
          badge="MULTILINGUAL BATCH OPS"
          onRefresh={fetchData}
          onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
        />

        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
          {/* Header Banner */}
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5F2] dark:bg-[#0F8F78]/20 text-[#0F8F78] uppercase font-mono">
                  Autonomous Batch Telephony
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">
                  Hindi &bull; Nepali &bull; Spanish &bull; English
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#151515] dark:text-[#FAFAF8] tracking-tight">
                Upload Patient Follow-up Sheets & Autonomously Dispatch Calls
              </h1>
              <p className="text-xs text-[#666666] dark:text-[#9E9E9E] leading-relaxed">
                Feed your clinic&apos;s daily patient list with specific medical reasons or scheduling goals. CALL-E speaks the patient&apos;s native language, accomplishes the custom goal, and returns structured resolution facts into your EHR.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleDownloadSampleTemplate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F7F7F5] dark:bg-[#282828] hover:bg-[#EFEFEA] border border-[#E8E8E4] dark:border-[#3D3D3D] text-xs font-semibold text-[#151515] dark:text-[#FAFAF8] transition-all shadow-sm"
              >
                <Icons.Download className="w-4 h-4 text-[#0F8F78]" />
                <span>Sample Template</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F8F78] hover:bg-[#0C7D69] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Icons.Upload className="w-4 h-4" />
                <span>Upload Excel / CSV</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Config Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C] rounded-xl p-4 text-xs shadow-sm">
            <div>
              <label className="block font-semibold text-[#151515] dark:text-[#FAFAF8] mb-1">Campaign Title</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full bg-[#F7F7F5] dark:bg-[#111111] border border-[#E8E8E4] dark:border-[#333333] rounded-lg px-3 py-2 text-[#151515] dark:text-[#FAFAF8] focus:border-[#0F8F78] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#151515] dark:text-[#FAFAF8] mb-1">Assign Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-[#F7F7F5] dark:bg-[#111111] border border-[#E8E8E4] dark:border-[#333333] rounded-lg px-3 py-2 text-[#151515] dark:text-[#FAFAF8] focus:border-[#0F8F78] outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#151515] dark:text-[#FAFAF8] mb-1">Default Language</label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as LanguageCode)}
                className="w-full bg-[#F7F7F5] dark:bg-[#111111] border border-[#E8E8E4] dark:border-[#333333] rounded-lg px-3 py-2 text-[#151515] dark:text-[#FAFAF8] focus:border-[#0F8F78] outline-none"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.nativeLabel} ({l.label})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Staged Table */}
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E8E8E4] dark:border-[#2C2C2C] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-sm text-[#151515] dark:text-[#FAFAF8]">
                  Staged Contacts Roster ({parsedRows.length} Patients)
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F7F7F5] dark:bg-[#282828] text-[#8E8E8E] font-mono">
                  Ready for Dispatch
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const newRow: BatchFollowupItem = {
                      id: `item_manual_${Date.now()}`,
                      patientName: "New Patient",
                      phoneNumber: "+15551234567",
                      departmentId: selectedDept,
                      reason: "Scheduled Follow-up",
                      customGoal: "Check in on patient status and confirm upcoming appointment.",
                      language: selectedLang,
                      status: "queued"
                    };
                    setParsedRows([...parsedRows, newRow]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F5] dark:bg-[#282828] text-xs font-semibold text-[#151515] dark:text-[#FAFAF8] hover:bg-[#EFEFEA] transition-colors"
                >
                  <Icons.Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>

                <button
                  onClick={handleCreateAndExecuteCampaign}
                  disabled={isExecuting || parsedRows.length === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0F8F78] hover:bg-[#0C7D69] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 active:scale-95"
                >
                  <Icons.Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? "Dispatching Batch..." : "Launch Batch AI Calls"}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E8E4] dark:border-[#2C2C2C] bg-[#F7F7F5] dark:bg-[#161616] text-[10px] uppercase tracking-wider text-[#8E8E8E] font-semibold">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Medical / Call Reason</th>
                    <th className="py-3 px-4">Custom AI Goal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E4] dark:divide-[#2C2C2C]">
                  {parsedRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-[#F7F7F5] dark:hover:bg-[#242424] transition-colors">
                      <td className="py-3 px-4 font-mono text-[#8E8E8E] text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-[#151515] dark:text-[#FAFAF8] min-w-[140px]">
                        <input
                          type="text"
                          value={row.patientName}
                          onChange={(e) => {
                            const updated = [...parsedRows];
                            updated[idx].patientName = e.target.value;
                            setParsedRows(updated);
                          }}
                          className="bg-transparent border-b border-transparent hover:border-[#E8E8E4] focus:border-[#0F8F78] outline-none text-xs w-full"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-[#151515] dark:text-[#FAFAF8] min-w-[130px]">
                        <input
                          type="text"
                          value={row.phoneNumber}
                          onChange={(e) => {
                            const updated = [...parsedRows];
                            updated[idx].phoneNumber = e.target.value;
                            setParsedRows(updated);
                          }}
                          className="bg-transparent border-b border-transparent hover:border-[#E8E8E4] focus:border-[#0F8F78] outline-none text-xs w-full font-mono"
                        />
                      </td>
                      <td className="py-3 px-4 min-w-[110px]">
                        <select
                          value={row.language}
                          onChange={(e) => {
                            const updated = [...parsedRows];
                            updated[idx].language = e.target.value as LanguageCode;
                            setParsedRows(updated);
                          }}
                          className="bg-[#F7F7F5] dark:bg-[#111111] border border-[#E8E8E4] dark:border-[#333333] rounded px-2 py-1 text-[11px] text-[#151515] dark:text-[#FAFAF8] outline-none"
                        >
                          {SUPPORTED_LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>{l.nativeLabel}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-[#666666] dark:text-[#9E9E9E] min-w-[180px]">
                        <input
                          type="text"
                          value={row.reason}
                          onChange={(e) => {
                            const updated = [...parsedRows];
                            updated[idx].reason = e.target.value;
                            setParsedRows(updated);
                          }}
                          className="bg-transparent border-b border-transparent hover:border-[#E8E8E4] focus:border-[#0F8F78] outline-none text-xs w-full truncate"
                        />
                      </td>
                      <td className="py-3 px-4 text-[#8E8E8E] min-w-[240px]">
                        <input
                          type="text"
                          value={row.customGoal}
                          onChange={(e) => {
                            const updated = [...parsedRows];
                            updated[idx].customGoal = e.target.value;
                            setParsedRows(updated);
                          }}
                          className="bg-transparent border-b border-transparent hover:border-[#E8E8E4] focus:border-[#0F8F78] outline-none text-xs w-full truncate"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            row.status === "completed"
                              ? "bg-[#E8F5F2] text-[#0F8F78] border border-[#B2DFD7]"
                              : row.status === "dialing"
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 animate-pulse"
                              : row.status === "failed"
                              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              : "bg-[#EFEFEA] text-[#8E8E8E] border border-[#E8E8E4]"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setParsedRows(parsedRows.filter((_, i) => i !== idx));
                          }}
                          className="p-1 rounded text-[#8E8E8E] hover:text-rose-600 transition-colors"
                          title="Remove row"
                        >
                          <Icons.Close className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
