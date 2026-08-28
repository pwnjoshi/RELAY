"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/lib/currency";
import { Icons } from "./Icons";

export function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, currencyConfig, detectedCountry, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] transition-all cursor-pointer shadow-sm active:scale-95"
        title={`Current Currency: ${currencyConfig.name} (${currencyConfig.country})`}
      >
        <span className="text-sm">{currencyConfig.flag}</span>
        <span className="font-mono text-xs font-bold text-[#1B9A9C]">{currencyConfig.code}</span>
        <span className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">({currencyConfig.symbol})</span>
        <Icons.ChevronDown className="w-3 h-3 text-[#98A2B3] ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl shadow-elevated p-2 z-50 animate-fade-in divide-y divide-[#E4E8E7] dark:divide-[#20324A]">
          {/* Detected Region Indicator */}
          <div className="px-3 py-2 space-y-0.5">
            <div className="text-[9px] font-mono font-bold text-[#98A2B3] uppercase tracking-wider">
              Auto-Detected Region
            </div>
            <div className="text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span>{detectedCountry}</span>
            </div>
          </div>

          {/* Currency List */}
          <div className="pt-2 space-y-1 max-h-60 overflow-y-auto pr-1">
            <div className="px-3 pb-1 text-[9px] font-mono font-bold text-[#98A2B3] uppercase">
              Select Currency
            </div>
            {Object.values(SUPPORTED_CURRENCIES).map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                    isSelected
                      ? "bg-[#0B1930] text-white font-bold"
                      : "hover:bg-[#FAFAF8] dark:hover:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{c.flag}</span>
                    <div className="truncate">
                      <div className="leading-tight">{c.name}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? "text-white/80" : "text-[#98A2B3]"}`}>
                        {c.country}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2 font-mono text-xs">
                    <span className={isSelected ? "text-white" : "text-[#1B9A9C] font-bold"}>
                      {c.symbol}
                    </span>
                    <span className="text-[10px] opacity-75">{c.code}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
