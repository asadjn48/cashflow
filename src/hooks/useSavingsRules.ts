


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/components/AuthProvider";
import { SavingsRule, SavingsConfig } from "@/src/types";

const DEFAULT_RULES: SavingsConfig = {
  allocations: [
    { id: "1", name: "Business Improvements", percent: 0, color: "#0663F4", balance: 0 },
    { id: "2", name: "Future Investments", percent: 0, color: "#10b981", balance: 0 },
    { id: "3", name: "Education, Travel & Family Growth", percent: 0, color: "#8b5cf6", balance: 0 },
    { id: "4", name: "Other", percent: 100, color: "#ef4444", balance: 0 },
  ],
  totalDistributed: 0,
  totalSpent: 0
};

export function useSavingsRules() {
  const { user } = useAuth();
  const [config, setConfig] = useState<SavingsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "savings_rules", "current");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().allocations) {
        const data = docSnap.data();
        setConfig({
          allocations: data.allocations.map((a: any) => ({ ...a, balance: a.balance || 0 })),
          totalDistributed: data.totalDistributed || 0,
          totalSpent: data.totalSpent || 0
        });
      } else {
        setConfig(DEFAULT_RULES);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); 
  }, [user]);

  const saveRules = async (newRules: SavingsRule[]) => {
    if (!user || !config) return false;
    const oldTotalBalance = config.allocations.reduce((sum, r) => sum + (r.balance || 0), 0);
    const newTotalBalance = newRules.reduce((sum, r) => sum + (r.balance || 0), 0);
    let newTotalDistributed = config.totalDistributed || 0;

    if (newTotalBalance < oldTotalBalance) {
      newTotalDistributed = Math.max(0, newTotalDistributed - (oldTotalBalance - newTotalBalance));
    }

    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), { ...config, allocations: newRules, totalDistributed: newTotalDistributed }, { merge: true });
      return true;
    } catch { return false; }
  };

  const distributeProfit = async (amountToDistribute: number, currentRules: SavingsRule[]) => {
    if (!user || !config) return false;
    const newRules = currentRules.map(rule => ({
      ...rule, balance: (rule.balance || 0) + (amountToDistribute * (rule.percent / 100))
    }));
    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), { allocations: newRules, totalDistributed: config.totalDistributed + amountToDistribute }, { merge: true });
      return true;
    } catch { return false; }
  };

  const spendFromCategory = async (ruleId: string, amountToSpend: number) => {
    if (!user || !config) return false;
    const newRules = config.allocations.map(rule => {
      if (rule.id === ruleId) return { ...rule, balance: Math.max(0, rule.balance - amountToSpend) };
      return rule;
    });
    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), { allocations: newRules, totalSpent: config.totalSpent + amountToSpend }, { merge: true });
      return true;
    } catch { return false; }
  };

  const resetLedger = async () => {
    if (!user || !config) return false;
    const newRules = config.allocations.map(r => ({ ...r, balance: 0 }));
    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), { allocations: newRules, totalDistributed: 0, totalSpent: 0 }, { merge: true });
      return true;
    } catch { return false; }
  };

  return { config, isLoading, saveRules, distributeProfit, spendFromCategory, resetLedger };
}