/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
// REMOVED: import { getSavingsRules, updateSavingsRules } from "@/src/actions/business";
import { db } from "@/src/lib/firebase"; // ADDED
import { doc, getDoc, setDoc } from "firebase/firestore"; // ADDED
import { Settings, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { SavingsRule } from "@/src/types";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [rules, setRules] = useState<SavingsRule[]>([
    { id: "1", name: "Business Improvements", percent: 10, color: "#3b82f6" },
    { id: "2", name: "Future Investments", percent: 50, color: "#10b981" },
    { id: "3", name: "Education & Travel", percent: 30, color: "#f59e0b" },
    { id: "4", name: "Emergency Fund", percent: 10, color: "#6366f1" },
  ]);

  useEffect(() => {
    async function load() {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid, "savings_rules", "current");
          const snap = await getDoc(docRef);
          
          if (snap.exists() && snap.data().allocations) {
            setRules(snap.data().allocations);
          }
        } catch (error) {
          console.error("Error loading settings:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [user]);

  // Fix the TypeScript 'never' error
  const handleChange = (index: number, field: keyof SavingsRule, value: string | number) => {
    const newRules = [...rules];
    (newRules[index] as any)[field] = value;
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, { id: Date.now().toString(), name: "New Goal", percent: 0, color: "#94a3b8" }]);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  const handleSave = async () => {
    if (!user) return;
    const total = rules.reduce((sum, r) => sum + Number(r.percent), 0);
    if (total !== 100) {
      alert(`Error: Percentages must equal 100%. Current total: ${total}%`);
      return;
    }
    setSaving(true);
    try {
      // Direct Write
      await setDoc(doc(db, "users", user.uid, "savings_rules", "current"), {
        allocations: rules
      }, { merge: true });
      alert("Settings Saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    }
    setSaving(false);
  };

  const currentTotal = rules.reduce((sum, r) => sum + Number(r.percent), 0);
  const isValid = currentTotal === 100;

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-xl">
          <Settings className="w-8 h-8 text-slate-700 dark:text-slate-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">App Settings</h1>
          <p className="text-slate-500">Configure your financial logic and rules.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Savings Allocations</h2>
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            Total: {currentTotal}%
          </div>
        </div>

        <div className="p-6 space-y-4">
          {rules.map((rule, index) => (
            <div key={rule.id} className="flex gap-4 items-center">
              <div className="w-4 h-10 rounded-full shrink-0" style={{ backgroundColor: rule.color }} />
              
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-medium ml-1">Category Name</label>
                <input 
                  type="text" 
                  value={rule.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="w-24">
                <label className="text-xs text-slate-400 font-medium ml-1">Percent</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={rule.percent || ''} 
                    onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        handleChange(index, 'percent', val);
                    }}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white pr-6"
                  />
                  <span className="absolute right-3 top-2 text-slate-400">%</span>
                </div>
              </div>

              <div className="mt-5">
                <button onClick={() => removeRule(index)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <button onClick={addRule} className="flex items-center gap-2 text-sm text-blue-600 font-medium mt-4 hover:underline">
            <Plus className="w-4 h-4" /> Add New Category
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving || !isValid}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold transition-all"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}