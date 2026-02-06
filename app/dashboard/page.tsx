"use client"; 

import { useEffect, useState, useCallback } from "react";
import { db } from "@/src/lib/firebase"; 
import { collection, getDocs, doc, getDoc } from "firebase/firestore"; // Added doc, getDoc
import { useAuth } from "@/src/components/AuthProvider"; 
import { useToast } from "@/src/components/ToastProvider"; 
import BusinessCard from "@/src/components/BusinessCard";
import AddBusinessModal from "@/src/components/AddBusinessModal";
import Button from "@/src/components/ui/Button"; 

import { Wallet, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { Business } from "@/src/types";

export default function Dashboard() {
  const { user } = useAuth(); 
  const { showToast } = useToast();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState("$"); // Default
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (user) {
      if(isRefresh) setLoading(true);
      try {
        // Run fetches in parallel for speed
        const [businessesSnap, settingsSnap] = await Promise.all([
            getDocs(collection(db, "users", user.uid, "businesses")),
            getDoc(doc(db, "users", user.uid, "settings", "general"))
        ]);

        // 1. Process Businesses
        const data = businessesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Business[];
        setBusinesses(data);

        // 2. Process Currency
        if (settingsSnap.exists() && settingsSnap.data().currency) {
            const code = settingsSnap.data().currency;
            const symbols: Record<string, string> = { 
                USD: "$", 
                PKR: "Rs ", 
                EUR: "€", 
                GBP: "£" 
            };
            setCurrencySymbol(symbols[code] || code);
        }

        if(isRefresh) showToast("Dashboard updated", "success");
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate Global Stats
  const totalNetProfit = businesses.reduce((sum, b) => sum + b.stats.netProfit, 0);
  const totalExpenses = businesses.reduce((sum, b) => sum + b.stats.totalExpense, 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-[hsl(var(--primary))]">{user?.email?.split('@')[0]}</span>
          </p>
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" onClick={() => fetchData(true)} isLoading={loading}>
                <RefreshCcw className="w-4 h-4" />
            </Button>
            <AddBusinessModal onSuccess={() => fetchData(true)} /> 
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Net Profit Card */}
        <div className="relative overflow-hidden bg-[hsl(var(--primary))] text-white p-8 rounded-3xl shadow-xl shadow-blue-500/20 card-hover">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 text-blue-100">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="font-medium">Total Net Profit</span>
            </div>
            <div className="text-5xl font-bold tracking-tight">
              {currencySymbol}{totalNetProfit.toLocaleString()}
            </div>
            <p className="mt-2 text-blue-100 text-sm">Across {businesses.length} active businesses</p>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 card-hover">
           <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingDown className="w-32 h-32 text-rose-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 text-rose-600">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <span className="font-medium">Total Expenses</span>
            </div>
            <div className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currencySymbol}{totalExpenses.toLocaleString()}
            </div>
            <p className="mt-2 text-slate-500 text-sm">Lifetime operational costs</p>
          </div>
        </div>

      </div>

      {/* Business List */}
      <div>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your Portfolio</h2>
            <div className="text-sm text-slate-500">{businesses.length} Businesses</div>
        </div>
        
        {loading && businesses.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                    <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
                ))}
            </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business}/>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                <Wallet className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No businesses yet</h3>
            <p className="text-slate-500 mb-6">Start tracking your cashflow today.</p>
            <AddBusinessModal onSuccess={() => fetchData(true)} />
          </div>
        )}
      </div>

    </div>
  );
}