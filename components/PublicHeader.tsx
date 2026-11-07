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

    // Verify authenticated session with backend API
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
    { href: "/", label: "Overview" },
    { href: "/solutions", label: "Solutions" },
    { href: "/how-it-works", label: "Architecture" },
    { href: "/security", label: "Security & Privacy" },
    { href: "/pricing", label: "Pricing" },
    { href: "/docs", label: "Docs" },
  ];

  return (
    <header className="border-b border-[#E4E8E7] dark:border-[#1E3048] bg-white/90 dark:bg-[#081220]/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 lg:px-16 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <RelayLogo size="md" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#F3F5F4] dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048]">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors select-none ${
                  isActive
                    ? "bg-white dark:bg-[#13243C] text-[#0B1930] dark:text-[#F8FAFC] shadow-xs font-semibold"
                    : "text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930] dark:hover:text-[#F8FAFC]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />

          {onOpenTriggerModal && (
            <button
              type="button"
              onClick={onOpenTriggerModal}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] hover:border-[#1B9A9C] dark:hover:border-[#2EC4C0] text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] transition-colors"
            >
              <Icons.PhoneCall className="w-3.5 h-3.5 text-[#1B9A9C] dark:text-[#2EC4C0]" />
              <span>Test Call</span>
            </button>
          )}

          {isUserAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1930] dark:bg-[#2EC4C0] dark:text-[#081220] hover:bg-[#15294A] text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Console &rarr;</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1930] dark:bg-[#2EC4C0] dark:text-[#081220] hover:bg-[#15294A] text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <span>Sign In &rarr;</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#5B6B82] hover:text-[#0B1930] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#1E3048]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <Icons.Close className="w-4 h-4" /> : <Icons.Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 border-t border-[#E4E8E7] dark:border-[#1E3048] mt-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-[#5B6B82] dark:text-[#94A3B8] hover:bg-[#F3F5F4] dark:hover:bg-[#0E1B2E] hover:text-[#0B1930] dark:hover:text-[#F8FAFC]"
            >
              {link.label}
            </Link>
          ))}
          {onOpenTriggerModal && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTriggerModal();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1B9A9C] dark:text-[#2EC4C0] hover:bg-[#F3F5F4] dark:hover:bg-[#0E1B2E] flex items-center gap-2"
            >
              <Icons.PhoneCall className="w-3.5 h-3.5" />
              <span>Test Real Voice Call</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
