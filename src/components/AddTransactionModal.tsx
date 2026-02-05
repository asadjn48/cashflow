// src/components/AddTransactionModal.tsx
"use client";

import { useState } from "react";
import { db } from "@/src/lib/firebase"; 
import { doc, collection, runTransaction, serverTimestamp } from "firebase/firestore";
import { Plus, X, Loader2 } from "lucide-react";

export default function AddTransactionModal({ 
  userId, 
  businessId,
  onSuccess 
}: { 
  userId: string; 
  businessId: string;
  onSuccess?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (!userId || !businessId) return;
    setLoading(true);

    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as "income" | "expense";
    const description = formData.get("description") as string;

    try {
      // START TRANSACTION (ACID Compliant)
      await runTransaction(db, async (transaction) => {
        const businessRef = doc(db, "users", userId, "businesses", businessId);
        const newTransRef = doc(collection(db, "users", userId, "businesses", businessId, "transactions"));

        // 1. Read current stats
        const businessDoc = await transaction.get(businessRef);
        if (!businessDoc.exists()) throw "Business does not exist!";
        
        const currentStats = businessDoc.data().stats || { netProfit: 0, totalIncome: 0, totalExpense: 0 };
        const newStats = { ...currentStats };

        // 2. Calculate New Stats
        if (type === 'income') {
            newStats.totalIncome += amount;
            newStats.netProfit += amount;
        } else {
            newStats.totalExpense += amount;
            newStats.netProfit -= amount;
        }

        // 3. Write Data
        transaction.set(newTransRef, {
            amount,
            type,
            description,
            date: serverTimestamp(),
        });
        transaction.update(businessRef, { stats: newStats });
      });

      setIsOpen(false);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Transaction Failed:", error);
      alert("Failed to save. Permission denied?");
    }
    
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add Transaction
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white">New Transaction</h3>
          <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <input name="amount" type="number" step="0.01" required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select name="type" className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="income">Income (+)</option>
              <option value="expense">Expense (-)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input name="description" placeholder="e.g. Weekly Fuel" required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Save Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}