/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/EditTransactionModal.tsx
"use client";

import { useState } from "react";
import { db } from "@/src/lib/firebase";
import { doc, runTransaction } from "firebase/firestore";
import { Loader2, Save, X } from "lucide-react";

export default function EditTransactionModal({
  userId,
  businessId,
  transaction,
  isOpen,
  onClose,
  onSuccess
}: {
  userId: string;
  businessId: string;
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as "income" | "expense";
    const description = formData.get("description") as string;

    try {
      await runTransaction(db, async (txn) => {
        const businessRef = doc(db, "users", userId, "businesses", businessId);
        const transRef = doc(db, "users", userId, "businesses", businessId, "transactions", transaction.id);

        const businessDoc = await txn.get(businessRef);
        if (!businessDoc.exists()) throw "Business missing";

        const currentStats = businessDoc.data().stats;
        let newStats = { ...currentStats };

        // 1. Reverse OLD Math
        if (transaction.type === 'income') {
            newStats.totalIncome -= transaction.amount;
            newStats.netProfit -= transaction.amount;
        } else {
            newStats.totalExpense -= transaction.amount;
            newStats.netProfit += transaction.amount;
        }

        // 2. Apply NEW Math
        if (type === 'income') {
            newStats.totalIncome += amount;
            newStats.netProfit += amount;
        } else {
            newStats.totalExpense += amount;
            newStats.netProfit -= amount;
        }

        // 3. Commit
        txn.update(businessRef, { stats: newStats });
        txn.update(transRef, { amount, type, description });
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update transaction.");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white">Edit Transaction</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <input name="amount" type="number" step="0.01" defaultValue={transaction.amount} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select name="type" defaultValue={transaction.type} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="income">Income (+)</option>
              <option value="expense">Expense (-)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input name="description" defaultValue={transaction.description} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}