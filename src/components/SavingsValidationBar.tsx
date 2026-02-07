"use client";
import Button from "@/src/components/ui/Button";
import { RefreshCcw, Save } from "lucide-react";

interface Props {
  percent: number;
  isValid: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  onReset: () => void;
  onSave: () => void;
}

export default function SavingsValidationBar({ percent, isValid, hasChanges, isSaving, onReset, onSave }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex-1 sm:w-64 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${isValid ? 'bg-emerald-500' : 'bg-[hsl(var(--primary))]'}`} 
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <span className={`font-bold ${isValid ? 'text-emerald-600' : 'text-[hsl(var(--primary))]'}`}>
          {percent}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        {hasChanges && (
          <Button variant="ghost" onClick={onReset} disabled={isSaving}>
            <RefreshCcw className="w-4 h-4" /> Reset
          </Button>
        )}
        <Button 
          onClick={onSave} 
          isLoading={isSaving} 
          disabled={!isValid || !hasChanges}
          className={isValid ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          <Save className="w-4 h-4" /> Save Rules
        </Button>
      </div>
    </div>
  );
}