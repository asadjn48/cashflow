// src/app/dashboard/page.tsx
"use client"; 

import { useEffect, useState, useCallback } from "react";
// REMOVE: import { getBusinesses } from "@/actions/business";
// ADD: Direct Firebase Imports
import { db } from "@/src/lib/firebase"; 
import { collection, getDocs } from "firebase/firestore";

import { useAuth } from "@/src/components/AuthProvider"; 
import BusinessCard from "@/src/components/BusinessCard";
import AddBusinessModal from "@/src/components/AddBusinessModal";
import { Wallet, Loader2 } from "lucide-react";
import { Business } from "@/src/types";

export default function Dashboard() {
  const { user } = useAuth(); 
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // FIX: Fetch directly from Client so Security Rules let us in
  const fetchData = useCallback(async () => {
    if (user) {
      try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "businesses"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Business[];
        
        setBusinesses(data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate Global Stats
  const totalNetProfit = businesses.reduce((sum, b) => sum + b.stats.netProfit, 0);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.email}</p>
        </div>
        {/* Pass fetchData so it refreshes after adding */}
        <AddBusinessModal onSuccess={fetchData} /> 
      </div>
      
       <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/10 rounded-lg">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-slate-300 font-medium">Total Net Profit</span>
        </div>
        <div className="text-5xl font-bold tracking-tight">
          ${totalNetProfit.toLocaleString()}
        </div>
      </div>

       <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Your Businesses</h2>
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business}/>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500">No businesses found. Add one to get started.</p>
          </div>
        )}
      </div>

    </div>
  );
}