"use client";

import { Search, Download } from "lucide-react";
import Button from "./ui/Button";

interface TransactionFiltersProps {
  timeRange: "monthly" | "yearly" | "all";
  setTimeRange: (value: "monthly" | "yearly" | "all") => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onExport: () => void;
}

export default function TransactionFilters({
  timeRange,
  setTimeRange,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  searchQuery,
  setSearchQuery,
  onExport,
}: TransactionFiltersProps) {
  
  // Generate last 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-2">
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* 1. View Toggles */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start">
          {(["monthly", "yearly", "all"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setTimeRange(view)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                timeRange === view
                  ? "bg-white dark:bg-slate-700 shadow-sm text-[hsl(var(--primary))]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* 2. Date Selectors & Search */}
        <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
          
          {/* Search Input */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[hsl(var(--primary))]" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none transition-all"
            />
          </div>

          {/* Month Picker */}
          {timeRange === "monthly" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none dark:text-white"
            />
          )}

          {/* Year Picker (Fixed Colors) */}
          {timeRange === "yearly" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {y}
                </option>
              ))}
            </select>
          )}

          <Button variant="secondary" onClick={onExport} className="h-10 px-4">
            <Download className="w-4 h-4" /> 
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
    </div>
  );
}