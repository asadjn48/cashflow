"use client";

import useSWR from "swr";
import { db } from "@/src/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/src/components/AuthProvider";
import { Business } from "@/src/types";

// 1. The Fetcher Function
const fetcher = async ([userId]: [string]) => {
  if (!userId) return { businesses: [], currencySymbol: "$" };

  // Fetch Business Data & Settings 
  const [businessesSnap, settingsSnap] = await Promise.all([
    getDocs(collection(db, "users", userId, "businesses")),
    getDoc(doc(db, "users", userId, "settings", "general"))
  ]);

  // 
  const businesses = businessesSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Business[];


  let currencySymbol = "$";
  if (settingsSnap.exists() && settingsSnap.data().currency) {
    const code = settingsSnap.data().currency;
    const symbols: Record<string, string> = { 
        USD: "$", AUD: "A$ ", PHP: "₱", PKR: "Rs ", EUR: "€", GBP: "£" 
    };
    currencySymbol = symbols[code] || code;
  }

  return { businesses, currencySymbol };
};

// 2. The Hook 
export function useBusinesses() {
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    user ? [user.uid, "businesses"] : null, 
    fetcher,
    {
      revalidateOnFocus: false, 
      dedupingInterval: 60000, 
    }
  );

  return {
    businesses: data?.businesses || [],
    currencySymbol: data?.currencySymbol || "$",
    isLoading,
    isError: error,
    refresh: mutate, 
  };
}