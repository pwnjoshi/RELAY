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
    { href: "/", label: "Home" },
    { href: "/solutions", label: "Solutions" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/security", label: "Security & Privacy" },
    { href: "/pricing", label: "Pricing & ROI" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="border-b border-[#E4E8E7]/80 dark:border-[#1E324F]/80 bg-white/85 dark:bg-[#081426]/85 backdrop-blur-xl sticky top-0 z-50 px-6 sm:px-10 lg:px-16 py-3.5 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.25)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand Signature */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <RelayLogo size="md" />
        </div>

        {/* Desktop Luxury Floating Glass Navigation Dock (No Icons, Pure Typographic Elegance) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-[#F0F4F4]/90 dark:bg-[#0E1E36]/90 border border-[#E0E7E6] dark:border-[#1E324F] shadow-inner backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ease-out select-none flex items-center cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-[#162A48] text-[#0B1930] dark:text-[#F8FAFC] shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.3)] border border-[#E0E7E6] dark:border-[#2A4368] font-bold"
                    : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-[#F8FAFC] hover:bg-white/50 dark:hover:bg-[#162A48]/50"
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <ThemeToggle />

          {/* Dynamic Smart Auth Button with Generous Comfortable Padding */}
          {isUserAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] hover:bg-[#15294A] dark:hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card transition-all duration-200 active:scale-95 hover:shadow-elevated hover:-translate-y-0.5 border border-transparent dark:border-[#38BDF8]/20 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Go to Console &rarr;</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] hover:bg-[#15294A] dark:hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card transition-all duration-200 active:scale-95 hover:shadow-elevated hover:-translate-y-0.5 border border-transparent dark:border-[#38BDF8]/20 cursor-pointer"
            >
              <span>Get Started &rarr;</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] transition-transform active:scale-90 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Icons.Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Floating Overlay Drawer (Floats ABOVE hero section without shifting page layout) */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-[60px] bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden absolute top-full left-0 right-0 z-50 bg-white/95 dark:bg-[#081426]/95 backdrop-blur-2xl border-b border-[#E4E8E7] dark:border-[#1E324F] shadow-2xl px-6 py-5 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#1B9A9C]/15 text-[#1B9A9C] font-bold border border-[#1B9A9C]/20 shadow-sm"
                        : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#10223A] hover:text-[#0B1930] dark:hover:text-[#F8FAFC]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-[11px] text-[#9BA8B8] font-mono">&rarr;</span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-3 border-t border-[#E4E8E7] dark:border-[#1E324F]">
              {isUserAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] text-white font-bold text-xs shadow-card active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Go to Console &rarr;</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] text-white font-bold text-xs shadow-card active:scale-95"
                >
                  <span>Get Started &rarr;</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
