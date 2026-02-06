/* eslint-disable prefer-const */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { db } from "@/src/lib/firebase"; 
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { useToast } from "@/src/components/ToastProvider"; 
import Button from "@/src/components/ui/Button"; 

import { 
  Settings, 
  Loader2, 
  Building2, 
  Download, 
  Globe,
  Save,
  ArrowRightLeft,
  AlertTriangle,
  Calculator,
  X
} from "lucide-react";
import { Business } from "@/src/types";

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState("USD");
  
  // Form State
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState<string>("1"); 
  const [operation, setOperation] = useState<"multiply" | "divide">("multiply");
  
  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Process States
  const [isSavingBiz, setIsSavingBiz] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    async function load() {
      if (user) {
        try {
          const bizSnap = await getDocs(collection(db, "users", user.uid, "businesses"));
          const bizData = bizSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Business[];
          setBusinesses(bizData);

          const settingsSnap = await getDoc(doc(db, "users", user.uid, "settings", "general"));
          if (settingsSnap.exists() && settingsSnap.data().currency) {
             const savedCurr = settingsSnap.data().currency;
             setCurrentCurrency(savedCurr);
             setSelectedCurrency(savedCurr);
          }
        } catch (error) {
          console.error("Error loading settings:", error);
          showToast("Failed to load settings", "error");
        } finally {
          setLoading(false);
        }
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --- 2. BUSINESS MANAGEMENT ---
  const handleBusinessChange = (id: string, field: keyof Business, value: string) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const saveBusinesses = async () => {
    if (!user) return;
    setIsSavingBiz(true);
    try {
        const promises = businesses.map(b => 
            updateDoc(doc(db, "users", user.uid, "businesses", b.id), { 
                name: b.name, 
                type: b.type 
            })
        );
        await Promise.all(promises);
        showToast("Business details updated", "success");
    } catch (e) {
        showToast("Failed to update businesses", "error");
    } finally {
        setIsSavingBiz(false);
    }
  };

  // --- 3. CURRENCY CONVERSION (Preparation) ---
  const initCurrencySave = () => {
    const rate = parseFloat(exchangeRate);
    if (isNaN(rate) || rate <= 0) {
        showToast("Please enter a valid exchange rate", "error");
        return;
    }
    // Open Custom Modal
    setShowConfirmModal(true);
  };

  // --- 4. EXECUTE CONVERSION (The Actual Logic) ---
  const executeConversion = async () => {
    if (!user) return;
    const rate = parseFloat(exchangeRate);
    
    // Helper function
    const applyRate = (amount: number) => {
        return operation === 'divide' ? (amount / rate) : (amount * rate);
    };

    setIsConverting(true);
    setShowConfirmModal(false); // Close modal immediately

    try {
      // 1. Update Global Setting
      await setDoc(doc(db, "users", user.uid, "settings", "general"), {
        currency: selectedCurrency
      }, { merge: true });

      // 2. Loop through EVERY Business
      for (const biz of businesses) {
        const bizRef = doc(db, "users", user.uid, "businesses", biz.id);
        
        const newStats = {
            netProfit: applyRate(biz.stats.netProfit),
            totalIncome: applyRate(biz.stats.totalIncome),
            totalExpense: applyRate(biz.stats.totalExpense)
        };
        await updateDoc(bizRef, { 
            currency: selectedCurrency,
            stats: newStats
        });

        // 3. Convert Transactions
        const transCol = collection(db, "users", user.uid, "businesses", biz.id, "transactions");
        const transSnap = await getDocs(transCol);
        
        const batch = writeBatch(db);
        let counter = 0;

        transSnap.forEach((tDoc) => {
            const tData = tDoc.data();
            const newAmount = applyRate(tData.amount);
            batch.update(tDoc.ref, { amount: newAmount });
            counter++;
        });

        if (counter > 0) await batch.commit();
      }

      setCurrentCurrency(selectedCurrency);
      setExchangeRate("1");
      
      const bizSnap = await getDocs(collection(db, "users", user.uid, "businesses"));
      const bizData = bizSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Business[];
      setBusinesses(bizData);

      showToast(`Successfully converted to ${selectedCurrency}`, "success");

    } catch (error) {
      console.error("Conversion failed", error);
      showToast("Conversion failed.", "error");
    } finally {
        setIsConverting(false);
    }
  };

  // --- 5. EXPORT LOGIC ---
  const handleGlobalExport = async () => {
    if(!user) return;
    setIsExporting(true);
    try {
        let allRows: string[] = ["Business,Date,Description,Type,Amount,Currency"];
        
        for (const biz of businesses) {
            const transSnap = await getDocs(collection(db, "users", user.uid, "businesses", biz.id, "transactions"));
            transSnap.forEach(doc => {
                const t = doc.data();
                allRows.push(`${biz.name},${new Date(t.date?.toDate()).toLocaleDateString()},"${t.description}",${t.type},${t.amount},${currentCurrency}`);
            });
        }

        const csvContent = allRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Global_Financial_Report_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Global report downloaded", "success");
    } catch (e) {
        showToast("Export failed", "error");
    } finally {
        setIsExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-3 bg-[hsl(var(--primary))]/10 rounded-xl">
          <Settings className="w-8 h-8 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuration</h1>
          <p className="text-slate-500">Manage currency, conversion, and business details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- LEFT COL: Currency & Export --- */}
        <div className="space-y-8">
            
            {/* Currency Converter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-full relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-bold dark:text-white">Currency & Conversion</h2>
                </div>
                
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Currency</label>
                        <select 
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:text-white transition-all"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="PKR">PKR (Rs)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="AED">AED (Dh)</option>
                        </select>
                    </div>

                    <div className={`transition-all duration-300 ${selectedCurrency !== currentCurrency ? 'opacity-100 max-h-96' : 'opacity-50 grayscale'}`}>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block justify-between">
                            <span>Conversion Logic</span>
                        </label>
                        
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-3">
                            <button 
                                onClick={() => setOperation("multiply")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${operation === 'multiply' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-500'}`}
                            >
                                Multiply (×)
                            </button>
                            <button 
                                onClick={() => setOperation("divide")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${operation === 'divide' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
                            >
                                Divide (÷)
                            </button>
                        </div>

                        <div className="relative">
                            <input 
                                type="number"
                                step="any"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value)}
                                placeholder="Rate (e.g. 280)"
                                className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:text-white"
                            />
                            <Calculator className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button 
                            onClick={initCurrencySave} // Calls modal now
                            isLoading={isConverting} 
                            className="w-full"
                            disabled={selectedCurrency === currentCurrency}
                        >
                            <Save className="w-4 h-4" /> 
                            {selectedCurrency === currentCurrency ? "Currency is up to date" : "Convert & Save"}
                        </Button>
                    </div>
                </div>
            </div>

             {/* Data Export */}
             <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-2 dark:text-white">
                    <Download className="w-5 h-5 text-slate-500" /> Data Export
                </h2>
                <p className="text-sm text-slate-500 mb-4">Download a complete CSV report of all transactions across all businesses.</p>
                <Button onClick={handleGlobalExport} isLoading={isExporting} variant="secondary" className="w-full">
                    Export Full Report
                </Button>
            </div>
        </div>

        {/* --- RIGHT COL: Business Management --- */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                    <Building2 className="w-5 h-5 text-slate-400" /> My Businesses
                </h2>
                <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full">
                    {businesses.length} Active
                </span>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto max-h-125 pr-2">
                {businesses.map((biz) => (
                    <div key={biz.id} className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[hsl(var(--primary))]/30 hover:shadow-md transition-all">
                        <div className="flex gap-3 items-center mb-2">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Name</label>
                                <input 
                                    value={biz.name}
                                    onChange={(e) => handleBusinessChange(biz.id, 'name', e.target.value)}
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border-b-2 border-transparent focus:border-[hsl(var(--primary))] rounded-t-md text-sm font-bold dark:text-white outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                             <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Type</label>
                             <input 
                                value={biz.type}
                                placeholder="e.g. Retail"
                                onChange={(e) => handleBusinessChange(biz.id, 'type', e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border-b-2 border-transparent focus:border-[hsl(var(--primary))] rounded-t-md text-sm text-slate-600 dark:text-slate-300 outline-none transition-colors"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Button onClick={saveBusinesses} isLoading={isSavingBiz} className="w-full">
                    Save Changes
                </Button>
            </div>
        </div>

      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Are you absolutely sure?</h2>
                    
                    <p className="text-slate-500 text-sm mb-6">
                        You are about to <strong>{operation.toUpperCase()}</strong> all your financial records by <strong>{exchangeRate}</strong> to convert from {currentCurrency} to {selectedCurrency}.
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 text-left">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Preview Calculation</p>
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-500">1,000 {currentCurrency}</span>
                            <span className="text-slate-300">➜</span>
                            <span className="text-[hsl(var(--primary))] font-bold">
                                {operation === 'divide' 
                                    ? (1000 / parseFloat(exchangeRate)).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                    : (1000 * parseFloat(exchangeRate)).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                } {selectedCurrency}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={executeConversion}>
                            Yes, Convert Data
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}