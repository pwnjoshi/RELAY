"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RelayLogo } from "./RelayLogo";
import { Icons } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";
import { useConsole } from "@/lib/console-context";

interface PublicHeaderProps {
  onOpenTriggerModal?: () => void;
}

export function PublicHeader({ onOpenTriggerModal }: PublicHeaderProps) {
  const pathname = usePathname();
  const { currentUser } = useConsole();

  const [mounted, setMounted] = useState(false);

  // Initialize authSession synchronously from sessionStorage or currentUser to prevent single-frame flicker
  const [authSession, setAuthSession] = useState<{ isLoggedIn: boolean; name?: string; role?: string } | null>(() => {
    if (currentUser) return { isLoggedIn: true, name: currentUser.name, role: currentUser.role };
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("relay_auth_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isLoggedIn) return parsed;
        } catch {}
      }
    }
    return null;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verify active session with backend API
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.user) {
          const sess = { isLoggedIn: true, name: d.user.name, role: d.user.role };
          setAuthSession(sess);
          sessionStorage.setItem("relay_auth_user", JSON.stringify(sess));
        } else {
          setAuthSession({ isLoggedIn: false });
          sessionStorage.removeItem("relay_auth_user");
        }
      })
      .catch(() => setAuthSession({ isLoggedIn: false }));
  }, []);

  useEffect(() => {
    if (currentUser) {
      const sess = { isLoggedIn: true, name: currentUser.name, role: currentUser.role };
      setAuthSession(sess);
      sessionStorage.setItem("relay_auth_user", JSON.stringify(sess));
    }
  }, [currentUser]);

  const isUserAuthenticated = mounted && (authSession ? authSession.isLoggedIn : Boolean(currentUser));

  const navLinks = [
    { href: "/solutions", label: "Solutions" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/security", label: "Security & Privacy" },
    { href: "/pricing", label: "Pricing & ROI" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="border-b border-[#E4E8E7] dark:border-[#20324A] bg-white/95 dark:bg-[#081426]/95 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 py-3.5 transition-all shadow-subtle">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Signature */}
        <div className="flex items-center gap-4">
          <RelayLogo size="md" />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-[#667085] dark:text-[#9BA8B8]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 ${
                  isActive
                    ? "text-[#1B9A9C] font-extrabold border-b-2 border-[#1B9A9C]"
                    : "hover:text-[#0B1930] dark:hover:text-white"
                }`}
              >
                {link.label}
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 hover:shadow-elevated"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Go to Console &rarr;</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 hover:shadow-elevated"
            >
              <Icons.Lock className="w-3.5 h-3.5 text-[#1B9A9C]" />
              <span>Sign In &rarr;</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#FAFAF8] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC]"
            aria-label="Toggle navigation menu"
          >
            <Icons.Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-[#E4E8E7] dark:border-[#20324A] space-y-2 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-bold ${
                pathname === link.href
                  ? "bg-[#1B9A9C]/10 text-[#1B9A9C]"
                  : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#10223A]"
              }`}
            >
              {link.label}
            </Link>
          ))}
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
