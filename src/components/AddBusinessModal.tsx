/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/AddBusinessModal.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/src/components/AuthProvider"; 
// REMOVED: import { createBusiness } from "@/actions/business"; 
// ADDED: Direct Firebase Imports
import { db } from "@/src/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Plus, X, Loader2 } from "lucide-react";

export default function AddBusinessModal({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (!user) return; 

    setLoading(true);
    const name = formData.get("name") as string;
    const type = formData.get("type") as any;
    const currency = formData.get("currency") as string;

    try {
      // FIX: Write directly to Firestore so Security Rules recognize 'user'
      await addDoc(collection(db, "users", user.uid, "businesses"), {
        name,
        type,
        currency,
        stats: {
          netProfit: 0,
          totalIncome: 0,
          totalExpense: 0,
        },
        createdAt: serverTimestamp(),
      });

      // Success!
      setIsOpen(false);
      if (onSuccess) onSuccess(); 

    } catch (error) {
      console.error("Error adding business:", error);
      alert("Error creating business (Permission Denied?)");
    }
    
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        disabled={!user} 
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Add Business
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-800">
          <h2 className="text-lg font-semibold dark:text-white">New Business</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form action={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
            <input name="name" required placeholder="e.g. City Taxi 1" className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select name="type" className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <option value="taxi">Taxi</option>
                <option value="laundry">Laundry</option>
                <option value="carwash">Car Wash</option>
                <option value="property">Rental</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
              <select name="currency" className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <option value="USD">USD ($)</option>
                <option value="PKR">PKR (Rs)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Business"}
          </button>
        </form>
      </div>
    </div>
  );
}