/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/business/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, collection, getDocs, orderBy, query, limit, runTransaction } from "firebase/firestore"; // Added runTransaction
import AddTransactionModal from "@/src/components/AddTransactionModal";
import EditTransactionModal from "@/src/components/EditTransactionModal"; // Import Edit Modal
import ProfitChart from "@/src/components/ProfitChart";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  Trash2, 
  Download, 
  Calendar,
  Pencil // Import Pencil Icon
} from "lucide-react";
import Link from "next/link";
import { Business } from "@/src/types";

export default function BusinessPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  // Data State
  const [business, setBusiness] = useState<Business | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]); 
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [editingTx, setEditingTx] = useState<any>(null); // State for the transaction being edited

  // --- 1. READ (Fetch Data) ---
  const fetchData = async () => {
    if (!user || !id) return;
    const businessId = Array.isArray(id) ? id[0] : id;

    try {
      const docRef = doc(db, "users", user.uid, "businesses", businessId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setBusiness({ id: docSnap.id, ...docSnap.data() } as Business);
        
        const transRef = collection(db, "users", user.uid, "businesses", businessId, "transactions");
        const q = query(transRef, orderBy("date", "desc"), limit(100)); 
        const transSnap = await getDocs(q);
        
        const transList = transSnap.docs.map(d => {
          const data = d.data();
          return { 
              id: d.id, 
              ...data, 
              date: data.date ? data.date.toDate().toISOString() : new Date().toISOString()
          };
        });
        setAllTransactions(transList);
        setFilteredTransactions(transList);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, id]);

  // --- FILTER LOGIC ---
  useEffect(() => {
    if (selectedMonth === "all") {
      setFilteredTransactions(allTransactions);
    } else {
      const filtered = allTransactions.filter(t => t.date.startsWith(selectedMonth));
      setFilteredTransactions(filtered);
    }
  }, [selectedMonth, allTransactions]);

  // --- 2. DELETE (Remove Transaction) ---
  async function handleDelete(transactionId: string) {
    if (!user || !business) return;
    if (!confirm("Are you sure? This will delete the transaction and reverse the profit calculation.")) return;
    

    const txToDelete = allTransactions.find(t => t.id === transactionId);
    if (!txToDelete) return;

    try {
      await runTransaction(db, async (txn) => {
        const businessRef = doc(db, "users", user.uid, "businesses", business.id);
        const transRef = doc(db, "users", user.uid, "businesses", business.id, "transactions", transactionId);
        
        const businessDoc = await txn.get(businessRef);
        if (!businessDoc.exists()) throw "Business missing";
        
        const currentStats = businessDoc.data().stats;
        const newStats = { ...currentStats };

        // Reverse Math
        if (txToDelete.type === 'income') {
          newStats.totalIncome -= txToDelete.amount;
          newStats.netProfit -= txToDelete.amount;
        } else {
          newStats.totalExpense -= txToDelete.amount;
          newStats.netProfit += txToDelete.amount;
        }

        txn.update(businessRef, { stats: newStats });
        txn.delete(transRef);
      });

      // Success
      setLoading(true);
      await fetchData(); 
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete transaction.");
    }
  }

  // --- EXPORT CSV LOGIC ---
  const handleExport = () => {
    if (!business) return;
    const headers = ["Date", "Description", "Type", "Amount", "Currency"];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      `"${t.description}"`, 
      t.type,
      t.amount,
      business.currency
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${business.name}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  if (!business) return <div className="text-center p-12">Business not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/dashboard" className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{business.name}</h1>
          <p className="text-slate-500 uppercase text-sm tracking-wider">{business.type}</p>
        </div>
        {/* --- 3. CREATE (Add Transaction) --- */}
        <AddTransactionModal userId={user!.uid} businessId={business.id} onSuccess={fetchData} />
      </div>

      {/* --- 4. UPDATE (Edit Modal - Conditionally Rendered) --- */}
      {editingTx && user && (
        <EditTransactionModal 
          isOpen={!!editingTx}
          userId={user.uid}
          businessId={business.id}
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSuccess={() => {
            fetchData(); // Refresh data after update
            setEditingTx(null); 
          }}
        />
      )}

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
                <option value="all">All Time (Last 100)</option>
                {Array.from({ length: 6 }).map((_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const value = d.toISOString().slice(0, 7);
                    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
                    return <option key={value} value={value}>{label}</option>
                })}
            </select>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
          <span className="text-emerald-600 text-sm font-medium">Net Profit</span>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {business.currency} {business.stats.netProfit.toLocaleString()}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 text-sm font-medium">Total Income</span>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            {business.stats.totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 text-sm font-medium">Total Expenses</span>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            {business.stats.totalExpense.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ProfitChart data={filteredTransactions} />

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">
            Transactions ({filteredTransactions.length})
          </h3>
        </div>
        <div className="divide-y dark:divide-slate-800">
          {filteredTransactions.map((t: any) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex-1">
                <p className="font-medium text-slate-800 dark:text-slate-200">{t.description}</p>
                <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                </span>
                
                {/* --- UPDATE Button (Edit) --- */}
                <button 
                  onClick={() => setEditingTx(t)}
                  className="p-2 text-slate-300 hover:text-blue-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  title="Edit Transaction"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* --- DELETE Button --- */}
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  title="Delete Transaction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
             <div className="p-8 text-center text-slate-500">No transactions found for this period.</div>
          )}
        </div>
      </div>
    </div>
  );
}