/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Business } from "@/src/types";

// 1. Define the Shape of a Transaction (So TS stops complaining)
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  [key: string]: any; // Allow other fields
}

const fetcher = async ([uid, businessId]: [string, string]) => {
  // 1. Fetch Business Details
  const bizRef = doc(db, "users", uid, "businesses", businessId);
  const bizSnap = await getDoc(bizRef);
  
  if (!bizSnap.exists()) throw new Error("Business not found");
  
  const business = { id: bizSnap.id, ...bizSnap.data() } as Business;

  // 2. Fetch Transactions
  const transRef = collection(db, "users", uid, "businesses", businessId, "transactions");
  const q = query(transRef, orderBy("date", "desc"), limit(500));
  const transSnap = await getDocs(q);

  const transactions = transSnap.docs.map(d => {
    // FIX: Cast data as 'any' so we can access description/amount without TS errors
    const data = d.data() as any; 
    
    return {
      id: d.id,
      description: data.description || "No description", // Default values preventing crash
      amount: Number(data.amount) || 0,
      type: data.type || "expense",
      date: data.date ? data.date.toDate().toISOString() : new Date().toISOString()
    } as Transaction;
  });

  return { business, transactions };
};

// FIX: Allow 'userId' to be undefined (it handles the logged-out state)
export function useBusinessData(userId: string | undefined, businessId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId && businessId ? [userId, businessId] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, 
    }
  );

  return {
    business: data?.business,
    transactions: data?.transactions || [],
    isLoading,
    isError: error,
    refresh: mutate
  };
}