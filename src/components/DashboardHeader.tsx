"use client";

import { useAuth } from "@/src/components/AuthProvider";
import { ThemeToggle } from "@/src/components/ThemeProvider";

export default function DashboardHeader({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title || "Overview"}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
           Logged in as <span className="font-semibold text-[hsl(var(--primary))]">{user?.email}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}