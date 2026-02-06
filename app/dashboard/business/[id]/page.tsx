/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, collection, getDocs, orderBy, query, limit, runTransaction } from "firebase/firestore";
import { useToast } from "@/src/components/ToastProvider";
import Button from "@/src/components/ui/Button";

// Components
import TransactionFilters from "@/src/components/TransactionFilters"; // New Component
import AddTransactionModal from "@/src/components/AddTransactionModal";
import EditTransactionModal from "@/src/components/EditTransactionModal";
import ProfitChart from "@/src/components/ProfitChart";

import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  Trash2, 
  Calendar,
  Pencil,
  Wallet,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Business } from "@/src/types";

export default function BusinessPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Data State
  const [business, setBusiness] = useState<Business | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [timeRange, setTimeRange] = useState<"monthly" | "yearly" | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [editingTx, setEditingTx] = useState<any>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null); // For custom delete confirm

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    if (!user || !id) return;
    const businessId = Array.isArray(id) ? id[0] : id;

    try {
      const docRef = doc(db, "users", user.uid, "businesses", businessId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setBusiness({ id: docSnap.id, ...docSnap.data() } as Business);
        
        // Fetch last 500 transactions
        const transRef = collection(db, "users", user.uid, "businesses", businessId, "transactions");
        const q = query(transRef, orderBy("date", "desc"), limit(500)); 
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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Failed to load business data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  // --- 2. FILTER LOGIC (Includes Search & Time) ---
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      // Time Filter
      const matchesTime = (() => {
        if (timeRange === "all") return true;
        if (timeRange === "monthly") return t.date.startsWith(selectedMonth);
        if (timeRange === "yearly") return t.date.startsWith(selectedYear);
        return true;
      })();

      // Search Filter
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTime && matchesSearch;
    });
  }, [allTransactions, timeRange, selectedMonth, selectedYear, searchQuery]);

  // --- 3. REACTIVE STATS CALCULATION ---
  // Calculates stats based on the FILTERED view, not global DB stats
  const filteredStats = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
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

  // --- 4. DELETE LOGIC ---
  async function confirmDelete() {
    if (!user || !business || !deletingTxId) return;
    
    const txToDelete = allTransactions.find(t => t.id === deletingTxId);
    if (!txToDelete) return;

    try {
      await runTransaction(db, async (txn) => {
        const businessRef = doc(db, "users", user.uid, "businesses", business.id);
        const transRef = doc(db, "users", user.uid, "businesses", business.id, "transactions", deletingTxId);
        
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

      showToast("Transaction deleted successfully", "success");
      setDeletingTxId(null); // Close confirm modal
      await fetchData(); 
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Failed to delete transaction", "error");
    }
  }

  // --- EXPORT CSV ---
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
    link.setAttribute("download", `${business.name}_${timeRange}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Export downloaded", "success");
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[hsl(var(--primary))]" /></div>;
  if (!business) return <div className="text-center p-12">Business not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
            <Link href="/dashboard" className="flex items-center text-slate-500 hover:text-[hsl(var(--primary))] transition-colors mb-2 text-sm font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
                <div className="p-3 bg-[hsl(var(--primary))]/10 rounded-xl">
                    <Wallet className="w-8 h-8 text-[hsl(var(--primary))]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{business.name}</h1>
                    <p className="text-slate-500 uppercase text-xs font-bold tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md inline-block mt-1">
                        {business.type}
                    </p>
                </div>
            </div>
        </div>
        <AddTransactionModal userId={user!.uid} businessId={business.id} onSuccess={fetchData} />
      </div>

      {/* --- Filter Component (Imported) --- */}
      <TransactionFilters 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExport={handleExport}
      />

      {/* --- Reactive Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[hsl(var(--primary))]/5 rounded-2xl border border-[hsl(var(--primary))]/20 transition-all duration-300">
          <span className="text-[hsl(var(--primary))] text-sm font-semibold uppercase tracking-wide">Net Profit ({timeRange})</span>
          <div className="text-3xl font-bold text-[hsl(var(--primary))] mt-2">
            {business.currency} {filteredStats.profit.toLocaleString()}
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Income ({timeRange})</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            {filteredStats.income.toLocaleString()}
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Expenses ({timeRange})</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            {filteredStats.expense.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chart - Responsive Wrapper */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-100">
         <ProfitChart data={filteredTransactions} />
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Transactions 
            <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">
                {filteredTransactions.length}
            </span>
          </h3>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.map((t: any) => (
            <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-4">
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{t.description}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <span className={`text-lg font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString()}
                </span>
                
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingTx(t)}
                      className="p-2 text-slate-400 hover:text-[hsl(var(--primary))] bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => setDeletingTxId(t.id)} // Trigger Custom Modal
                      className="p-2 text-slate-400 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
             <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                    <Calendar className="w-6 h-6" />
                </div>
                <p>No transactions found.</p>
             </div>
          )}
        </div>
      </div>

      {/* --- CUSTOM DELETE CONFIRM MODAL --- */}
      {deletingTxId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/20 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Transaction?</h3>
                    <p className="text-slate-500 text-sm mt-2 mb-6">
                        This will delete the record and automatically reverse the profit calculation. This cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => setDeletingTxId(null)}>Cancel</Button>
                        <Button variant="danger" className="flex-1" onClick={confirmDelete}>Delete</Button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTx && user && (
        <EditTransactionModal 
          isOpen={!!editingTx}
          userId={user.uid}
          businessId={business.id}
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSuccess={() => {
            fetchData();
            showToast("Transaction updated", "success");
            setEditingTx(null); 
          }}
        />
      )}
    </div>
  );
}