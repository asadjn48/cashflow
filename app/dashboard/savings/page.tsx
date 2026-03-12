/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { useBusinesses } from "@/src/hooks/useBusinesses";
import { useSavingsRules } from "@/src/hooks/useSavingsRules";
import { useToast } from "@/src/components/ToastProvider";
import Button from "@/src/components/ui/Button"; 
import DashboardHeader from "@/src/components/DashboardHeader";
import SavingsDistribution from "@/src/components/SavingsDistribution";
import SavingsValidationBar from "@/src/components/SavingsValidationBar";
import SavingsRulesList from "@/src/components/SavingsRulesList";
import { Loader2, BanknoteArrowUpIcon, Coins, RefreshCcw, AlertTriangle, ArrowDownRight, X } from "lucide-react";
import { SavingsRule } from "@/src/types";

export default function SavingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const { businesses, currencySymbol, isLoading: isBizLoading, refresh: refreshBiz } = useBusinesses();
  const { config, isLoading: isRulesLoading, saveRules, distributeProfit, spendFromCategory, resetLedger } = useSavingsRules();
  
  const [localRules, setLocalRules] = useState<SavingsRule[]>([]);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [originalRules, setOriginalRules] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Custom Spend Modal State
  const [spendModalRule, setSpendModalRule] = useState<SavingsRule | null>(null);
  const [spendAmount, setSpendAmount] = useState("");
  const [isSpending, setIsSpending] = useState(false);

  useEffect(() => {
    if (refreshBiz) refreshBiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (config) {
        setLocalRules(config.allocations);
        setTotalDistributed(config.totalDistributed || 0);
        setOriginalRules(JSON.stringify(config.allocations));
    }
  }, [config]);

  const totalNetProfit = useMemo(() => businesses.reduce((sum, b) => sum + b.stats.netProfit, 0), [businesses]);
  const currentTotalPercent = useMemo(() => localRules.reduce((sum, r) => sum + Number(r.percent), 0), [localRules]);
  const isValid = currentTotalPercent === 100;
  const hasChanges = JSON.stringify(localRules) !== originalRules;

  const undistributedProfit = Math.max(0, totalNetProfit - totalDistributed);
  const totalLifetimeSpent = config?.totalSpent || 0;
  
  const remainingProfit = Math.max(0, totalNetProfit - totalLifetimeSpent);

  const handleRuleChange = (id: string, field: keyof SavingsRule, value: string | number) => {
    setLocalRules(prev => {
        let updated = prev.map(r => r.id === id ? { ...r, [field]: value } : r);

        if (field === 'percent') {
            const otherRule = updated.find(r => r.name === 'Other');
            if (otherRule && id !== otherRule.id) {
                const sumOthers = updated.filter(r => r.id !== otherRule.id).reduce((sum, r) => sum + Number(r.percent), 0);
                const newOtherPercent = Math.max(0, 100 - sumOthers);
                updated = updated.map(r => r.id === otherRule.id ? { ...r, percent: newOtherPercent } : r);
            }
        }
        return updated;
    });
  };

  const addRule = () => {
    const colors = ["#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    setLocalRules([...localRules, { id: Date.now().toString(), name: "New Goal", percent: 0, balance: 0, color: colors[Math.floor(Math.random() * colors.length)] }]);
  };

  const removeRule = (id: string) => setLocalRules(prev => prev.filter(r => r.id !== id));

  const handleSave = async () => {
    setSaving(true);
    const success = await saveRules(localRules);
    if (success) {
        setOriginalRules(JSON.stringify(localRules));
        showToast("Savings rules updated!", "success");
    } else {
        showToast("Failed to save", "error");
    }
    setSaving(false);
  };

  const handleDistribute = async () => {
    if (!isValid) return showToast("Make sure percentages equal 100% first!", "error");
    if (undistributedProfit <= 0) return;
    
    setDistributing(true);
    const success = await distributeProfit(undistributedProfit, localRules);
    if (success) showToast(`Distributed ${currencySymbol}${undistributedProfit.toLocaleString()}!`, "success");
    else showToast("Failed to distribute profit", "error");
    setDistributing(false);
  };

  // CUSTOM SPEND FUNCTION
  const executeSpend = async () => {
    if (!spendModalRule) return;
    const amount = Number(spendAmount);
    
    if (isNaN(amount) || amount <= 0) return showToast("Enter a valid amount", "error");
    if (amount > spendModalRule.balance) return showToast("Insufficient funds in this vault!", "error");

    setIsSpending(true);
    const success = await spendFromCategory(spendModalRule.id, amount);
    if (success) {
        showToast(`${currencySymbol}${amount} deducted successfully`, "success");
        setSpendModalRule(null);
        setSpendAmount("");
    } else {
        showToast("Failed to deduct amount", "error");
    }
    setIsSpending(false);
  };

  const handleResetLedger = async () => {
    if (!confirm("⚠️ WARNING: This will empty all your vaults and reset your distribution history to $0. Are you sure?")) return;
    setIsResetting(true);
    const success = await resetLedger();
    if (success) showToast("Ledger successfully reset to $0!", "success");
    else showToast("Failed to reset ledger", "error");
    setIsResetting(false);
  };

  const isFirstLoad = (isBizLoading || isRulesLoading) && localRules.length === 0;

  if (isFirstLoad) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-5 space-y-4 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <DashboardHeader title="Savings & Vaults" />
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="danger"  onClick={handleResetLedger} isLoading={isResetting} className="flex-1 sm:flex-none">
                 <AlertTriangle className="w-4 h-4 mr-1" /> Reset Ledger
             </Button>
             <Button variant="secondary"  onClick={() => refreshBiz && refreshBiz()} disabled={isBizLoading}>
                <RefreshCcw className={`w-4 h-4 ${isBizLoading ? 'animate-spin' : ''}`} />
             </Button>
          </div>
      </div>

      {/* TOP CARDS GRID*/}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${undistributedProfit > 0 ? 'lg:grid-cols-3' : ''} gap-3`}>
        
        {/* Hero Stats */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
          <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                 <BanknoteArrowUpIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div>
                 <h2 className="text-sm md:text-base font-bold dark:text-white">Net Profit</h2>
                 <p className="text-slate-500 text-[11px] md:text-xs">From all portfolios</p>
              </div>
          </div>
          <div className="text-right">
              <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {currencySymbol}{totalNetProfit.toLocaleString()}
              </p>
              <p className="text-[11px] md:text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  {currencySymbol}{remainingProfit.toLocaleString()} remaining
              </p>
          </div>
        </div>

        {/* Total Spent Stat */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
          <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-900/20 rounded-lg">
                 <ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-500" />
              </div>
              <div>
                 <h2 className="text-sm md:text-base font-bold dark:text-white">Total Spent</h2>
                 <p className="text-slate-500 text-[11px] md:text-xs">Money used from vaults</p>
              </div>
          </div>
          <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              {currencySymbol}{totalLifetimeSpent.toLocaleString()}
          </p>
        </div>

        {/* Distribution Banner */}
        {undistributedProfit > 0 && (
          <div className="bg-linear-to-r from-[hsl(var(--primary))] to-blue-500 p-4 rounded-xl shadow-md shadow-blue-500/20 text-white flex justify-between items-center gap-3 h-full sm:col-span-2 lg:col-span-1 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm hidden sm:block">
                      <Coins className="w-5 h-5" />
                  </div>
                  <div>
                      <h3 className="text-sm md:text-base font-bold leading-tight">New Profit Ready!</h3>
                      <p className="text-blue-100 text-[11px] md:text-xs opacity-90">{currencySymbol}{undistributedProfit.toLocaleString()} to allocate.</p>
                  </div>
              </div>
              <Button onClick={handleDistribute} isLoading={distributing}  className="bg-blue  hover:bg-blue-700 shadow-sm shrink-0">
                  Distribute
              </Button>
          </div>
        )}
      </div>

      <div className="w-full">
        <SavingsDistribution rules={localRules} />
      </div>

      <div className="space-y-3 pt-1">
        <SavingsValidationBar 
            percent={currentTotalPercent} isValid={isValid} hasChanges={hasChanges} isSaving={saving}
            onReset={() => setLocalRules(JSON.parse(originalRules))} onSave={handleSave}
        />
        <SavingsRulesList 
            rules={localRules} onUpdate={handleRuleChange} onRemove={removeRule} onAdd={addRule} 
            onSpendClick={(rule) => setSpendModalRule(rule)} 
        />
      </div>

      {/* CUSTOM SPEND MODAL */}
      {spendModalRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-bold dark:text-white flex items-center gap-2">
                        Spend from Vault
                    </h3>
                    <button onClick={() => { setSpendModalRule(null); setSpendAmount(""); }} disabled={isSpending}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mb-5 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-1">Vault Category</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: spendModalRule.color}}></span>
                        {spendModalRule.name}
                    </p>
                    <div className="flex justify-between mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500">Available Balance</span>
                        <span className="text-sm font-bold text-emerald-600">{currencySymbol}{spendModalRule.balance.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mb-5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Amount to Deduct</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                        <input 
                            type="number" 
                            value={spendAmount}
                            onChange={(e) => setSpendAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-7 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                            autoFocus
                        />
                    </div>
                </div>

                <Button onClick={executeSpend} className="w-full text-sm py-2.5" isLoading={isSpending}>Confirm Deduction</Button>
            </div>
        </div>
      )}

    </div>
  );
}