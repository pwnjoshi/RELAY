"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Icons } from "./Icons";
import { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fast client-side session hydration
    try {
      const stored = sessionStorage.getItem("relay_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.isLoggedIn) {
          setUser(parsed);
          setLoading(false);
        }
      }
    } catch {}

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (!isMounted) return;
        if (d.ok && d.user) {
          setUser(d.user);
          try {
            sessionStorage.setItem("relay_auth_user", JSON.stringify({ isLoggedIn: true, ...d.user }));
          } catch {}
        } else {
          try {
            sessionStorage.removeItem("relay_auth_user");
          } catch {}
          router.replace("/login?redirect=" + encodeURIComponent(pathname));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-xs font-semibold text-[#667085] dark:text-[#9BA8B8]">
          <span className="w-4 h-4 rounded-full border-2 border-[#1B9A9C] border-t-transparent animate-spin" />
          <span>Verifying Relay Telephony Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check role authorization
  const isAuthorized = !allowedRoles || allowedRoles.includes(user.role) || user.role === "owner";

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-8 space-y-6 text-center shadow-elevated">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <Icons.ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 font-mono px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30">
              Access Restricted
            </span>
            <h2 className="text-xl font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Permission Required
            </h2>
            <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
              Your active account (<strong className="text-[#0B1930] dark:text-[#F8FAFC]">{user.name}</strong> • {user.role}) does not have administrative clearance to access <code className="font-mono text-[11px] bg-[#FAFAF8] dark:bg-[#081426] px-1.5 py-0.5 rounded border border-[#E4E8E7] dark:border-[#20324A]">{pathname}</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] text-xs text-left space-y-1 text-[#667085] dark:text-[#9BA8B8] border border-[#E4E8E7] dark:border-[#20324A]">
            <div className="font-semibold text-[#0B1930] dark:text-[#F8FAFC]">Required Role Privilege:</div>
            <div>{allowedRoles?.map((r) => r.toUpperCase()).join(" or ")} (SuperAdmin Governance)</div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white font-semibold text-xs shadow-sm transition-all"
            >
              Return to Operations Console
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A] text-xs font-semibold transition-all hover:border-[#1B9A9C]"
            >
              Switch Role
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
