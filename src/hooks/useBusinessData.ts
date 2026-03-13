


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { doc, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Business } from "@/src/types";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  [key: string]: any; 
}

export function useBusinessData(userId: string | undefined, businessId: string) {
  const [business, setBusiness] = useState<Business | undefined>(undefined);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !businessId) return;

    const unsubBiz = onSnapshot(doc(db, "users", userId, "businesses", businessId), (docSnap) => {
      if (docSnap.exists()) {
        setBusiness({ id: docSnap.id, ...docSnap.data() } as Business);
      }
    });

    const q = query(collection(db, "users", userId, "businesses", businessId, "transactions"), orderBy("date", "desc"), limit(500));
    const unsubTrans = onSnapshot(q, (transSnap) => {
      const txData = transSnap.docs.map(d => {
        const data = d.data() as any; 
        return {
          id: d.id,
          description: data.description || "No description", 
          amount: Number(data.amount) || 0,
          type: data.type || "expense",
          date: data.date ? data.date.toDate().toISOString() : new Date().toISOString()
        } as Transaction;
      });
      setTransactions(txData);
      setIsLoading(false);
    });

    return () => { unsubBiz(); unsubTrans(); };
  }, [userId, businessId]);

  const refresh = () => {};
  return { business, transactions, isLoading, isError: false, refresh };
}