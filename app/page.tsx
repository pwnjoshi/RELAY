"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { RelayLogo } from "@/components/RelayLogo";
import { Icons } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TriggerModal } from "@/components/TriggerModal";
import { useCurrency } from "@/lib/currency";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { ClinicLocation } from "@/lib/types";

// Constant array defined OUTSIDE component so interval is never reset by re-renders
const ROTATING_WORDS = ["outcome", "department", "appointment", "resolution", "revenue"];

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
  }, []);

  // Reliable Word Rotation State
  const [wordIndex, setWordIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setFadeState("in");
      }, 250);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleManualClick = () => {
    setFadeState("out");
    setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      setFadeState("in");
    }, 150);
  };

  // Subtle Mouse Parallax Effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20;
    const y = (clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  // Interactive Live Preview State
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<"overflow" | "batch" | "safety">("overflow");

  // ROI Calculator State
  const [missedCallsPerDay, setMissedCallsPerDay] = useState(25);
  const [avgTicketValue, setAvgTicketValue] = useState(250);
  const conversionRate = 0.428;
  const monthlyRevenueRecovered = Math.round(missedCallsPerDay * 30 * conversionRate * avgTicketValue);
  const annualRevenueRecovered = monthlyRevenueRecovered * 12;

  // Authentic Telephony Audio Player State & Cancellation Controller
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
          displayText: "Namaste! You've reached Apex Operations. I noticed you called our main line — how can I help you today?",
          speakText: "Namaste! You've reached Apex Operations. I noticed you called our main line — how can I help you today?",
          isAI: true,
          lang: "en-IN"
        },
        {
          speaker: "Aarav",
          role: "Inbound Client",
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
          role: "Inbound Client",
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
      title: "Automated Client Recall & Checkup (नेपाली)",
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
          role: "Client Recall",
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
          role: "Client Recall",
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
          role: "Corporate Client",
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
          role: "Corporate Client",
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

  // Play natural telephony sound effect using Web Audio API
  const playTelephonyChime = async () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Dual-frequency PBX telecom dial & connect chime (440Hz + 480Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Play subtle acoustic voice carrier presence per turn
  const playTurnBeep = async (isAI: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") await ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(isAI ? 660 : 420, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  };

  // Conversational Speech Synthesizer with studio-grade Neural Human Audio MP3s
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
    playTurnBeep(turn.isAI);

    // Stop any previous audio element
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }

    // 1. Primary: Direct Neural Human Audio MP3 Stream
    const mp3Path = `/audio/dialogues/${audioStreamLang}_turn_${turnIndex}.mp3`;
    const audio = new Audio(mp3Path);
    currentAudioRef.current = audio;

    audio.onended = () => {
      if (!isPlayingAudioRef.current || sessionId !== audioSessionIdRef.current) return;
      if (turnIndex + 1 < currentDialogue.turns.length) {
        // Natural human conversational turn-taking pause (500ms)
        turnTimerRef.current = setTimeout(() => {
          if (isPlayingAudioRef.current && sessionId === audioSessionIdRef.current) {
            playSpeechTurn(turnIndex + 1, sessionId);
          }
        }, 500);
      } else {
        stopAllAudio();
        setActiveAudioTurn(0);
      }
    };

    audio.onerror = () => {
      // 2. Transparent Fallback: SpeechSynthesis if MP3 cannot be decoded
      if (!isPlayingAudioRef.current || sessionId !== audioSessionIdRef.current) return;
      playSpeechSynthesisFallback(turnIndex, sessionId);
    };

    audio.play().catch(() => {
      // Fallback if autoplay policy blocked audio
      playSpeechSynthesisFallback(turnIndex, sessionId);
    });
  };

  // Fallback speech synthesizer in case local network blocks media asset loading
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
        }, 500);
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
      playTelephonyChime();
      playSpeechTurn(0, currentSessionId);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setLocations(d.locations || []);
      });
  }, []);

  const relaySteps = [
    { num: "01", step: "CALL", title: "Inbound or Outbound Trigger", desc: "A customer rings your main line or a scheduled batch campaign triggers." },
    { num: "02", step: "RECEIVE", title: "Zero-Latency SIP Intercept", desc: "Relay intercepts the audio connection in under 14 seconds." },
    { num: "03", step: "UNDERSTAND", title: "Multilingual Natural Language", desc: "Listens in Hindi, Nepali, Spanish, or English and extracts caller intent." },
    { num: "04", step: "DECIDE", title: "Intelligent Decision Engine", desc: "Evaluates policy guidelines, calendar availability, and caller history." },
    { num: "05", step: "ROUTE", title: "Team & Department Routing", desc: "Directs to specialized departments, managers, or on-call staff alerts." },
    { num: "06", step: "ACT", title: "Autonomous Resolution", desc: "Confirms bookings, answers complex queries, and executes workflow actions." },
    { num: "07", step: "OUTCOME", title: "Structured CRM / Database Sync", desc: "Structured JSON committed directly to your enterprise database or CRM." },
  ];

  const workflowPreviews = {
    overflow: {
      title: "Inbound Missed-Call Intercept (Hindi & English)",
      caller: "+91 98100 12345 • Aarav Sharma",
      turns: [
        { speaker: "Sarah", role: "Relay AI Agent", text: "Namaste! You've reached Apex Operations Hub. I noticed you called our main line — how can I help you today?" },
        { speaker: "Aarav", role: "Inbound Client", text: "Haanji, I wanted to confirm my service consultation appointment for Friday morning." },
        { speaker: "Sarah", role: "Relay AI Agent", text: "I see your account, Aarav. We have an opening with our lead specialist this Friday at 11:30 AM or 3:00 PM. Which works best?" },
        { speaker: "Aarav", role: "Inbound Client", text: "Friday 11:30 AM is perfect, thank you." },
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
      title: "Automated Excel Lead & Client Recall (Nepali)",
      caller: "+977 98012 34567 • Bikash Thapa",
      turns: [
        { speaker: "Sarah", role: "Relay AI Agent", text: "नमस्ते Bikash जी! Westside Practice बाट बोलिरहेको छु। तपाईंको scheduled annual review को समय भएको छ।" },
        { speaker: "Bikash", role: "Client Recall", text: "हजुर, मैले review गर्नु पर्ने थियो। कहिले slot खाली छ?" },
        { speaker: "Sarah", role: "Relay AI Agent", text: "हामी सँग Sunday २ PM मा slot खाली छ। तपाईंलाई मिल्छ?" },
        { speaker: "Bikash", role: "Client Recall", text: "हुन्छ, Sunday २ PM मा confirm गरिदिनुस्।" },
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
        { speaker: "Carlos", role: "Corporate Client", text: "I have an urgent account escalation that needs immediate senior manager attention." },
        { speaker: "Sarah", role: "Relay AI Agent", text: "Carlos, because this is marked as high priority, I am immediately routing your details and dispatching an emergency SMS alert to our on-call operations director. Please hold on line while we connect you." }
      ],
      outcome: {
        appointment_booked: false,
        emergency_escalation: true,
        on_call_director_alerted: "Operations Director (SMS Sent)",
        priority: "HIGH_URGENCY",
        disposition: "escalated_urgent"
      }
    }
  };

  const currentPreview = workflowPreviews[activeWorkflowTab];

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors overflow-x-clip"
    >
      {/* 1. Top Navigation with Direct Platform Page Links (Sticky Header) */}
      <PublicHeader onOpenTriggerModal={() => setIsTriggerModalOpen(true)} />

      <main className="flex-1 flex flex-col animate-page-entrance">

      {/* 2. Hero Section Universal Modern Business Focus */}
      <section className="px-6 sm:px-12 pt-20 pb-16 max-w-6xl mx-auto flex flex-col items-center text-center relative">
        {/* Parallax Floating Telephony Signals */}
        <div
          style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)` }}
          className="hidden xl:flex items-center gap-2 absolute top-20 left-4 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3.5 py-2 text-[11px] font-mono text-[#0B1930] dark:text-[#F8FAFC] shadow-card transition-transform duration-200 ease-out"
        >
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>PBX Intercept: &lt; 14.2s</span>
        </div>

        <div
          style={{ transform: `translate(${-mousePos.x * 0.7}px, ${-mousePos.y * 0.7}px)` }}
          className="hidden xl:flex items-center gap-2 absolute top-24 right-4 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3.5 py-2 text-[11px] font-mono text-[#0B1930] dark:text-[#F8FAFC] shadow-card transition-transform duration-200 ease-out"
        >
          <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
          <span>Multilingual Voice &bull; HI &bull; NE &bull; ES</span>
        </div>

        {/* Universal Category Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
          <span>Autonomous Voice Operations for Modern Businesses & Multi-Location Networks</span>
        </div>

        {/* Clean Headline with Dynamic Pill Container */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC] leading-[1.3] max-w-4xl">
          <span>Every call reaches the right </span>
          <span className="inline-flex items-center align-middle my-1.5">
            <button
              onClick={handleManualClick}
              title="Click to cycle next outcome"
              className="px-6 sm:px-8 py-2 sm:py-3 rounded-full bg-white dark:bg-[#10223A] border-2 border-[#1B9A9C] dark:border-[#32C4BE] shadow-card hover:shadow-elevated inline-flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              <span
                className={`font-heading font-black tracking-tight text-[#1B9A9C] dark:text-[#32C4BE] text-4xl sm:text-5xl md:text-6xl leading-none transition-all duration-200 transform inline-block ${
                  fadeState === "out" ? "opacity-0 -translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
                }`}
              >
                {ROTATING_WORDS[wordIndex]}
              </span>
            </button>
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#667085] dark:text-[#9BA8B8] max-w-2xl leading-relaxed mt-6">
          Relay is an autonomous voice operations platform that receives, understands, and acts on conversations at scale. From missed customer calls and lead follow-ups to appointment booking and intelligent routing, important interactions never get lost.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col items-center justify-center gap-3 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-sm shadow-card transition-all active:scale-95 cursor-pointer"
              >
                <Icons.Activity className="w-4 h-4 text-[#1B9A9C]" />
                <span>Go to Operations Console &rarr;</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] hover:bg-[#15294A] dark:hover:bg-[#27B5B2] text-white font-bold text-sm shadow-card hover:shadow-elevated transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Get Started &rarr;</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsTriggerModalOpen(true)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] font-bold text-sm shadow-subtle hover:shadow-card transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Icons.PhoneCall className="w-4 h-4 text-[#1B9A9C]" />
              <span>Test Live Call</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-[#667085] dark:text-[#9BA8B8] pt-1">
            <span className="flex items-center gap-1">
              <Icons.Check className="w-3 h-3 text-[#16A34A]" /> No credit card required
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Icons.Check className="w-3 h-3 text-[#16A34A]" /> 14-Day Free Trial
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Icons.Check className="w-3 h-3 text-[#16A34A]" /> Sub-14s Response
            </span>
          </div>
        </div>

        {/* Authentic Multi-Turn Conversational Telephony Studio with Depth & Parallax */}
        <div className="mt-12 w-full max-w-3xl bg-white/95 dark:bg-[#10223A]/95 backdrop-blur-xl border border-[#E4E8E7] dark:border-[#20324A] rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.4)] text-left space-y-6 transition-all duration-300 hover:shadow-[0_15px_50px_rgba(27,154,156,0.12)] hover:scale-[1.01]">
          {/* Header row with status & language selector */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isPlayingAudio ? "bg-[#16A34A] animate-ping" : "bg-[#1B9A9C]"}`} />
              <div>
                <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] block">
                  {currentDialogue.title}
                </span>
                <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8]">
                  {currentDialogue.caller}
                </span>
              </div>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#FAFAF8] dark:bg-[#081426] p-1 rounded-xl border border-[#E4E8E7] dark:border-[#20324A] text-xs font-semibold font-mono">
              <button
                onClick={() => {
                  stopAllAudio();
                  setAudioStreamLang("hi");
                  setActiveAudioTurn(0);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  audioStreamLang === "hi" ? "bg-white dark:bg-[#10223A] text-[#0B1930] dark:text-white shadow-sm font-bold" : "text-[#667085]"
                }`}
              >
                हिन्दी / EN
              </button>
              <button
                onClick={() => {
                  stopAllAudio();
                  setAudioStreamLang("ne");
                  setActiveAudioTurn(0);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  audioStreamLang === "ne" ? "bg-white dark:bg-[#10223A] text-[#0B1930] dark:text-white shadow-sm font-bold" : "text-[#667085]"
                }`}
              >
                नेपाली
              </button>
              <button
                onClick={() => {
                  stopAllAudio();
                  setAudioStreamLang("es");
                  setActiveAudioTurn(0);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  audioStreamLang === "es" ? "bg-white dark:bg-[#10223A] text-[#0B1930] dark:text-white shadow-sm font-bold" : "text-[#667085]"
                }`}
              >
                Español
              </button>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] shadow-subtle">
            <div className="flex items-center gap-3.5">
              <button
                onClick={handleToggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-card hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer ${
                  isPlayingAudio ? "bg-[#1B9A9C] text-white shadow-[#1B9A9C]/30" : "bg-[#0B1930] dark:bg-[#F8FAFC] text-white dark:text-[#0B1930]"
                }`}
              >
                {isPlayingAudio ? <Icons.Pause className="w-5 h-5" /> : <Icons.Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC] block">
                    {isPlayingAudio ? "Streaming Live Telephony Audio..." : "Press Play to Listen to Multi-Turn Human Dialogue"}
                  </span>
                  {isPlayingAudio && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-[9px] font-mono font-bold border border-[#16A34A]/20 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      LIVE CALL
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#667085] dark:text-[#9BA8B8] block">
                  {isPlayingAudio
                    ? `Turn ${activeAudioTurn + 1} of ${currentDialogue.turns.length} • Speaking: ${currentDialogue.turns[activeAudioTurn].speaker} (${currentDialogue.turns[activeAudioTurn].role})`
                    : "Simulates human conversation flow with authentic accents and turn-taking"}
                </span>
              </div>
            </div>

            {/* Bouncing Audio Waveform Frequency Visualizer */}
            <div className="hidden sm:flex items-center gap-1 h-8 px-3 py-1 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A]">
              {[35, 75, 100, 50, 85, 30, 95, 65, 90, 45, 80, 100, 55, 35].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlayingAudio ? "bg-[#1B9A9C] animate-pulse" : "bg-[#E4E8E7] dark:bg-[#20324A]"
                  }`}
                  style={{
                    height: isPlayingAudio ? `${Math.max(25, (h * ((i + activeAudioTurn * 4) % 10 + 3)) / 12)}%` : "20%"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Studio-Grade Conversational Transcript Stream */}
          <div className="space-y-3 max-h-80 overflow-y-auto overflow-x-hidden p-1">
            {currentDialogue.turns.map((turn, i) => {
              const isCurrent = activeAudioTurn === i && isPlayingAudio;
              return (
                <div
                  key={i}
                  className={`flex flex-col w-full ${turn.isAI ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`w-full max-w-[90%] sm:max-w-[84%] p-4 rounded-2xl text-xs space-y-2 transition-all duration-300 ${
                      turn.isAI
                        ? "rounded-tl-xs bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A]"
                        : "rounded-tr-xs bg-[#F3F5F4] dark:bg-[#15294A] border border-[#E4E8E7] dark:border-[#20324A]"
                    } ${
                      isCurrent
                        ? "bg-white dark:bg-[#10223A] border-[#1B9A9C] shadow-md shadow-[#1B9A9C]/10 scale-[1.01]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            turn.isAI
                              ? "bg-[#1B9A9C] text-white"
                              : "bg-[#0B1930] dark:bg-[#20324A] text-white"
                          }`}
                        >
                          {turn.isAI ? "R" : turn.speaker.charAt(0)}
                        </div>
                        <span className="font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                          {turn.speaker}
                        </span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                          turn.isAI
                            ? "bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/20"
                            : "bg-black/5 dark:bg-white/10 text-[#667085] dark:text-[#9BA8B8]"
                        }`}>
                          {turn.role}
                        </span>
                      </div>

                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#16A34A] animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                          SPEAKING NOW
                        </span>
                      )}
                    </div>

                    <p className="leading-relaxed text-[#0B1930] dark:text-[#F8FAFC] pl-7">
                      &ldquo;{turn.displayText}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />
            <span>Speed: &lt; 14.2s Dial Latency</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />
            <span>Conversion: 42.8% Booking Capture</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />
            <span>Multilingual: 7 Native Languages</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />
            <span>Reliability: 99.99% Telephony Uptime</span>
          </div>
        </div>
      </section>

      {/* 3. The Relay Concept & 7-Stage Pipeline */}
      <section className="px-6 sm:px-12 py-16 bg-white dark:bg-[#10223A] border-y border-[#E4E8E7] dark:border-[#20324A] transition-colors">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
              <span className="uppercase tracking-widest font-mono text-[10px]">The Relay Concept</span>
            </div>
            <h2 className="text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
              A relay receives a signal and passes it forward.
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] dark:text-[#9BA8B8]">
              That concept sits at the center of the platform. Every incoming ring or scheduled batch contact moves through an autonomous chain from detection to verified outcome.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5 text-left">
            {relaySteps.map((s) => (
              <div
                key={s.step}
                className="bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] rounded-2xl p-4 space-y-2.5 transition-all duration-200 hover:scale-[1.03] hover:shadow-card group cursor-default"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#98A2B3] group-hover:text-[#1B9A9C] transition-colors">{s.num}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C] opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                </div>
                <div className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] tracking-wider">{s.step}</div>
                <div className="font-semibold text-[11px] text-[#0B1930] dark:text-[#F8FAFC] leading-tight">{s.title}</div>
                <p className="text-[10px] text-[#667085] dark:text-[#9BA8B8] leading-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Interactive ROI / Revenue Recovery Calculator */}
      <section className="px-6 sm:px-12 py-16 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
            <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
            <span className="uppercase tracking-widest font-mono text-[10px]">Business Economics</span>
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
            Calculate Your Recovered Business Revenue
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-[#9BA8B8]">
            See how much missed-call and recall revenue Relay reclaims for your operations each month.
          </p>
        </div>

        <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-10 shadow-elevated grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <label htmlFor="landingMissedCalls" className="text-[#0B1930] dark:text-[#F8FAFC]">Missed Calls / Inquiries per Day:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="landingMissedCalls"
                    type="number"
                    min="1"
                    max="500"
                    value={missedCallsPerDay}
                    onChange={(e) => setMissedCallsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-2 py-1 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] focus:border-[#1B9A9C] text-right font-mono font-bold text-xs text-[#1B9A9C] outline-none"
                  />
                  <span className="font-mono text-xs text-[#667085] dark:text-[#9BA8B8]">calls</span>
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
                <label htmlFor="landingTicketValue" className="text-[#0B1930] dark:text-[#F8FAFC]">Average Deal / Service Value:</label>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs text-[#667085] dark:text-[#9BA8B8]">{currencyConfig.symbol}</span>
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
                    className="w-28 px-2 py-1 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] focus:border-[#1B9A9C] text-right font-mono font-bold text-xs text-[#1B9A9C] outline-none"
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

            <div className="pt-2 text-xs text-[#667085] dark:text-[#9BA8B8] space-y-1">
              <div className="flex items-center justify-between">
                <span>Relay Benchmark Conversion Rate:</span>
                <span className="font-mono font-bold text-[#0B1930] dark:text-[#F8FAFC]">42.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Speed to Intercept:</span>
                <span className="font-mono font-bold text-[#0B1930] dark:text-[#F8FAFC]">&lt; 14.2 seconds</span>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1930] text-[#F8FAFC] space-y-5 text-center flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#9BA8B8] block">
                Estimated Monthly Recovered Revenue ({currencyConfig.code})
              </span>
              <div className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
                {formatPrice(monthlyRevenueRecovered)}
              </div>
              <span className="text-xs text-[#32C4BE] font-mono block">
                +{formatPrice(annualRevenueRecovered)} / year in captured bookings & leads
              </span>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3 rounded-xl bg-[#1B9A9C] hover:bg-[#27B5B2] text-white font-bold text-xs shadow-sm transition-all text-center block active:scale-95"
            >
              Start Recovering Calls &rarr;
            </Link>
          </div>
        </div>
</section>
      

      {/* 5. Relay Navy Dark Operations Section ("Interactive Voice Operations Workbench") */}
      <section className="px-6 sm:px-12 py-16 bg-[#0B1930] text-[#F8FAFC]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F8FAFC]">
              <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
              <span className="uppercase tracking-widest font-mono text-[10px] text-[#9BA8B8]">Interactive Simulation Workbench</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
              Your voice operations, simplified<span className="text-[#1B9A9C]">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9BA8B8] max-w-xl mx-auto">
              Explore how Relay executes complex multi-turn conversations, extracts structured facts, and enforces intelligent routing.
            </p>

            {/* Workflow Tabs */}
            <div className="inline-flex items-center gap-1.5 bg-[#10223A] p-1.5 rounded-xl border border-[#20324A] text-xs">
              <button
                onClick={() => setActiveWorkflowTab("overflow")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeWorkflowTab === "overflow" ? "bg-[#081426] text-white border border-[#20324A]" : "text-[#9BA8B8] hover:text-white"
                }`}
              >
                Inbound Overflow
              </button>
              <button
                onClick={() => setActiveWorkflowTab("batch")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeWorkflowTab === "batch" ? "bg-[#081426] text-white border border-[#20324A]" : "text-[#9BA8B8] hover:text-white"
                }`}
              >
                Excel Batch Dialing
              </button>
              <button
                onClick={() => setActiveWorkflowTab("safety")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeWorkflowTab === "safety" ? "bg-[#081426] text-white border border-[#20324A]" : "text-[#9BA8B8] hover:text-white"
                }`}
              >
                Priority Escalation
              </button>
            </div>
          </div>

          {/* Secure Interactive Preview Card */}
          <div className="bg-[#10223A] border border-[#20324A] rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6 shadow-elevated">
            <div className="flex items-center justify-between pb-4 border-b border-[#20324A] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
                <span className="font-heading font-bold text-sm text-white">
                  {currentPreview.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#9BA8B8] bg-[#081426] px-2 py-0.5 rounded border border-[#20324A]">
                {currentPreview.caller}
              </span>
            </div>

            {/* Conversation Turns Simulator */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {currentPreview.turns.map((turn, i) => {
                const isAgent = turn.speaker.startsWith("Sarah");
                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl text-xs space-y-2 ${
                      isAgent
                        ? "bg-[#081426] border border-[#20324A] text-[#F8FAFC] mr-4 sm:mr-8 rounded-tl-xs"
                        : "bg-[#15294A] border border-[#20324A] text-white ml-4 sm:ml-8 rounded-tr-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isAgent
                              ? "bg-[#1B9A9C] text-white"
                              : "bg-[#20324A] text-white"
                          }`}
                        >
                          {isAgent ? "R" : turn.speaker.charAt(0)}
                        </div>
                        <span className="font-heading font-bold text-white">
                          {turn.speaker}
                        </span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                          isAgent
                            ? "bg-[#1B9A9C]/20 text-[#32C4BE]"
                            : "bg-white/10 text-[#9BA8B8]"
                        }`}>
                          {turn.role}
                        </span>
                      </div>
                      <span className="text-[#627284] font-mono text-[10px]">Turn {i + 1}</span>
                    </div>
                    <p className="leading-relaxed pl-7 text-[#F8FAFC]">&ldquo;{turn.text}&rdquo;</p>
                  </div>
                );
              })}
            </div>

            {/* Extracted Schema Outcome */}
            <div className="pt-4 border-t border-[#20324A] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-[#9BA8B8] uppercase font-bold tracking-wider">
                  Extracted JSON Result committed to CRM / Database
                </span>
                <span className="text-[10px] text-[#32C4BE] font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />
                  Schema Validated
                </span>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#081426] border border-[#20324A] text-[11px] font-mono text-[#32C4BE] overflow-x-auto">
                {JSON.stringify(currentPreview.outcome, null, 2)}
              </pre>
            </div>

            {/* Live Audio Test Launcher Card */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#081426] border border-[#1B9A9C]/40 shadow-elevated">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#1B9A9C] animate-pulse" />
                  <span className="text-xs font-bold text-white">Experience Real Telephony Audio</span>
                  <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 px-2 py-0.5 rounded-full font-bold">
                    Unlimited Dev Testing Mode
                  </span>
                </div>
                <span className="text-[11px] text-[#9BA8B8] block">
                  Dial your real phone number and test Hindi, Nepali, Spanish, or English voice agents live.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTriggerModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#1B9A9C] hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card transition-all flex items-center gap-2 flex-shrink-0 active:scale-95 cursor-pointer"
              >
                <Icons.PhoneCall className="w-4 h-4" />
                <span>Test Real Audio Call &rarr;</span>
              </button>
            </div>

            {/* Authenticated CTA Banner */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#081426] border border-[#20324A]">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-xs font-bold text-white block">Ready to deploy voice operations for your team?</span>
                <span className="text-[11px] text-[#9BA8B8] block">Sign in to access your organization&apos;s authenticated PBX, CRM sync & fleet fleet.</span>
              </div>
              <Link
                href="/login"
                className="px-5 py-2 rounded-lg bg-white hover:bg-[#F3F5F4] text-[#0B1930] font-bold text-xs shadow-sm transition-all flex-shrink-0"
              >
                Sign In to Console &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Comparison Table: Traditional Reception vs. Legacy IVR vs. RELAY */}
      <section className="px-6 sm:px-12 py-16 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
            <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
            <span className="uppercase tracking-widest font-mono text-[10px]">Infrastructure Comparison</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
            Why Modern Businesses Choose Relay
          </h2>
        </div>

        <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E4E8E7] dark:border-[#20324A] bg-[#F3F5F4] dark:bg-[#081426] text-[10px] uppercase font-bold text-[#667085] dark:text-[#9BA8B8] font-mono">
                <th className="py-3.5 px-4">Capability</th>
                <th className="py-3.5 px-4">Human Front-Desk</th>
                <th className="py-3.5 px-4">Legacy Phone Tree (IVR)</th>
                <th className="py-3.5 px-4 text-[#1B9A9C] font-bold">RELAY Voice Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8E7] dark:divide-[#20324A]">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Speed to Answer</td>
                <td className="py-3.5 px-4 text-[#667085]">3-5 minutes (or voicemail)</td>
                <td className="py-3.5 px-4 text-[#667085]">Instant (robotic menu)</td>
                <td className="py-3.5 px-4 font-bold text-[#0B1930] dark:text-[#F8FAFC]">&lt; 14.2s (Zero Hold Time)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Multilingual Fluency</td>
                <td className="py-3.5 px-4 text-[#667085]">Depends on staff language</td>
                <td className="py-3.5 px-4 text-[#667085]">Recorded prompts only</td>
                <td className="py-3.5 px-4 font-bold text-[#0B1930] dark:text-[#F8FAFC]">Fluent Hindi, Nepali, Spanish & English</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Excel Batch Recall</td>
                <td className="py-3.5 px-4 text-[#667085]">Manual 1-by-1 dialing</td>
                <td className="py-3.5 px-4 text-[#667085]">Blast robocalls (low pickup)</td>
                <td className="py-3.5 px-4 font-bold text-[#0B1930] dark:text-[#F8FAFC]">Autonomous multi-contact booking</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">CRM & Database Sync</td>
                <td className="py-3.5 px-4 text-[#667085]">Manual typing entry</td>
                <td className="py-3.5 px-4 text-[#667085]">No live CRM sync</td>
                <td className="py-3.5 px-4 font-bold text-[#0B1930] dark:text-[#F8FAFC]">Direct JSON sync to CRM & Databases</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Priority Escalation</td>
                <td className="py-3.5 px-4 text-[#667085]">Variable manual routing</td>
                <td className="py-3.5 px-4 text-[#667085]">None</td>
                <td className="py-3.5 px-4 font-bold text-[#0B1930] dark:text-[#F8FAFC]">Intelligent On-Call Staff SMS Routing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    {/* 7. Deep Relay Professional Footer */}
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
