"use client";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  stats: { income: number; expense: number; profit: number };
  currency: string;
  timeRange: string;
}

export default function BusinessStatsCards({ stats, currency, timeRange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Net Profit */}
      <div className="p-6 bg-[hsl(var(--primary))]/5 rounded-2xl border border-[hsl(var(--primary))]/20 transition-all duration-300">
        <span className="text-[hsl(var(--primary))] text-sm font-semibold uppercase tracking-wide">Net Profit ({timeRange})</span>
        <div className="text-3xl font-bold text-[hsl(var(--primary))] mt-2">
          {currency} {stats.profit.toLocaleString()}
        </div>
      </div>
      
      {/* Income */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Income ({timeRange})</span>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          {stats.income.toLocaleString()}
        </div>
      </div>
      
      {/* Expenses */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Expenses ({timeRange})</span>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-rose-500" />
          {stats.expense.toLocaleString()}
        </div>
      </div>
    </div>
  );
}