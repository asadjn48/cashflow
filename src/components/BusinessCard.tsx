"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Wallet, MoreVertical, Pencil } from "lucide-react";
import { Business } from "@/src/types";
import { useState, useRef, useEffect } from "react";

interface BusinessCardProps {
  business: Business;
  currencySymbol: string;
  onRename: (business: Business) => void;
}

export default function BusinessCard({ business, currencySymbol, onRename }: BusinessCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Header Row */}
      <div className="flex justify-between items-start mb-6">
        <Link href={`/dashboard/business/${business.id}`} className="flex-1 block">
            <h3 className="font-bold text-xl text-slate-900 dark:text-white truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                {business.name}
            </h3>
            {/* Removed Type as requested */}
        </Link>

        {/* 3-Dot Menu */}
        <div className="relative" ref={menuRef}>
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
                className="p-2 text-slate-400 hover:text-[hsl(var(--primary))] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
                <div className="absolute right-0 top-10 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl w-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onRename(business);
                            setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                        <Pencil className="w-4 h-4" /> Edit Name
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Main Stats Link */}
      <Link href={`/dashboard/business/${business.id}`} className="block space-y-4">
        
        {/* Net Profit (Big) */}
        <div className="p-4 bg-[hsl(var(--primary))]/5 rounded-xl border border-[hsl(var(--primary))]/10">
            <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span className="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-wider">Net Profit</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {currencySymbol}{business.stats.netProfit.toLocaleString()}
            </div>
        </div>

        {/* Income & Expenses Grid */}
        <div className="grid grid-cols-2 gap-3">
            {/* Income */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase">Income</span>
                </div>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 truncate">
                    {currencySymbol}{business.stats.totalIncome.toLocaleString()}
                </div>
            </div>

            {/* Expenses */}
            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
                <div className="flex items-center gap-1.5 mb-1 text-rose-600 dark:text-rose-400">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase">Expenses</span>
                </div>
                <div className="text-lg font-bold text-rose-700 dark:text-rose-400 truncate">
                    {currencySymbol}{business.stats.totalExpense.toLocaleString()}
                </div>
            </div>
        </div>
      </Link>
    </div>
  );
}