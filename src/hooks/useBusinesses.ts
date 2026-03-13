






"use client";

import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/src/components/AuthProvider";
import { Business } from "@/src/types";

export function useBusinesses() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubBiz = onSnapshot(collection(db, "users", user.uid, "businesses"), (snap) => {
      const bizData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Business[];
      setBusinesses(bizData);
      setIsLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, "users", user.uid, "settings", "general"), (snap) => {
      if (snap.exists() && snap.data().currency) {
        const code = snap.data().currency;
        const symbols: Record<string, string> = { USD: "$", AUD: "A$", PHP: "₱", PKR: "Rs ", EUR: "€", GBP: "£" };
        setCurrencySymbol(symbols[code] || code);
      }
    });

    return () => { unsubBiz(); unsubSettings(); };
  }, [user]);

  const refresh = () => {}; 

  return { businesses, currencySymbol, isLoading, isError: false, refresh };
}