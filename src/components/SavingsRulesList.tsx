"use client";
import { SavingsRule } from "@/src/types";
import { Trash2, Plus, DollarSign } from "lucide-react";

interface Props {
  rules: SavingsRule[];
  totalProfit: number;
  onUpdate: (id: string, field: keyof SavingsRule, value: string | number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export default function SavingsRulesList({ rules, totalProfit, onUpdate, onRemove, onAdd }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rules.map((rule) => {
        const calculatedAmount = totalProfit * (Number(rule.percent) / 100);
        return (
          <div key={rule.id} className="group relative bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <input 
                type="color" 
                value={rule.color}
                onChange={(e) => onUpdate(rule.id, "color", e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category Name</label>
                  <input 
                    type="text" 
                    value={rule.name}
                    onChange={(e) => onUpdate(rule.id, "name", e.target.value)}
                    className="w-full text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[hsl(var(--primary))] focus:outline-none text-slate-900 dark:text-white transition-colors"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Percent</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={rule.percent}
                        onChange={(e) => onUpdate(rule.id, "percent", Number(e.target.value))}
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
              <button onClick={() => onRemove(rule.id)} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
      <button onClick={onAdd} className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all h-full min-h-40">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-semibold">Add New Category</span>
      </button>
    </div>
  );
}