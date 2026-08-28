"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if preloader was already shown in this tab session
    const hasLoaded = sessionStorage.getItem("relay_preloader_shown");
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += Math.floor(Math.random() * 20) + 15;

      if (currentPct >= 100) {
        currentPct = 100;
        setProgress(100);
        clearInterval(interval);

        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem("relay_preloader_shown", "true");
          }, 350);
        }, 150);
      } else {
        setProgress(currentPct);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#081426] flex flex-col items-center justify-center transition-opacity duration-300 select-none overflow-hidden ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Sleek Top Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#10223A] z-50">
        <div
          className="h-full bg-gradient-to-r from-[#1B9A9C] via-[#3B82F6] to-[#16A34A] transition-all duration-150 ease-out shadow-[0_0_10px_#1B9A9C]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Subtle Glowing Logo */}
        <div className="relative w-36 h-10 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="RELAY Voice Operations"
            width={140}
            height={40}
            className="object-contain brightness-0 invert animate-pulse"
            priority
          />
        </div>

        {/* Minimal Ticker & Equalizer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10223A]/80 border border-[#20324A] text-[10px] font-mono text-[#9BA8B8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
          <span>RELAY Voice Operations</span>
          <span className="text-[#1B9A9C] font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
