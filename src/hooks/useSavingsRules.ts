/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import useSWR from "swr";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { db } from "@/src/lib/firebase";
// import { useAuth } from "@/src/components/AuthProvider";
// import { SavingsRule } from "@/src/types";

// // The "Worker" that fetches data
// const fetcher = async (uid: string) => {
//   const rulesRef = doc(db, "users", uid, "savings_rules", "current");
//   const rulesSnap = await getDoc(rulesRef);

//   if (rulesSnap.exists() && rulesSnap.data().allocations) {
//     return rulesSnap.data().allocations as SavingsRule[];
//   }
  
//   // Default Rules if none exist
//   return [
//     { id: "1", name: "Business Growth", percent: 20, color: "#0663F4" },
//     { id: "2", name: "Emergency Fund", percent: 10, color: "#ef4444" },
//     { id: "3", name: "Personal Salary", percent: 70, color: "#10b981" },
//   ];
// };

// export function useSavingsRules() {
//   const { user } = useAuth();

//   const { data, error, isLoading, mutate } = useSWR(
//     user ? [user.uid, "savings_rules"] : null,
//     ([uid]) => fetcher(uid),
//     {
//       revalidateOnFocus: false, // Don't reload just because I clicked the window
//       dedupingInterval: 60000, // Cache for 1 minute
//     }
//   );

//   // Custom Save Function (Updates UI Instantly)
//   const saveRules = async (newRules: SavingsRule[]) => {
//     if (!user) return;
    
//     // 1. Update UI Immediately (Optimistic Update)
//     mutate(newRules, false); 
    
//     // 2. Update Database in Background
//     try {
//       await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), { allocations: newRules }, { merge: true });
//       mutate(newRules); // Re-verify with DB
//       return true;
//     } catch (error) {
//       console.error("Failed to save rules", error);
//       return false;
//     }
//   };

//   return {
//     rules: data || [],
//     isLoading,
//     isError: error,
//     saveRules
//   };
// }























// "use client";

// import useSWR from "swr";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { db } from "@/src/lib/firebase";
// import { useAuth } from "@/src/components/AuthProvider";
// import { SavingsRule, SavingsConfig } from "@/src/types";

// const fetcher = async (uid: string): Promise<SavingsConfig> => {
//   const rulesRef = doc(db, "users", uid, "savings_rules", "current");
//   const rulesSnap = await getDoc(rulesRef);

//   if (rulesSnap.exists() && rulesSnap.data().allocations) {
//     const fetchedData = rulesSnap.data();
//     const allocations = fetchedData.allocations.map((a: any) => ({ ...a, balance: a.balance || 0 }));
//     return { allocations, totalDistributed: fetchedData.totalDistributed || 0 };
//   }
  
//   return {
//     allocations: [
//       { id: "1", name: "Business Growth", percent: 20, color: "#0663F4", balance: 0 },
//       { id: "2", name: "Emergency Fund", percent: 10, color: "#ef4444", balance: 0 },
//       { id: "3", name: "Personal Salary", percent: 70, color: "#10b981", balance: 0 },
//     ],
//     totalDistributed: 0
//   };
// };

// export function useSavingsRules() {
//   const { user } = useAuth();

//   // SWR stores the fetched info in the 'data' variable
//   const { data, error, isLoading, mutate } = useSWR<SavingsConfig>(
//     user ? [user.uid, "savings_rules"] : null,
//     ([uid]) => fetcher(uid as string),
//     { revalidateOnFocus: false, dedupingInterval: 60000 }
//   );

//   // 1. Save Rules
//   const saveRules = async (newRules: SavingsRule[]) => {
//     if (!user || !data) return false;

//     const oldTotalBalance = data.allocations.reduce((sum, r) => sum + (r.balance || 0), 0);
//     const newTotalBalance = newRules.reduce((sum, r) => sum + (r.balance || 0), 0);
    
//     let newTotalDistributed = data.totalDistributed || 0;

//     if (newTotalBalance < oldTotalBalance) {
//       const difference = oldTotalBalance - newTotalBalance;
//       newTotalDistributed = Math.max(0, newTotalDistributed - difference);
//     }

//     const updatedConfig = { allocations: newRules, totalDistributed: newTotalDistributed };
//     mutate(updatedConfig, false); 

//     try {
//       await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), updatedConfig, { merge: true });
//       mutate(updatedConfig); 
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };

//   // 2. Distribute New Profit
//   const distributeProfit = async (amountToDistribute: number, currentRules: SavingsRule[]) => {
//     if (!user || !data) return false;

//     const newRules = currentRules.map(rule => ({
//       ...rule,
//       balance: (rule.balance || 0) + (amountToDistribute * (rule.percent / 100))
//     }));
    
//     const newTotalDistributed = (data.totalDistributed || 0) + amountToDistribute;
    
//     const updatedConfig = { allocations: newRules, totalDistributed: newTotalDistributed };
//     mutate(updatedConfig, false);

//     try {
//       await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), updatedConfig, { merge: true });
//       mutate(updatedConfig); 
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };

//   // 3. Spend / Deduct
//   const spendFromCategory = async (ruleId: string, amountToSpend: number) => {
//     if (!user || !data) return false;

