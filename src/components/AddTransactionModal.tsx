/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useRef } from "react";
import { db } from "@/src/lib/firebase"; 
import { doc, collection, runTransaction, serverTimestamp } from "firebase/firestore";
import { Plus, X, Loader2 } from "lucide-react";
import { mutate } from "swr"; 

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
  
  const isSubmitting = useRef(false); 

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); 
    const formData = new FormData(e.currentTarget);

    if (!userId || !businessId || isSubmitting.current) return;
    
    isSubmitting.current = true;
    setLoading(true);

    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as "income" | "expense";
    
    const rawDesc = (formData.get("description") as string) || "";
    const description = rawDesc.trim() === "" ? (type === 'income' ? 'Income' : 'Expense') : rawDesc.trim();


    const fakeTx = { id: Date.now().toString(), amount, type, description, date: new Date().toISOString() };

    mutate([userId, businessId], (currentData: any) => {
        if (!currentData) return currentData;
        const newStats = { ...currentData.business.stats };
        if (type === 'income') {
            newStats.totalIncome += amount;
            newStats.netProfit += amount;
        } else {
            newStats.totalExpense += amount;
            newStats.netProfit -= amount;
        }
        return {
            business: { ...currentData.business, stats: newStats },
            transactions: [fakeTx, ...currentData.transactions]
        };
    }, false); 

    mutate([userId, "businesses"], (currentData: any) => {
         if(!currentData) return currentData;
         return {
             ...currentData,
             businesses: currentData.businesses.map((b: any) => {
                 if(b.id !== businessId) return b;
                 const newStats = { ...b.stats };
                 if (type === 'income') {
                     newStats.totalIncome += amount;
                     newStats.netProfit += amount;
                 } else {
                     newStats.totalExpense += amount;
                     newStats.netProfit -= amount;
                 }
                 return { ...b, stats: newStats };
             })
         };
    }, false);

    setIsOpen(false);
    setLoading(false);
    if (onSuccess) onSuccess();
    try {
      await runTransaction(db, async (transaction) => {
        const businessRef = doc(db, "users", userId, "businesses", businessId);
        const newTransRef = doc(collection(db, "users", userId, "businesses", businessId, "transactions"));

        const businessDoc = await transaction.get(businessRef);
        if (!businessDoc.exists()) throw "Business does not exist!";
        
        const currentStats = businessDoc.data().stats || { netProfit: 0, totalIncome: 0, totalExpense: 0 };
        const newStats = { ...currentStats };

        if (type === 'income') {
            newStats.totalIncome += amount;
            newStats.netProfit += amount;
        } else {
            newStats.totalExpense += amount;
            newStats.netProfit -= amount;
        }

        transaction.set(newTransRef, { amount, type, description, date: serverTimestamp() });
        transaction.update(businessRef, { stats: newStats });
      });

      mutate([userId, businessId]);
      mutate([userId, "businesses"]);

    } catch (error) {
      console.error("Transaction Failed:", error);
      alert("Failed to save. Permission denied?");
      mutate([userId, businessId]);
      mutate([userId, "businesses"]);
    }
    
    isSubmitting.current = false; 
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
        <Plus className="w-4 h-4" /> Add Transaction
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold dark:text-white">New Transaction</h3>
          <button 
            onClick={() => setIsOpen(false)} 
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 mb-1 block">Amount</label>
            <input 
                name="amount" 
                type="number" 
                step="0.01" 
                required 
                className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none transition-all" 
                placeholder="0.00"
                autoFocus
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 mb-1 block">Type</label>
            <select 
                name="type" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none transition-all cursor-pointer"
            >
              <option value="income">Income (+)</option>
              <option value="expense">Expense (-)</option>
            </select>
          </div>
          
          <div>
            <div className="flex justify-between items-end ml-1 mb-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Optional</span>
            </div>
            <input 
                name="description" 
                required={false} 
                placeholder="e.g. Weekly Fuel" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl font-medium dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none transition-all placeholder:text-slate-400" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Processing...
                </>
            ) : (
                "Save Transaction"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}