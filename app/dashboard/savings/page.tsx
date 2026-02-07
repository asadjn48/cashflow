/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { useBusinesses } from "@/src/hooks/useBusinesses";
import { useSavingsRules } from "@/src/hooks/useSavingsRules";
import { useToast } from "@/src/components/ToastProvider";
import DashboardHeader from "@/src/components/DashboardHeader";
import SavingsDistribution from "@/src/components/SavingsDistribution";
import SavingsValidationBar from "@/src/components/SavingsValidationBar";
import SavingsRulesList from "@/src/components/SavingsRulesList";
import { Loader2, BanknoteArrowUpIcon } from "lucide-react";
import { SavingsRule } from "@/src/types";

export default function SavingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // 1. LOAD DATA INSTANTLY (From Cache)
  const { businesses, currencySymbol, isLoading: isBizLoading } = useBusinesses();
  const { rules: cachedRules, isLoading: isRulesLoading, saveRules } = useSavingsRules();
  
  // Local state for editing (Synced with Cache)
  const [localRules, setLocalRules] = useState<SavingsRule[]>([]);
  const [originalRules, setOriginalRules] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // 2. Sync Local State when Cache Loads
  useEffect(() => {
    if (cachedRules.length > 0) {
        setLocalRules(cachedRules);
        setOriginalRules(JSON.stringify(cachedRules));
    }
  }, [cachedRules]);

  // Calculations
  const totalNetProfit = useMemo(() => businesses.reduce((sum, b) => sum + b.stats.netProfit, 0), [businesses]);
  const currentTotalPercent = useMemo(() => localRules.reduce((sum, r) => sum + Number(r.percent), 0), [localRules]);
  const isValid = currentTotalPercent === 100;
  const hasChanges = JSON.stringify(localRules) !== originalRules;

  // Actions
  const handleRuleChange = (id: string, field: keyof SavingsRule, value: string | number) => {
    setLocalRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRule = () => {
    const colors = ["#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    setLocalRules([...localRules, { id: Date.now().toString(), name: "New Goal", percent: 0, color: colors[Math.floor(Math.random() * colors.length)] }]);
  };

  const removeRule = (id: string) => setLocalRules(prev => prev.filter(r => r.id !== id));

  const handleSave = async () => {
    setSaving(true);
    const success = await saveRules(localRules);
    if (success) {
        setOriginalRules(JSON.stringify(localRules));
        showToast("Savings rules updated", "success");
    } else {
        showToast("Failed to save", "error");
    }
    setSaving(false);
  };

  const isFirstLoad = (isBizLoading || isRulesLoading) && localRules.length === 0;

  if (isFirstLoad) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <DashboardHeader title="Savings & Rules" />

      {/* Hero Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
               <BanknoteArrowUpIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div>
               <h2 className="text-lg font-bold dark:text-white">Distributable Profit</h2>
               <p className="text-slate-500 text-sm">Based on active portfolios</p>
            </div>
        </div>
        <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {currencySymbol}{totalNetProfit.toLocaleString()}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1">
        <SavingsDistribution totalProfit={totalNetProfit} rules={localRules} />
      </div>

      <div className="space-y-4">
        <SavingsValidationBar 
            percent={currentTotalPercent} 
            isValid={isValid} 
            hasChanges={hasChanges} 
            isSaving={saving}
            onReset={() => setLocalRules(JSON.parse(originalRules))}
            onSave={handleSave}
        />
        <SavingsRulesList 
            rules={localRules} 
            totalProfit={totalNetProfit} 
            onUpdate={handleRuleChange} 
            onRemove={removeRule} 
            onAdd={addRule} 
        />
      </div>
    </div>
  );
}