"use client";

import useSWR from "swr";
import { db } from "@/src/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/src/components/AuthProvider";
import { Business } from "@/src/types";

// 1. The Fetcher Function (The logic that actually touches Firebase)
const fetcher = async ([userId]: [string]) => {
  if (!userId) return { businesses: [], currencySymbol: "$" };

  // Fetch Business Data & Settings in Parallel
  const [businessesSnap, settingsSnap] = await Promise.all([
    getDocs(collection(db, "users", userId, "businesses")),
    getDoc(doc(db, "users", userId, "settings", "general"))
  ]);

  // Process Businesses
  const businesses = businessesSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Business[];

  // Process Currency
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

// 2. The Hook (The part you use in your components)
export function useBusinesses() {
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    user ? [user.uid, "businesses"] : null, // Unique Cache Key
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch just because I clicked the window
      dedupingInterval: 60000, // Cache data for 60 seconds (Super Fast!)
    }
  );

  return {
    businesses: data?.businesses || [],
    currencySymbol: data?.currencySymbol || "$",
    isLoading,
    isError: error,
    refresh: mutate, // Call this to force a reload (e.g., after adding a business)
  };
}