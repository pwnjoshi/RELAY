"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const LOADING_STEPS = [
  "Connecting Telephony Trunks",
  "Calibrating Neural Voice Pipeline",
  "Grounding Knowledge Embeddings",
  "Initializing Operations Console",
  "System Ready"
];

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if preloader was already shown in this tab session
    const hasLoaded = sessionStorage.getItem("relay_preloader_shown");
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 12) + 8;

        if (next >= 100) {
          clearInterval(interval);
          setStepIndex(LOADING_STEPS.length - 1);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              setLoading(false);
              sessionStorage.setItem("relay_preloader_shown", "true");
            }, 450);
          }, 200);
          return 100;
        }

        // Dynamically update step text according to progress
        const targetStep = Math.min(
          Math.floor((next / 100) * (LOADING_STEPS.length - 1)),
          LOADING_STEPS.length - 2
        );
        setStepIndex(targetStep);
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#050B14] flex flex-col items-center justify-between p-8 select-none transition-all duration-500 ease-in-out ${
        fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient Radial Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(27,154,156,0.15),transparent_70%)] pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[11px] font-mono text-[#667085] dark:text-[#5B6F89] relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1B9A9C] animate-pulse" />
          <span className="tracking-widest uppercase font-bold text-[#9BA8B8]">RELAY TELEPHONY</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">24kHz OPUS • SIP TRUNKS</span>
          <span className="text-[#1B9A9C] font-bold">NODE: US-EAST-1</span>
        </div>
      </div>

      {/* Central Brand Core & Acoustic Waves */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-7 my-auto">
        {/* Pulsing Concentric Radar Rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full border border-[#1B9A9C]/20 animate-ping duration-1000" />
          <div className="absolute w-28 h-28 rounded-full border border-[#38BDF8]/20 animate-pulse" />

          {/* Central Hexagonal Glow Badge */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-[#10223A] to-[#081426] border border-[#1E3A5F] flex items-center justify-center shadow-[0_0_40px_rgba(27,154,156,0.3)]">
            <Image
              src="/logo.png"
              alt="RELAY"
              width={56}
              height={56}
              className="object-contain brightness-0 invert filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              priority
            />
          </div>
        </div>

        {/* Dynamic Equalizer Waveform */}
        <div className="flex items-center gap-1.5 h-6">
          {[40, 75, 100, 60, 90, 45, 80, 55, 30].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[#1B9A9C] to-[#38BDF8] transition-all duration-150 animate-pulse"
              style={{
                height: `${Math.max(20, (h * progress) / 100)}%`,
                animationDelay: `${i * 80}ms`
              }}
            />
          ))}
        </div>

        {/* Live Step Status Label */}
        <div className="text-center space-y-1.5 min-h-[48px]">
          <p className="text-sm font-semibold tracking-wide text-[#F8FAFC]">
            {LOADING_STEPS[stepIndex]}
          </p>
          <p className="text-xs font-mono text-[#9BA8B8]">
            {progress < 100 ? `Synchronizing voice gateway • ${progress}%` : "Gateway handshake verified"}
          </p>
        </div>

        {/* Modern Glowing Progress Bar */}
        <div className="w-64 sm:w-80 h-1.5 bg-[#10223A] rounded-full overflow-hidden relative p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-[#1B9A9C] via-[#38BDF8] to-[#16A34A] rounded-full transition-all duration-200 ease-out shadow-[0_0_12px_#38BDF8]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Architectural Footer */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[10px] font-mono text-[#667085] dark:text-[#5B6F89] border-t border-[#10223A] pt-4 relative z-10">
        <span>AUTONOMOUS MULTILINGUAL AI TELEPHONY</span>
        <span className="font-bold text-[#9BA8B8]">{progress}%</span>
      </div>
    </div>
  );
}