//     const newRules = data.allocations.map(rule => {
//       if (rule.id === ruleId) return { ...rule, balance: Math.max(0, rule.balance - amountToSpend) };
//       return rule;
//     });

//     const updatedConfig = { ...data, allocations: newRules };
//     mutate(updatedConfig, false);

//     try {
//       await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), { allocations: newRules }, { merge: true });
//       mutate(updatedConfig); 
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };

//   // 4. Emergency Reset Ledger
//   const resetLedger = async () => {
//     if (!user || !data) return false;
    
//     const newRules = data.allocations.map(r => ({ ...r, balance: 0 }));
    
//     const updatedConfig = { allocations: newRules, totalDistributed: 0 };
//     mutate(updatedConfig, false); 

//     try {
//       await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), updatedConfig, { merge: true });
//       mutate(updatedConfig); 
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };

//   // FIX APPLIED HERE: Map the SWR 'data' to 'config'
//   return { 
//     config: data, 
//     isLoading, 
//     isError: error, 
//     saveRules, 
//     distributeProfit, 
//     spendFromCategory, 
//     resetLedger 
//   };
// }
























"use client";

import useSWR from "swr";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/components/AuthProvider";
import { SavingsRule, SavingsConfig } from "@/src/types";

const fetcher = async (uid: string): Promise<SavingsConfig> => {
  const rulesRef = doc(db, "users", uid, "savings_rules", "current");
  const rulesSnap = await getDoc(rulesRef);

  if (rulesSnap.exists() && rulesSnap.data().allocations) {
    const fetchedData = rulesSnap.data();
    const allocations = fetchedData.allocations.map((a: any) => ({ ...a, balance: a.balance || 0 }));
    return { 
      allocations, 
      totalDistributed: fetchedData.totalDistributed || 0,
      totalSpent: fetchedData.totalSpent || 0 // <-- Fetch total spent
    };
  }
  
  // NEW: Requested Default Categories
  return {
    allocations: [
      { id: "1", name: "Business Improvements", percent: 0, color: "#0663F4", balance: 0 },
      { id: "2", name: "Future Investments", percent: 0, color: "#10b981", balance: 0 },
      { id: "3", name: "Education, Travel & Family Growth", percent: 0, color: "#8b5cf6", balance: 0 },
      { id: "4", name: "Other", percent: 100, color: "#ef4444", balance: 0 },
    ],
    totalDistributed: 0,
    totalSpent: 0
  };
};

export function useSavingsRules() {
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<SavingsConfig>(
    user ? [user.uid, "savings_rules"] : null,
    ([uid]) => fetcher(uid as string),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const saveRules = async (newRules: SavingsRule[]) => {
    if (!user || !data) return false;

    const oldTotalBalance = data.allocations.reduce((sum, r) => sum + (r.balance || 0), 0);
    const newTotalBalance = newRules.reduce((sum, r) => sum + (r.balance || 0), 0);
    let newTotalDistributed = data.totalDistributed || 0;

    if (newTotalBalance < oldTotalBalance) {
      const difference = oldTotalBalance - newTotalBalance;
      newTotalDistributed = Math.max(0, newTotalDistributed - difference);
    }

    const updatedConfig = { ...data, allocations: newRules, totalDistributed: newTotalDistributed };
    mutate(updatedConfig, false); 

    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), updatedConfig, { merge: true });
      mutate(updatedConfig); 
      return true;
    } catch (error) {
      return false;
    }
  };

  const distributeProfit = async (amountToDistribute: number, currentRules: SavingsRule[]) => {
    if (!user || !data) return false;

    const newRules = currentRules.map(rule => ({
      ...rule,
      balance: (rule.balance || 0) + (amountToDistribute * (rule.percent / 100))
    }));
    
    const newTotalDistributed = (data.totalDistributed || 0) + amountToDistribute;
    
    const updatedConfig = { ...data, allocations: newRules, totalDistributed: newTotalDistributed };
    mutate(updatedConfig, false);

    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), updatedConfig, { merge: true });
      mutate(updatedConfig); 
      return true;
    } catch (error) {
      return false;
    }
  };

  // UPDATED: Now tracks total lifetime spent
  const spendFromCategory = async (ruleId: string, amountToSpend: number) => {
    if (!user || !data) return false;

    const newRules = data.allocations.map(rule => {
      if (rule.id === ruleId) return { ...rule, balance: Math.max(0, rule.balance - amountToSpend) };
      return rule;
    });

    const newTotalSpent = (data.totalSpent || 0) + amountToSpend;

    const updatedConfig = { ...data, allocations: newRules, totalSpent: newTotalSpent };
    mutate(updatedConfig, false);

    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), updatedConfig, { merge: true });
      mutate(updatedConfig); 
      return true;
    } catch (error) {
      return false;
    }
  };

  const resetLedger = async () => {
    if (!user || !data) return false;
    const newRules = data.allocations.map(r => ({ ...r, balance: 0 }));
    const updatedConfig = { allocations: newRules, totalDistributed: 0, totalSpent: 0 };
    mutate(updatedConfig, false); 

    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), updatedConfig, { merge: true });
      mutate(updatedConfig); 
      return true;
    } catch (error) {
      return false;
    }
  };

  return { config:data, isLoading, isError:error, saveRules, distributeProfit, spendFromCategory, resetLedger };
}