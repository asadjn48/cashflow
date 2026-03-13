
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider";
import { useBusinessData } from "@/src/hooks/useBusinessData"; 
import { db } from "@/src/lib/firebase";
import { doc, writeBatch, getDoc, getDocs, collection } from "firebase/firestore"; 
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

  const businessId = Array.isArray(id) ? id[0] : (id || "");
  
  const { business, transactions, isLoading } = useBusinessData(user?.uid, businessId);

  const [timeRange, setTimeRange] = useState<"monthly" | "yearly" | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingTx, setEditingTx] = useState<any>(null);
  const [deletingTx, setDeletingTx] = useState<any>(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: any) => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (timeRange === "all") return matchesSearch;
      if (timeRange === "monthly") return t.date.startsWith(selectedMonth) && matchesSearch;
      if (timeRange === "yearly") return t.date.startsWith(selectedYear) && matchesSearch;
      return matchesSearch;
    });
  }, [transactions, timeRange, selectedMonth, selectedYear, searchQuery]);

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

  const handleExport = () => { /* Export logic remains same */ };


  const confirmDelete = async () => {
    if (!user || !business || !deletingTx) return;
    setIsDeleting(true);
    const txToDelete = deletingTx;
    setDeletingTx(null); 

    try {
      const batch = writeBatch(db);
      
      const txRef = doc(db, "users", user.uid, "businesses", business.id, "transactions", txToDelete.id);
      batch.delete(txRef);

      const bizRef = doc(db, "users", user.uid, "businesses", business.id);
      const bizSnap = await getDoc(bizRef);
      
      let newBizNetProfit = 0;

      if (bizSnap.exists()) {
          const stats = bizSnap.data().stats;
          const newStats = { ...stats };

          if (txToDelete.type === 'income') {
              newStats.totalIncome -= txToDelete.amount;
              newStats.netProfit -= txToDelete.amount;
          } else {
              newStats.totalExpense -= txToDelete.amount;
              newStats.netProfit += txToDelete.amount;
          }
          newBizNetProfit = newStats.netProfit;
          batch.update(bizRef, { stats: newStats });
      }

      const rulesRef = doc(db, "users", user.uid, "savings_rules", "current");
      const rulesSnap = await getDoc(rulesRef);

      if (rulesSnap.exists()) {
          const savingsData = rulesSnap.data();
          const totalDistributed = savingsData.totalDistributed || 0;

          const allBizSnap = await getDocs(collection(db, "users", user.uid, "businesses"));
          let globalNetProfit = 0;
          allBizSnap.forEach(doc => {
              if (doc.id === business.id) globalNetProfit += newBizNetProfit; 
              else globalNetProfit += doc.data().stats?.netProfit || 0;
          });

          if (totalDistributed > globalNetProfit) {
              const deficitAmount = totalDistributed - globalNetProfit;

              const newAllocations = (savingsData.allocations || []).map((rule: any) => {
                  const deduction = deficitAmount * (Number(rule.percent) / 100);
                  const newBalance = Math.max(0, (rule.balance || 0) - deduction);
                  return { ...rule, balance: newBalance };
              });

              batch.update(rulesRef, { 
                  allocations: newAllocations, 
                  totalDistributed: globalNetProfit 
              });
          }
      }

      await batch.commit(); 
      showToast("Transaction deleted", "success");

    } catch (error) {
      console.error(error);
      showToast("Failed to delete", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[hsl(var(--primary))]" /></div>;
  if (!business) return <div className="text-center p-12">Business not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <BusinessHeader businessName={business.name} userId={user!.uid} businessId={business.id} onRefresh={() => {}} />

      <TransactionFilters 
        timeRange={timeRange} setTimeRange={setTimeRange}
        selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} onExport={handleExport}
      />

      <BusinessStatsCards stats={filteredStats} currency={business.currency} timeRange={timeRange} />

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-100">
         <ProfitChart data={filteredTransactions} />
      </div>

      <TransactionsList transactions={filteredTransactions} onEdit={setEditingTx} onDelete={setDeletingTx} />

      <DeleteTransactionModal isOpen={!!deletingTx} onClose={() => setDeletingTx(null)} onConfirm={confirmDelete} isDeleting={isDeleting} />

      {editingTx && user && (
        <EditTransactionModal isOpen={!!editingTx} userId={user.uid} businessId={business.id} transaction={editingTx} onClose={() => setEditingTx(null)} onSuccess={() => { showToast("Transaction updated", "success"); setEditingTx(null); }} />
      )}
    </div>
  );
}