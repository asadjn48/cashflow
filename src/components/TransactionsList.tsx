/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Calendar, Pencil, Trash2 } from "lucide-react";

interface Props {
  transactions: any[];
  onEdit: (tx: any) => void;
  onDelete: (id: string) => void;
}

export default function TransactionsList({ transactions, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Transactions 
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full">
              {transactions.length}
          </span>
        </h3>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((t) => (
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
                  <button onClick={() => onEdit(t)} className="p-2 text-slate-400 hover:text-[hsl(var(--primary))] bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(t.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            </div>
          </div>
        ))}
        
        {transactions.length === 0 && (
           <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                  <Calendar className="w-6 h-6" />
              </div>
              <p>No transactions found.</p>
           </div>
        )}
      </div>
    </div>
  );
}