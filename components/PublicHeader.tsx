"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RelayLogo } from "./RelayLogo";
import { Icons } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";

interface PublicHeaderProps {
  onOpenTriggerModal?: () => void;
}

export function PublicHeader({ onOpenTriggerModal }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check local storage session first
    try {
      const stored = sessionStorage.getItem("relay_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.isLoggedIn) {
          setIsUserAuthenticated(true);
        }
      }
    } catch {}

    // Verify verified HTTP-only / token auth session with backend API
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.authenticated && d.user) {
          setIsUserAuthenticated(true);
          sessionStorage.setItem("relay_auth_user", JSON.stringify({ isLoggedIn: true, name: d.user.name, role: d.user.role }));
        } else {
          setIsUserAuthenticated(false);
          sessionStorage.removeItem("relay_auth_user");
        }
      })
      .catch(() => {
        setIsUserAuthenticated(false);
      });
  }, []);

  const navLinks = [
    { href: "/solutions", label: "Solutions", icon: Icons.Building },
    { href: "/how-it-works", label: "How It Works", icon: Icons.Cpu },
    { href: "/security", label: "Security & Privacy", icon: Icons.Shield },
    { href: "/pricing", label: "Pricing & ROI", icon: Icons.CreditCard },
    { href: "/about", label: "About", icon: Icons.Layers },
  ];

  return (
    <header className="border-b border-[#E4E8E7]/80 dark:border-[#1E324F]/80 bg-white/80 dark:bg-[#081426]/80 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-3 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.25)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Signature */}
        <div className="flex items-center gap-3">
          <RelayLogo size="md" />
        </div>

        {/* Desktop Luxury Floating Glass Navigation Dock */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#F4F6F5]/90 dark:bg-[#0E1E36]/90 border border-[#E2E8E7] dark:border-[#1E324F] shadow-inner backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ease-out flex items-center gap-2 select-none group cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-[#162A48] text-[#0B1930] dark:text-[#F8FAFC] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.35)] border border-[#E2E8E7]/90 dark:border-[#2A4368]"
                    : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-[#F8FAFC] hover:bg-white/60 dark:hover:bg-[#162A48]/50 hover:shadow-sm"
                }`}
              >
                <IconComponent
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? "text-[#1B9A9C]" : "text-[#98A2B3] group-hover:text-[#1B9A9C]"
                  }`}
                />
                <span>{link.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C] shadow-[0_0_6px_#1B9A9C] animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Dynamic Smart Auth Button */}
          {isUserAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] hover:bg-[#15294A] dark:hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card transition-all duration-200 active:scale-95 hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Go to Console &rarr;</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] hover:bg-[#15294A] dark:hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card transition-all duration-200 active:scale-95 hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer"
            >
              <Icons.Lock className="w-3.5 h-3.5 text-white/90" />
              <span>Sign In &rarr;</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#FAFAF8] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] transition-transform active:scale-90 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Icons.Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Glassmorphic Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-[#E4E8E7] dark:border-[#20324A] space-y-1.5 animate-page-entrance">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#1B9A9C]/15 text-[#1B9A9C] border border-[#1B9A9C]/20 shadow-sm"
                    : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#10223A]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className="w-4 h-4 text-[#1B9A9C]" />
                  <span>{link.label}</span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#E4E8E7] dark:border-[#20324A]">
            {isUserAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1930] text-white font-bold text-xs shadow-sm"
              >
                Go to Console &rarr;
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1930] text-white font-bold text-xs shadow-sm"
              >
                Sign In &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
