/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider";
import { useBusinessData } from "@/src/hooks/useBusinessData"; 
import { db } from "@/src/lib/firebase";
import { doc, runTransaction } from "firebase/firestore";
import { useToast } from "@/src/components/ToastProvider";

// Imported Components
import BusinessHeader from "@/src/components/BusinessHeader";
import BusinessStatsCards from "@/src/components/BusinessStatsCards";
import TransactionsList from "@/src/components/TransactionsList";
import DeleteTransactionModal from "@/src/components/DeleteTransactionModal";
import TransactionFilters from "@/src/components/TransactionFilters";
import EditTransactionModal from "@/src/components/EditTransactionModal";
import ProfitChart from "@/src/components/ProfitChart";
import { Loader2 } from "lucide-react";

export default function BusinessPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  // FIX: Ensure businessId is always a string, never undefined
  const businessId = Array.isArray(id) ? id[0] : (id || "");
  
  // 1. FAST DATA FETCHING (Now safe because businessId is definitely a string)
  const { business, transactions, isLoading, refresh } = useBusinessData(user?.uid, businessId);

  // 2. STATE
  const [timeRange, setTimeRange] = useState<"monthly" | "yearly" | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingTx, setEditingTx] = useState<any>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 3. FILTER LOGIC
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: any) => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (timeRange === "all") return matchesSearch;
      if (timeRange === "monthly") return t.date.startsWith(selectedMonth) && matchesSearch;
      if (timeRange === "yearly") return t.date.startsWith(selectedYear) && matchesSearch;
      return matchesSearch;
    });
  }, [transactions, timeRange, selectedMonth, selectedYear, searchQuery]);

  // 4. STATS CALCULATION
  const filteredStats = useMemo(() => {
    return filteredTransactions.reduce((acc: any, t: any) => {
      if (t.type === 'income') {
        acc.income += t.amount;
        acc.profit += t.amount;
      } else {
        acc.expense += t.amount;
        acc.profit -= t.amount;
      }
      return acc;
    }, { income: 0, expense: 0, profit: 0 });
  }, [filteredTransactions]);

  // 5. ACTIONS
  const handleExport = () => {
    if (!business) return;
    const headers = ["Date", "Description", "Type", "Amount", "Currency"];
    const rows = filteredTransactions.map((t: any) => [
      new Date(t.date).toLocaleDateString(), `"${t.description}"`, t.type, t.amount, business.currency
    ]);
    const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${business.name}_${timeRange}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Export downloaded", "success");
  };

  const confirmDelete = async () => {
    if (!user || !business || !deletingTxId) return;
    setIsDeleting(true);
    // TypeScript safe finding
    const txToDelete = transactions.find((t: any) => t.id === deletingTxId);
    
    try {
      if (txToDelete) {
        await runTransaction(db, async (txn) => {
            const businessRef = doc(db, "users", user.uid, "businesses", business.id);
            const transRef = doc(db, "users", user.uid, "businesses", business.id, "transactions", deletingTxId);
            const businessDoc = await txn.get(businessRef);
            if (!businessDoc.exists()) throw "Business missing";

            const currentStats = businessDoc.data().stats;
            const newStats = { ...currentStats };

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
        showToast("Transaction deleted", "success");
        refresh(); 
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to delete", "error");
    } finally {
      setIsDeleting(false);
      setDeletingTxId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[hsl(var(--primary))]" /></div>;
  if (!business) return <div className="text-center p-12">Business not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      <BusinessHeader 
        businessName={business.name} 
        userId={user!.uid} 
        businessId={business.id} 
        onRefresh={refresh} 
      />

      <TransactionFilters 
        timeRange={timeRange} setTimeRange={setTimeRange}
        selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        onExport={handleExport}
      />

      <BusinessStatsCards 
        stats={filteredStats} 
        currency={business.currency} 
        timeRange={timeRange} 
      />

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-100">
         <ProfitChart data={filteredTransactions} />
      </div>

      <TransactionsList 
        transactions={filteredTransactions} 
        onEdit={setEditingTx} 
        onDelete={setDeletingTxId} 
      />

      <DeleteTransactionModal 
        isOpen={!!deletingTxId} 
        onClose={() => setDeletingTxId(null)} 
        onConfirm={confirmDelete} 
        isDeleting={isDeleting}
      />

      {editingTx && user && (
        <EditTransactionModal 
          isOpen={!!editingTx} userId={user.uid} businessId={business.id} transaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSuccess={() => { refresh(); showToast("Transaction updated", "success"); setEditingTx(null); }}
        />
      )}
    </div>
  );
}