"use client";

import useSWR from "swr";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/components/AuthProvider";
import { SavingsRule } from "@/src/types";

// The "Worker" that fetches data
const fetcher = async (uid: string) => {
  const rulesRef = doc(db, "users", uid, "savings_rules", "current");
  const rulesSnap = await getDoc(rulesRef);

  if (rulesSnap.exists() && rulesSnap.data().allocations) {
    return rulesSnap.data().allocations as SavingsRule[];
  }
  
  // Default Rules if none exist
  return [
    { id: "1", name: "Business Growth", percent: 20, color: "#0663F4" },
    { id: "2", name: "Emergency Fund", percent: 10, color: "#ef4444" },
    { id: "3", name: "Personal Salary", percent: 70, color: "#10b981" },
  ];
};

export function useSavingsRules() {
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    user ? [user.uid, "savings_rules"] : null,
    ([uid]) => fetcher(uid),
    {
      revalidateOnFocus: false, // Don't reload just because I clicked the window
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Custom Save Function (Updates UI Instantly)
  const saveRules = async (newRules: SavingsRule[]) => {
    if (!user) return;
    
    // 1. Update UI Immediately (Optimistic Update)
    mutate(newRules, false); 
    
    // 2. Update Database in Background
    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), { allocations: newRules }, { merge: true });
      mutate(newRules); // Re-verify with DB
      return true;
    } catch (error) {
      console.error("Failed to save rules", error);
      return false;
    }
  };

  return {
    rules: data || [],
    isLoading,
    isError: error,
    saveRules
  };
}