"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { db } from "@/src/lib/firebase"; 
import { collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/src/components/ToastProvider";
import Button from "@/src/components/ui/Button";

import SavingsDistribution from "@/src/components/SavingsDistribution";
import { 
  Loader2, 
  Plus, 
  Save, 
  Trash2, 
  DollarSign,
  RefreshCcw,
  BanknoteArrowUpIcon
} from "lucide-react";
import { Business, SavingsRule } from "@/src/types";

export default function SavingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Data State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [rules, setRules] = useState<SavingsRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State - Snapshot for undo functionality or comparison
  const [originalRules, setOriginalRules] = useState<string>("");

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Businesses to get Total Profit
      const businessesSnapshot = await getDocs(collection(db, "users", user.uid, "businesses"));
      const businessesData = businessesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Business[];

      // 2. Fetch Rules
      const rulesRef = doc(db, "users", user.uid, "savings_rules", "current");
      const rulesSnap = await getDoc(rulesRef);
      
      let rulesData: SavingsRule[] = [];
      if (rulesSnap.exists() && rulesSnap.data().allocations) {
        rulesData = rulesSnap.data().allocations;
      } else {
        // Defaults if empty
        rulesData = [
            { id: "1", name: "Business Growth", percent: 20, color: "#0663F4" }, // Primary Blue
            { id: "2", name: "Emergency Fund", percent: 10, color: "#ef4444" },
            { id: "3", name: "Personal Salary", percent: 70, color: "#10b981" },
        ];
      }

      setBusinesses(businessesData);
      setRules(rulesData);
      setOriginalRules(JSON.stringify(rulesData));
    } catch (error) {
      console.error("Error fetching savings data:", error);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --- CALCULATIONS ---
  const totalNetProfit = useMemo(() => 
    businesses.reduce((sum, b) => sum + b.stats.netProfit, 0), 
  [businesses]);

  const currentTotalPercent = useMemo(() => 
    rules.reduce((sum, r) => sum + Number(r.percent), 0), 
  [rules]);

  const isValid = currentTotalPercent === 100;
  const hasChanges = JSON.stringify(rules) !== originalRules;

  // --- CRUD ACTIONS ---
  
  // UPDATE
  const handleRuleChange = (id: string, field: keyof SavingsRule, value: string | number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // CREATE
  const addRule = () => {
    const newId = Date.now().toString();
    // Auto-assign a random color
    const colors = ["#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setRules([...rules, { 
        id: newId, 
        name: "New Goal", 
        percent: 0, 
        color: randomColor 
    }]);
  };

  // DELETE
  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  // SAVE TO DB
  const handleSave = async () => {
    if (!user) return;
    if (!isValid) {
        showToast(`Total must equal 100%. Current: ${currentTotalPercent}%`, "error");
        return;
    }
    
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), {
        allocations: rules
      }, { merge: true });
      
      setOriginalRules(JSON.stringify(rules)); // Update snapshot
      showToast("Savings rules updated successfully", "success");
    } catch (error) {
      console.error("Save failed", error);
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if(confirm("Undo changes?")) {
        setRules(JSON.parse(originalRules));
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-[hsl(var(--primary))]" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-[hsl(var(--primary))]/10 rounded-xl">
            <BanknoteArrowUpIcon className="w-8 h-8 text-[hsl(var(--primary))]" />
            </div>
            <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Savings & Rules</h1>
            <p className="text-slate-500 text-sm">Automate your profit distribution.</p>
            </div>
        </div>

        {/* Total Profit Display */}
        <div className="text-right">
            <p className="text-sm text-slate-500 uppercase font-semibold tracking-wider">Total Distributable Profit</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${totalNetProfit.toLocaleString()}
            </p>
        </div>
      </div>

      {/* --- Chart Section --- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1">
        {/* Pass LIVE rules so chart updates as user types */}
        <SavingsDistribution totalProfit={totalNetProfit} rules={rules} />
      </div>

      {/* --- Management Section --- */}
      <div className="space-y-4">
        
        {/* Validation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:w-64 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${isValid ? 'bg-emerald-500' : 'bg-[hsl(var(--primary))]'}`} 
                        style={{ width: `${Math.min(currentTotalPercent, 100)}%` }}
                    />
                </div>
                <span className={`font-bold ${isValid ? 'text-emerald-600' : 'text-[hsl(var(--primary))]'}`}>
                    {currentTotalPercent}%
                </span>
            </div>

            <div className="flex items-center gap-2">
                {hasChanges && (
                    <Button variant="ghost" onClick={handleReset} disabled={saving}>
                        <RefreshCcw className="w-4 h-4" /> Reset
                    </Button>
                )}
                <Button 
                    onClick={handleSave} 
                    isLoading={saving} 
                    disabled={!isValid || !hasChanges}
                    className={isValid ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                    <Save className="w-4 h-4" /> Save Rules
                </Button>
            </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => {
                const calculatedAmount = totalNetProfit * (Number(rule.percent) / 100);
                
                return (
                    <div key={rule.id} className="group relative bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                            {/* Color Indicator (Editable) */}
                            <input 
                                type="color" 
                                value={rule.color}
                                onChange={(e) => handleRuleChange(rule.id, "color", e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                title="Change Color"
                            />
                            
                            <div className="flex-1 space-y-3">
                                {/* Name Input */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category Name</label>
                                    <input 
                                        type="text" 
                                        value={rule.name}
                                        onChange={(e) => handleRuleChange(rule.id, "name", e.target.value)}
                                        className="w-full text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[hsl(var(--primary))] focus:outline-none text-slate-900 dark:text-white transition-colors"
                                    />
                                </div>

                                {/* Percent Input & Calculation */}
                                <div className="flex items-center gap-4">
                                    <div className="w-24">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Percent</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={rule.percent}
                                                onChange={(e) => handleRuleChange(rule.id, "percent", Number(e.target.value))}
                                                className="w-full font-mono font-bold p-2 bg-slate-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none dark:text-white"
                                            />
                                            <span className="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Value</label>
                                        <div className="flex items-center gap-1 text-lg font-medium text-emerald-600 dark:text-emerald-400">
                                            <DollarSign className="w-4 h-4" />
                                            {calculatedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button 
                                onClick={() => removeRule(rule.id)}
                                className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                                title="Remove Category"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Add New Button */}
            <button 
                onClick={addRule}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all h-full min-h-40"
            >
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="font-semibold">Add New Category</span>
            </button>
        </div>
      </div>
    </div>
  );
}