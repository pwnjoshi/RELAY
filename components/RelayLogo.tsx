"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface RelayLogoProps {
  className?: string;
  showDescriptor?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "white";
}

export function RelayLogo({ className = "", size = "md", variant = "default" }: RelayLogoProps) {
  const heightClass = size === "sm" ? "h-6" : size === "lg" ? "h-11" : "h-8";
  const widthClass = size === "sm" ? "w-24" : size === "lg" ? "w-44" : "w-32";

  const isWhite = variant === "white" || variant === "light";

  const handleClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className={`inline-flex items-center group transition-transform active:scale-95 cursor-pointer ${className}`}
      title="Relay — Voice Operations (Scroll to Top)"
    >
      <div className={`relative ${heightClass} ${widthClass} flex items-center`}>
        <Image
          src="/logo.png"
          alt="Relay — Voice Operations"
          width={180}
          height={60}
          className={`object-contain w-full h-full transition-all ${
            isWhite ? "brightness-0 invert" : "dark:brightness-0 dark:invert"
          }`}
          priority
        />
      </div>
    </Link>
  );
}
