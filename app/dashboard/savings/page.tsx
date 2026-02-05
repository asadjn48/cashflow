/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/savings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { db } from "@/src/lib/firebase"; // ADDED
import { collection, doc, getDocs, getDoc } from "firebase/firestore"; // ADDED
import SavingsDistribution from "@/src/components/SavingsDistribution";
import { PiggyBank, Loader2 } from "lucide-react";
import { Business, SavingsRule } from "@/src/types";

export default function SavingsPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          // 1. Fetch Businesses (Client Side)
          const businessesSnapshot = await getDocs(collection(db, "users", user.uid, "businesses"));
          const businessesData = businessesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Business[];

          // 2. Fetch Savings Rules (Client Side)
          const rulesRef = doc(db, "users", user.uid, "savings_rules", "current");
          const rulesSnap = await getDoc(rulesRef);
          
          let rulesData: SavingsRule[] = [];
          if (rulesSnap.exists() && rulesSnap.data().allocations) {
            rulesData = rulesSnap.data().allocations;
          }

          setBusinesses(businessesData);
          setRules(rulesData);
        } catch (error) {
          console.error("Error fetching savings data:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [user]);

  const totalNetProfit = businesses.reduce((sum, b) => sum + b.stats.netProfit, 0);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-emerald-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
          <PiggyBank className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Savings & Allocations</h1>
          <p className="text-slate-500">Automated distribution of your {totalNetProfit.toLocaleString()} profit.</p>
        </div>
      </div>

      <SavingsDistribution totalProfit={totalNetProfit} rules={rules} />
    </div>
  );
}