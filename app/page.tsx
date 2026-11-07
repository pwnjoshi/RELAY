"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { TriggerModal } from "@/components/TriggerModal";
import { useCurrency } from "@/lib/currency";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { RelayLifecycleRoadmap } from "@/components/RelayLifecycleRoadmap";
import { ClinicLocation } from "@/lib/types";

export default function LandingPage() {
  const { formatPrice, currencyConfig } = useCurrency();
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.user) {
          setCurrentUser(d.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));

    fetch("/api/locations")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setLocations(d.locations || []);
      })
      .catch(() => {});
  }, []);

  // Interactive Live Preview State
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<"overflow" | "batch" | "safety">("overflow");

  // ROI Calculator State
  const [missedCallsPerDay, setMissedCallsPerDay] = useState(25);
  const [avgTicketValue, setAvgTicketValue] = useState(250);
  const conversionRate = 0.428;
  const monthlyRevenueRecovered = Math.round(missedCallsPerDay * 30 * conversionRate * avgTicketValue);
  const annualRevenueRecovered = monthlyRevenueRecovered * 12;

  // Conversational Telephony Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAudioTurn, setActiveAudioTurn] = useState(0);
  const [audioStreamLang, setAudioStreamLang] = useState<"hi" | "ne" | "es">("hi");
  const [audioProgress, setAudioProgress] = useState(0);

  const isPlayingAudioRef = useRef<boolean>(false);
  const audioSessionIdRef = useRef<number>(0);
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAllAudio = () => {
    audioSessionIdRef.current += 1;
    isPlayingAudioRef.current = false;
    if (turnTimerRef.current) {
      clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsPlayingAudio(false);
  };

  const audioDialogues = {
    hi: {
      title: "Inbound Call Intercept (Hindi & English Bilingual)",
      caller: "+91 98100 12345 • Aarav Sharma",
      turns: [
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "Namaste! You've reached Apex Operations Hub. I noticed you called our main line — how can I help you today?",
          speakText: "Namaste! You've reached Apex Operations Hub. I noticed you called our main line — how can I help you today?",
          isAI: true,
          lang: "en-IN"
        },
        {
          speaker: "Aarav",
          role: "Caller",
          displayText: "Haanji, I had a consultation on Tuesday and had a quick question. Can I book a follow-up with Dr. Sarah for Friday?",
          speakText: "Haanji, I had a consultation on Tuesday and had a quick question. Can I book a follow-up with Doctor Sarah for Friday?",
          isAI: false,
          lang: "en-IN"
        },
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "I see your account, Aarav. Dr. Sarah has an opening tomorrow, Friday at 11:30 AM or 3:00 PM. Which works best for you?",
          speakText: "I see your account, Aarav. Doctor Sarah has an opening tomorrow, Friday at 11:30 AM or 3:00 PM. Which works best for you?",
          isAI: true,
          lang: "en-IN"
        },
        {
          speaker: "Aarav",
          role: "Caller",
          displayText: "Friday 11:30 AM is perfect, thank you so much.",
          speakText: "Friday 11:30 AM is perfect, thank you so much.",
          isAI: false,
          lang: "en-IN"
        },
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "Confirmed! Your slot with Dr. Sarah for Friday 11:30 AM is locked in. I've dispatched an SMS confirmation to your mobile.",
          speakText: "Confirmed! Your slot with Doctor Sarah for Friday 11:30 AM is locked in. I've dispatched an SMS confirmation to your mobile.",
          isAI: true,
          lang: "en-IN"
        }
      ]
    },
    ne: {
      title: "Automated Patient Recall & Checkup (नेपाली)",
      caller: "+977 98012 34567 • Bikash Thapa",
      turns: [
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "नमस्ते Bikash जी! Westside Practice बाट बोलिरहेको छु। तपाईंको scheduled annual review को समय भएको छ।",
          speakText: "नमस्ते विकास जी! वेस्टसाइड सर्भिसबाट बोलिरहेको छु। तपाईंको वार्षिक रिभ्युको समय भएको छ।",
          isAI: true,
          lang: "hi-IN"
        },
        {
          speaker: "Bikash",
          role: "Patient Recall",
          displayText: "हजुर, मैले review गर्नु पर्ने थियो। कहिले आउन मिल्छ consultation को लागि?",
          speakText: "हजुर, मैले रिभ्यु गर्नु पर्ने थियो। कहिले आउन मिल्छ कन्सलटेसन को लागि?",
          isAI: false,
          lang: "hi-IN"
        },
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "Dr. Marcus सँग Sunday २ PM मा slot खाली छ। तपाईंलाई मिल्छ?",
          speakText: "डाक्टर मार्कस सँग आइतबार दुई बजे समय खाली छ। तपाईंलाई मिल्छ?",
          isAI: true,
          lang: "hi-IN"
        },
        {
          speaker: "Bikash",
          role: "Patient Recall",
          displayText: "हुन्छ, Sunday २ PM मा confirm गरिदिनुस्।",
          speakText: "हुन्छ, आइतबार दुई बजे कन्फर्म गरिदिनुस्।",
          isAI: false,
          lang: "hi-IN"
        },
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "Done! तपाईंको consultation Sunday २ PM मा confirm भयो। SMS receipt पठाइदिएको छु।",
          speakText: "डन! तपाईंको कन्सलटेसन आइतबार दुई बजे कन्फर्म भयो। एसएमएस रसिद पठाइदिएको छु।",
          isAI: true,
          lang: "hi-IN"
        }
      ]
    },
    es: {
      title: "Priority Urgent Escalation (Español)",
      caller: "+1 (415) 555-0199 • Carlos Mendez",
      turns: [
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "Hola Carlos, has llamado a la línea de soporte prioritario de Apex. ¿En qué te puedo asistir hoy?",
          speakText: "Hola Carlos, has llamado a la línea de soporte prioritario de Apex. ¿En qué te puedo asistir hoy?",
          isAI: true,
          lang: "es-ES"
        },
        {
          speaker: "Carlos",
          role: "Caller",
          displayText: "Hola Sarah, necesito asistencia urgente con mi cuenta de operaciones empresariales.",
          speakText: "Hola Sarah, necesito asistencia urgente con mi cuenta de operaciones empresariales.",
          isAI: false,
          lang: "es-ES"
        },
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "Entendido Carlos. He registrado los detalles y enviado una alerta prioritaria a nuestro director de guardia.",
          speakText: "Entendido Carlos. He registrado los detalles y enviado una alerta prioritaria a nuestro director de guardia.",
          isAI: true,
          lang: "es-ES"
        },
        {
          speaker: "Carlos",
          role: "Caller",
          displayText: "Muchas gracias Sarah por la rápida respuesta.",
          speakText: "Muchas gracias Sarah por la rápida respuesta.",
          isAI: false,
          lang: "es-ES"
        },
        {
          speaker: "Sarah",
          role: "Relay AI Agent",
          displayText: "De nada Carlos, nuestro director te contactará en menos de dos minutos.",
          speakText: "De nada Carlos, nuestro director te contactará en menos de dos minutos.",
          isAI: true,
          lang: "es-ES"
        }
      ]
    }
  };

  const currentDialogue = audioDialogues[audioStreamLang];

  const playSpeechTurn = (turnIndex: number, sessionId: number) => {
    if (typeof window === "undefined") return;
    if (!isPlayingAudioRef.current || sessionId !== audioSessionIdRef.current) return;

    if (turnIndex >= currentDialogue.turns.length) {
      stopAllAudio();
      setActiveAudioTurn(0);
      setAudioProgress(100);
      return;
    }

    setActiveAudioTurn(turnIndex);
    setAudioProgress(Math.round(((turnIndex + 1) / currentDialogue.turns.length) * 100));

    const turn = currentDialogue.turns[turnIndex];

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }

    // Amazon Polly Neural Synthesis Gateway
    fetch("/api/voice/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: turn.speakText || turn.displayText,
        lang: audioStreamLang,
        isAI: turn.isAI
      })
    })
      .then(async (res) => {
        if (!isPlayingAudioRef.current || sessionId !== audioSessionIdRef.current) return;
        const contentType = res.headers.get("content-type") || "";

        if (res.ok && contentType.includes("audio")) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (!isPlayingAudioRef.current || sessionId !== audioSessionIdRef.current) return;
            if (turnIndex + 1 < currentDialogue.turns.length) {
              turnTimerRef.current = setTimeout(() => {
                if (isPlayingAudioRef.current && sessionId === audioSessionIdRef.current) {
                  playSpeechTurn(turnIndex + 1, sessionId);
                }
              }, 400);
            } else {
              stopAllAudio();
              setActiveAudioTurn(0);
            }
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            playSpeechSynthesisFallback(turnIndex, sessionId);
          };

          audio.play().catch(() => playSpeechSynthesisFallback(turnIndex, sessionId));
        } else {
          playSpeechSynthesisFallback(turnIndex, sessionId);
        }
      })
      .catch(() => {
        playSpeechSynthesisFallback(turnIndex, sessionId);
      });
  };

  const playSpeechSynthesisFallback = (turnIndex: number, sessionId: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!isPlayingAudioRef.current || sessionId !== audioSessionIdRef.current) return;

    const turn = currentDialogue.turns[turnIndex];
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(turn.speakText || turn.displayText);
    utterance.lang = turn.lang || "en-US";

    utterance.onend = () => {
      if (!isPlayingAudioRef.current || sessionId !== audioSessionIdRef.current) return;
      if (turnIndex + 1 < currentDialogue.turns.length) {
        turnTimerRef.current = setTimeout(() => {
          if (isPlayingAudioRef.current && sessionId === audioSessionIdRef.current) {
            playSpeechTurn(turnIndex + 1, sessionId);
          }
        }, 400);
      } else {
        stopAllAudio();
        setActiveAudioTurn(0);
      }
    };

    setTimeout(() => {
      if (isPlayingAudioRef.current && sessionId === audioSessionIdRef.current) {
        window.speechSynthesis.speak(utterance);
      }
    }, 40);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudioRef.current) {
      stopAllAudio();
    } else {
      audioSessionIdRef.current += 1;
      const currentSessionId = audioSessionIdRef.current;
      isPlayingAudioRef.current = true;
      setIsPlayingAudio(true);
      playSpeechTurn(0, currentSessionId);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const workflowPreviews = {
    overflow: {
      title: "Inbound Missed-Call Intercept (Hindi & English)",
      caller: "+91 98100 12345 • Aarav Sharma",
      turns: [
        { speaker: "Sarah", role: "Relay AI Agent", text: "Namaste! You've reached Apex Operations Hub. I noticed you called our main line — how can I help you today?" },
        { speaker: "Aarav", role: "Caller", text: "Haanji, I wanted to confirm my service consultation appointment for Friday morning." },
        { speaker: "Sarah", role: "Relay AI Agent", text: "I see your account, Aarav. We have an opening with our lead specialist this Friday at 11:30 AM or 3:00 PM. Which works best?" },
        { speaker: "Aarav", role: "Caller", text: "Friday 11:30 AM is perfect, thank you." },
        { speaker: "Sarah", role: "Relay AI Agent", text: "Booked! I've confirmed your slot and sent an SMS confirmation to your mobile." }
      ],
      outcome: {
        appointment_booked: true,
        datetime: "2026-08-28T11:30:00+05:30",
        department: "Consulting & Service",
        disposition: "confirmed_booking",
        revenue_secured: "$320"
      }
    },
    batch: {
      title: "Automated Patient Recall Campaign (Nepali)",
      caller: "+977 98012 34567 • Bikash Thapa",
      turns: [
        { speaker: "Sarah", role: "Relay AI Agent", text: "नमस्ते Bikash जी! Westside Practice बाट बोलिरहेको छु। तपाईंको scheduled annual review को समय भएको छ।" },
        { speaker: "Bikash", role: "Patient Recall", text: "हजुर, मैले review गर्नु पर्ने थियो। कहिले slot खाली छ?" },
        { speaker: "Sarah", role: "Relay AI Agent", text: "हामी सँग Sunday २ PM मा slot खाली छ। तपाईंलाई मिल्छ?" },
        { speaker: "Bikash", role: "Patient Recall", text: "हुन्छ, Sunday २ PM मा confirm गरिदिनुस्।" },
        { speaker: "Sarah", role: "Relay AI Agent", text: "Done! तपाईंको consultation Sunday २ PM मा confirm भयो।" }
      ],
      outcome: {
        appointment_booked: true,
        datetime: "2026-08-30T14:00:00+05:45",
        department: "Client Services",
        disposition: "annual_review_confirmed",
        revenue_secured: "$450"
      }
    },
    safety: {
      title: "Priority Urgent Escalation & Policy Guardrails",
      caller: "+1 (415) 555-0199 • Carlos Mendez",
      turns: [
        { speaker: "Sarah", role: "Relay AI Agent", text: "Apex Priority Support triage line. How can I assist you?" },
        { speaker: "Carlos", role: "Caller", text: "I have an urgent account escalation that needs immediate senior manager attention." },
        { speaker: "Sarah", role: "Relay AI Agent", text: "Carlos, because this is marked as high priority, I am immediately routing your details and dispatching an emergency SMS alert to our on-call operations director. Please hold on line while we connect you." }
      ],
      outcome: {
        appointment_booked: false,
        emergency_escalation: true,
        on_call_director_alerted: "Operations Director (SMS Sent)",
        escalation_reason: "High Priority Account Triage",
        disposition: "emergency_transfer"
      }
    }
  };

  const currentPreview = workflowPreviews[activeWorkflowTab];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081220] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors">
      <PublicHeader onOpenTriggerModal={() => setIsTriggerModalOpen(true)} />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="px-6 sm:px-10 lg:px-16 pt-16 pb-20 max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Category Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] text-[#5B6B82] dark:text-[#94A3B8] text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1B9A9C] dark:bg-[#2EC4C0]" />
            <span>Autonomous Voice Operations for Modern Healthcare & Multi-Location Networks</span>
          </div>

          {/* Clean, Powerful Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC] leading-[1.15] max-w-4xl">
            Every customer call reaches the right outcome.
          </h1>

          <p className="text-base sm:text-lg text-[#5B6B82] dark:text-[#94A3B8] max-w-2xl leading-relaxed mt-5">
            Relay intercepts missed calls, automates patient recall campaigns, and executes end-to-end phone tasks with sub-second latency and verified EHR/CRM synchronization.
          </p>

          {/* Hero Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-8">
            <button
              type="button"
              onClick={() => setIsTriggerModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B1930] dark:bg-[#2EC4C0] dark:text-[#081220] hover:bg-[#15294A] text-white font-semibold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Icons.PhoneCall className="w-4 h-4 text-[#1B9A9C] dark:text-[#081220]" />
              <span>Test Real Phone Call</span>
            </button>

            {currentUser ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] hover:border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] font-semibold text-sm transition-all"
              >
                <Icons.Activity className="w-4 h-4 text-[#1B9A9C]" />
                <span>Go to Console &rarr;</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] hover:border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] font-semibold text-sm transition-all"
              >
                <span>Sign In to Console</span>
              </Link>
            )}

            <a
              href="#architecture"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930] dark:hover:text-[#F8FAFC] text-sm font-medium transition-colors"
            >
              <span>Explore Architecture &darr;</span>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#5B6B82] dark:text-[#94A3B8] pt-8">
            <span className="flex items-center gap-1.5 font-medium">
              <Icons.Check className="w-3.5 h-3.5 text-[#16A34A]" /> Sub-14s Inbound Intercept
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Icons.Check className="w-3.5 h-3.5 text-[#16A34A]" /> Native Hindi, Nepali, Spanish & English
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Icons.Check className="w-3.5 h-3.5 text-[#16A34A]" /> Two-Way Google Calendar Sync
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Icons.Check className="w-3.5 h-3.5 text-[#16A34A]" /> Fail-Closed Emergency Safety
            </span>
          </div>

          {/* 2. Conversational Telephony Studio Player */}
          <div className="mt-14 w-full max-w-3xl bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] rounded-2xl p-6 sm:p-8 shadow-sm text-left space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#E4E8E7] dark:border-[#1E3048]">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${isPlayingAudio ? "bg-[#16A34A] animate-ping" : "bg-[#1B9A9C] dark:bg-[#2EC4C0]"}`} />
                <div>
                  <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] block">
                    {currentDialogue.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#5B6B82] dark:text-[#94A3B8]">
                    {currentDialogue.caller}
                  </span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-[#F3F5F4] dark:bg-[#081220] p-1 rounded-xl border border-[#E4E8E7] dark:border-[#1E3048] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    setAudioStreamLang("hi");
                    setActiveAudioTurn(0);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    audioStreamLang === "hi"
                      ? "bg-white dark:bg-[#0E1B2E] text-[#0B1930] dark:text-[#F8FAFC] shadow-xs font-semibold"
                      : "text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930]"
                  }`}
                >
                  हिन्दी / EN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    setAudioStreamLang("ne");
                    setActiveAudioTurn(0);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    audioStreamLang === "ne"
                      ? "bg-white dark:bg-[#0E1B2E] text-[#0B1930] dark:text-[#F8FAFC] shadow-xs font-semibold"
                      : "text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930]"
                  }`}
                >
                  नेपाली
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    setAudioStreamLang("es");
                    setActiveAudioTurn(0);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    audioStreamLang === "es"
                      ? "bg-white dark:bg-[#0E1B2E] text-[#0B1930] dark:text-[#F8FAFC] shadow-xs font-semibold"
                      : "text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930]"
                  }`}
                >
                  Español
                </button>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081220] border border-[#E4E8E7] dark:border-[#1E3048]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                    isPlayingAudio
                      ? "bg-[#1B9A9C] dark:bg-[#2EC4C0] text-white dark:text-[#081220]"
                      : "bg-[#0B1930] dark:bg-white text-white dark:text-[#081220]"
                  }`}
                  aria-label={isPlayingAudio ? "Pause Dialogue" : "Play Dialogue"}
                >
                  {isPlayingAudio ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4 ml-0.5" />}
                </button>

                <div>
                  <span className="text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] block">
                    {isPlayingAudio ? "Synthesizing Speech via Amazon Polly..." : "Audition Conversational Speech"}
                  </span>
                  <span className="text-[10px] text-[#5B6B82] dark:text-[#94A3B8] font-mono">
                    Turn {activeAudioTurn + 1} of {currentDialogue.turns.length} • Powered by AWS Polly Neural
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 h-5">
                {[30, 60, 95, 45, 80, 50, 75, 40, 20].map((h, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-200 ${
                      isPlayingAudio ? "bg-[#1B9A9C] dark:bg-[#2EC4C0] animate-pulse" : "bg-[#CBD5E1] dark:bg-[#1E3048]"
                    }`}
                    style={{ height: isPlayingAudio ? `${h}%` : "25%" }}
                  />
                ))}
              </div>
            </div>

            {/* Transcript Flow */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {currentDialogue.turns.map((turn, idx) => {
                const isActive = idx === activeAudioTurn && isPlayingAudio;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs transition-colors border ${
                      isActive
                        ? "bg-[#1B9A9C]/10 dark:bg-[#2EC4C0]/10 border-[#1B9A9C] dark:border-[#2EC4C0]"
                        : "bg-[#FAFAF8] dark:bg-[#081220] border-[#E4E8E7] dark:border-[#1E3048]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
                          {turn.speaker}
                        </span>
                        <span className="text-[10px] font-mono text-[#5B6B82] dark:text-[#94A3B8]">
                          ({turn.role})
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-mono text-[#1B9A9C] dark:text-[#2EC4C0] font-semibold animate-pulse">
                          Speaking Now
                        </span>
                      )}
                    </div>
                    <p className="text-[#0B1930] dark:text-[#F8FAFC] leading-relaxed">
                      &ldquo;{turn.displayText}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Architecture & 7-Stage Pipeline */}
        <section id="architecture" className="px-6 sm:px-10 lg:px-16 py-16 bg-white dark:bg-[#0A1526] border-y border-[#E4E8E7] dark:border-[#1E3048] transition-colors">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#1B9A9C] dark:text-[#2EC4C0]">
                Pipeline Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
                How Relay Operates End-to-End
              </h2>
              <p className="text-xs sm:text-sm text-[#5B6B82] dark:text-[#94A3B8]">
                Every incoming ring or scheduled batch contact moves through an autonomous chain from detection to verified calendar outcome.
              </p>
            </div>

            <RelayLifecycleRoadmap />
          </div>
        </section>

        {/* 4. Interactive ROI / Revenue Recovery Calculator */}
        <section className="px-6 sm:px-10 lg:px-16 py-16 max-w-5xl mx-auto w-full">
          <div className="text-center space-y-2 mb-10">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#1B9A9C] dark:text-[#2EC4C0]">
              Business Economics
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
              Estimate Recovered Business Revenue
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6B82] dark:text-[#94A3B8]">
              See how much missed-call and recall revenue Relay reclaims for your operations each month.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] rounded-2xl p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <label htmlFor="landingMissedCalls" className="text-[#0B1930] dark:text-[#F8FAFC]">
                    Missed Calls / Inquiries per Day:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="landingMissedCalls"
                      type="number"
                      min="1"
                      max="500"
                      value={missedCallsPerDay}
                      onChange={(e) => setMissedCallsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2 py-1 rounded-lg bg-[#FAFAF8] dark:bg-[#081220] border border-[#E4E8E7] dark:border-[#1E3048] focus:border-[#1B9A9C] text-right font-mono font-bold text-xs text-[#1B9A9C] dark:text-[#2EC4C0] outline-none"
                    />
                    <span className="font-mono text-xs text-[#5B6B82] dark:text-[#94A3B8]">calls</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={missedCallsPerDay}
                  onChange={(e) => setMissedCallsPerDay(Number(e.target.value))}
                  className="w-full accent-[#1B9A9C] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <label htmlFor="landingTicketValue" className="text-[#0B1930] dark:text-[#F8FAFC]">
                    Average Deal / Service Value:
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-[#5B6B82] dark:text-[#94A3B8]">{currencyConfig.symbol}</span>
                    <input
                      id="landingTicketValue"
                      type="number"
                      min="1"
                      max="5000000"
                      value={Math.round(avgTicketValue * currencyConfig.rate)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1;
                        setAvgTicketValue(val / currencyConfig.rate);
                      }}
                      className="w-28 px-2 py-1 rounded-lg bg-[#FAFAF8] dark:bg-[#081220] border border-[#E4E8E7] dark:border-[#1E3048] focus:border-[#1B9A9C] text-right font-mono font-bold text-xs text-[#1B9A9C] dark:text-[#2EC4C0] outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={avgTicketValue}
                  onChange={(e) => setAvgTicketValue(Number(e.target.value))}
                  className="w-full accent-[#1B9A9C] cursor-pointer"
                />
              </div>

              <div className="pt-2 text-xs text-[#5B6B82] dark:text-[#94A3B8] space-y-1">
                <div className="flex items-center justify-between">
                  <span>Benchmark Capture Rate:</span>
                  <span className="font-mono font-bold text-[#0B1930] dark:text-[#F8FAFC]">42.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Carrier Answer Latency:</span>
                  <span className="font-mono font-bold text-[#0B1930] dark:text-[#F8FAFC]">&lt; 14 seconds</span>
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="p-6 sm:p-8 rounded-xl bg-[#0B1930] text-[#F8FAFC] space-y-5 text-center flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block">
                  Estimated Monthly Recovered Revenue ({currencyConfig.code})
                </span>
                <div className="text-4xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
                  {formatPrice(monthlyRevenueRecovered)}
                </div>
                <span className="text-xs text-[#2EC4C0] font-mono block">
                  +{formatPrice(annualRevenueRecovered)} / year in recaptured appointments & bookings
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsTriggerModalOpen(true)}
                className="w-full py-3 rounded-lg bg-[#1B9A9C] hover:bg-[#27B5B2] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Launch Live Test Call &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* 5. Interactive Simulation Workbench */}
        <section className="px-6 sm:px-10 lg:px-16 py-16 bg-[#0B1930] text-[#F8FAFC]">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#2EC4C0]">
                Live Workflow Simulation
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">
                Structured Telephony In Action
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
                Select an operational workflow below to see how spoken conversation translates into validated calendar commitments.
              </p>

              {/* Tabs */}
              <div className="inline-flex items-center gap-1 bg-[#081220] p-1 rounded-xl border border-[#1E3048] text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab("overflow")}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeWorkflowTab === "overflow" ? "bg-[#10223A] text-white font-semibold" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Inbound Overflow
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab("batch")}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeWorkflowTab === "batch" ? "bg-[#10223A] text-white font-semibold" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Patient Recall
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab("safety")}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeWorkflowTab === "safety" ? "bg-[#10223A] text-white font-semibold" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Emergency Triage
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-[#0E1B2E] border border-[#1E3048] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3048] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2EC4C0]" />
                  <span className="font-heading font-bold text-sm text-white">
                    {currentPreview.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8] bg-[#081220] px-2 py-0.5 rounded border border-[#1E3048]">
                  {currentPreview.caller}
                </span>
              </div>

              {/* Dialogue Turns */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {currentPreview.turns.map((turn, i) => {
                  const isAgent = turn.speaker.startsWith("Sarah");
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        isAgent
                          ? "bg-[#081220] border border-[#1E3048] text-[#F8FAFC]"
                          : "bg-[#13243C] border border-[#1E3048] text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">
                          {turn.speaker} <span className="text-[10px] text-[#94A3B8] font-normal font-mono">({turn.role})</span>
                        </span>
                        <span className="text-[#64748B] font-mono text-[10px]">Turn {i + 1}</span>
                      </div>
                      <p className="leading-relaxed text-[#F8FAFC]">&ldquo;{turn.text}&rdquo;</p>
                    </div>
                  );
                })}
              </div>

              {/* Schema Outcome */}
              <div className="pt-3 border-t border-[#1E3048] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
                    Structured Outcome Synchronized to CRM
                  </span>
                  <span className="text-[10px] text-[#2EC4C0] font-mono font-medium flex items-center gap-1">
                    <Icons.Check className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <pre className="p-3 rounded-lg bg-[#081220] border border-[#1E3048] text-[11px] font-mono text-[#2EC4C0] overflow-x-auto">
                  {JSON.stringify(currentPreview.outcome, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Infrastructure Comparison */}
        <section className="px-6 sm:px-10 lg:px-16 py-16 max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#1B9A9C] dark:text-[#2EC4C0]">
              Operational Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
              Why Businesses Switch to Relay
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6B82] dark:text-[#94A3B8]">
              Comparing traditional manual reception, legacy IVR phone trees, and Relay autonomous voice operations.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E8E7] dark:border-[#1E3048] bg-[#F3F5F4] dark:bg-[#081220] text-[10px] uppercase font-bold text-[#5B6B82] dark:text-[#94A3B8] font-mono">
                  <th className="py-3.5 px-5">Capability</th>
                  <th className="py-3.5 px-5">Manual Reception</th>
                  <th className="py-3.5 px-5">Legacy IVR Menu</th>
                  <th className="py-3.5 px-5 text-[#1B9A9C] dark:text-[#2EC4C0] font-bold bg-[#1B9A9C]/5">Relay Voice Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8E7] dark:divide-[#1E3048]">
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Speed to Answer</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">3–5 minutes (or voicemail)</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">Instant (robotic menu)</td>
                  <td className="py-3.5 px-5 font-bold text-[#0B1930] dark:text-[#F8FAFC] bg-[#1B9A9C]/5">&lt; 14s (Zero Hold Time)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Multilingual Fluency</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">Depends on available staff</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">Pre-recorded audio prompts only</td>
                  <td className="py-3.5 px-5 font-bold text-[#0B1930] dark:text-[#F8FAFC] bg-[#1B9A9C]/5">Fluent Hindi, Nepali, Spanish & English</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Outbound Batch Recalls</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">Manual 1-by-1 dialing</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">Blast robocalls (low engagement)</td>
                  <td className="py-3.5 px-5 font-bold text-[#0B1930] dark:text-[#F8FAFC] bg-[#1B9A9C]/5">Autonomous scheduled conversation campaigns</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">CRM & Calendar Sync</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">Manual data entry after call</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">No real-time calendar synchronization</td>
                  <td className="py-3.5 px-5 font-bold text-[#0B1930] dark:text-[#F8FAFC] bg-[#1B9A9C]/5">Direct two-way Google Calendar & database sync</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Emergency Protocol</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">Manual call transfer</td>
                  <td className="py-3.5 px-5 text-[#5B6B82] dark:text-[#94A3B8]">None (caller hangs up)</td>
                  <td className="py-3.5 px-5 font-bold text-[#0B1930] dark:text-[#F8FAFC] bg-[#1B9A9C]/5">Fail-closed triage & instant on-call SMS alert</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Final Call to Action */}
        <section className="px-6 sm:px-10 lg:px-16 py-16 max-w-4xl mx-auto text-center space-y-6">
          <div className="bg-[#0B1930] dark:bg-[#0E1B2E] border border-[#20324A] rounded-2xl p-8 sm:p-12 space-y-5 text-white">
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
              Ready to automate your telephone operations?
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto">
              Test with a live telephone call to your number in under two minutes, or explore the developer API documentation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTriggerModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-[#1B9A9C] dark:bg-[#2EC4C0] dark:text-[#081220] hover:bg-[#27B5B2] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Place Live Test Call &rarr;
              </button>
              <Link
                href="/docs"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
              >
                Read Developer Docs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />

      <TriggerModal
        isOpen={isTriggerModalOpen}
        locations={locations}
        recallList={[]}
        onClose={() => setIsTriggerModalOpen(false)}
        onCallLaunched={() => {}}
      />
    </div>
  );
}
