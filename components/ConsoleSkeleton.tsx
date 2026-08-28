"use client";

import React from "react";

export function ConsoleSkeleton({ type = "dashboard" }: { type?: "dashboard" | "table" | "cards" | "analytics" }) {
  if (type === "analytics") {
    return (
      <div className="space-y-6 animate-pulse p-1">
        {/* Top bar skeleton */}
        <div className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5" />

        {/* 4 Stat Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 space-y-3">
              <div className="h-3 w-20 bg-black/10 dark:bg-white/10 rounded-full" />
              <div className="h-7 w-28 bg-black/10 dark:bg-white/10 rounded-lg" />
            </div>
          ))}
        </div>

        {/* 2 Chart Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 space-y-4">
            <div className="h-4 w-32 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-52 w-full bg-black/5 dark:bg-white/5 rounded-xl" />
          </div>
          <div className="h-72 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 space-y-4">
            <div className="h-4 w-32 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-52 w-full bg-black/5 dark:bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 space-y-4">
              <div className="h-4 w-28 bg-black/10 dark:bg-white/10 rounded-full" />
              <div className="h-8 w-36 bg-black/10 dark:bg-white/10 rounded-lg" />
              <div className="space-y-2 pt-4">
                <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full" />
                <div className="h-3 w-5/6 bg-black/5 dark:bg-white/5 rounded-full" />
                <div className="h-3 w-4/6 bg-black/5 dark:bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pulse p-1">
      {/* Top Banner Skeleton */}
      <div className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between p-4">
        <div className="space-y-2">
          <div className="h-3.5 w-64 bg-black/10 dark:bg-white/10 rounded-full" />
          <div className="h-2.5 w-96 bg-black/5 dark:bg-white/5 rounded-full" />
        </div>
        <div className="h-9 w-28 bg-black/10 dark:bg-white/10 rounded-xl hidden sm:block" />
      </div>

      {/* KPI Metrics Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-3 space-y-2">
            <div className="h-2.5 w-16 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-6 w-20 bg-black/10 dark:bg-white/10 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Split View Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Table Skeleton */}
        <div className="lg:col-span-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
            <div className="h-4 w-36 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-7 w-24 bg-black/10 dark:bg-white/10 rounded-xl" />
          </div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-14 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10" />
                <div className="space-y-1.5">
                  <div className="h-3 w-32 bg-black/10 dark:bg-white/10 rounded-full" />
                  <div className="h-2 w-20 bg-black/5 dark:bg-white/5 rounded-full" />
                </div>
              </div>
              <div className="h-5 w-16 bg-black/10 dark:bg-white/10 rounded-full" />
            </div>
          ))}
        </div>

        {/* Right Cards Skeleton */}
        <div className="space-y-6">
          <div className="h-56 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 space-y-3">
            <div className="h-4 w-32 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-36 w-full bg-black/5 dark:bg-white/5 rounded-xl" />
          </div>
          <div className="h-36 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 space-y-3">
            <div className="h-4 w-28 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-16 w-full bg-black/5 dark:bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
