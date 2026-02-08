/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; 

import { useBusinesses } from "@/src/hooks/useBusinesses"; // <--- IMPORT THE HOOK
import { useAuth } from "@/src/components/AuthProvider"; 
import BusinessCard from "@/src/components/BusinessCard";
import AddBusinessModal from "@/src/components/AddBusinessModal";
import DashboardHeader from "@/src/components/DashboardHeader"; 
import Button from "@/src/components/ui/Button"; 
import Link from "next/link";
import { Wallet, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCcw, MoreVertical, Pencil, X } from "lucide-react";
import { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useToast } from "@/src/components/ToastProvider";
import { Business } from "@/src/types";

export default function Dashboard() {
  const { user } = useAuth(); 
  const { showToast } = useToast();
  
  // 1. USE THE HOOK (Replaces all the manual fetching code)
  // This data loads INSTANTLY from cache if available
  const { businesses, currencySymbol, isLoading, refresh } = useBusinesses();

  // Edit State
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [newName, setNewName] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null); 

  // Handle Rename
  const handleRename = async () => {
    if(!user || !editingBiz) return;
    try {
        await updateDoc(doc(db, "users", user.uid, "businesses", editingBiz.id), { name: newName });
        showToast("Business renamed", "success");
        setEditingBiz(null);
    } catch(e) {
        showToast("Failed to rename", "error");
    }
  };


  const totalNetProfit = businesses.reduce((sum, b) => sum + b.stats.netProfit, 0);
  const totalExpenses = businesses.reduce((sum, b) => sum + b.stats.totalExpense, 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      <DashboardHeader title="Financial Overview" />
      
      <div className="flex justify-end gap-3">
         {/* Refresh button just calls mutate() */}
         <Button variant="secondary" onClick={() => refresh()} disabled={isLoading}>
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
         </Button>
         <AddBusinessModal onSuccess={() => refresh()} /> 
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden bg-[hsl(var(--primary))] text-white p-8 rounded-3xl shadow-xl shadow-blue-500/20 card-hover">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-32 h-32" /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 text-blue-100">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><ArrowUpRight className="w-5 h-5" /></div>
              <span className="font-medium">Total Net Profit</span>
            </div>
            <div className="text-5xl font-bold tracking-tight">{currencySymbol}{totalNetProfit.toLocaleString()}</div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 card-hover">
           <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingDown className="w-32 h-32 text-rose-500" /></div>
           <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 text-rose-600">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg"><ArrowDownRight className="w-5 h-5" /></div>
              <span className="font-medium">Total Expenses</span>
            </div>
            <div className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{currencySymbol}{totalExpenses.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Business List */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Your Portfolios</h2>
        
        {/* Show Skeleton Loader only on FIRST load */}
        {isLoading && businesses.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                    <div key={business.id} className="relative group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                        
                        <div className="flex justify-between items-start mb-4">
                            <Link href={`/dashboard/business/${business.id}`} className="flex-1 hover:text-[hsl(var(--primary))] transition-colors">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{business.name}</h3>
                            </Link>

                            <div className="relative">
                                <button 
                                    onClick={() => setActiveMenu(activeMenu === business.id ? null : business.id)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                
                                {activeMenu === business.id && (
                                    <>
                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                    <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl w-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <button 
                                            onClick={() => {
                                                setEditingBiz(business);
                                                setNewName(business.name);
                                                setActiveMenu(null);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                        >
                                            <Pencil className="w-4 h-4" /> Edit Name
                                        </button>
                                    </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <Link href={`/dashboard/business/${business.id}`} className="block space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-xs font-semibold text-slate-500 uppercase">Net Profit</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {currencySymbol} {business.stats.netProfit.toLocaleString()}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-center">
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">Income</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{Number(business.stats.totalIncome).toLocaleString()}</p>
                                </div>
                                <div className="p-2 bg-rose-50 dark:bg-rose-900/10 rounded-lg text-center">
                                    <p className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold">Expenses</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{Number(business.stats.totalExpense).toLocaleString()}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Rename Modal */}
      {editingBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold dark:text-white">Rename Portfolio</h3>
                    <button onClick={() => setEditingBiz(null)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white mb-4 focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                    autoFocus
                />
                <Button onClick={handleRename} className="w-full">Save Changes</Button>
            </div>
        </div>
      )}

    </div>
  );
}