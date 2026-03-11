// "use client";
// import { SavingsRule } from "@/src/types";
// import { Trash2, Plus, DollarSign } from "lucide-react";

// interface Props {
//   rules: SavingsRule[];
//   totalProfit: number;
//   onUpdate: (id: string, field: keyof SavingsRule, value: string | number) => void;
//   onRemove: (id: string) => void;
//   onAdd: () => void;
// }

// export default function SavingsRulesList({ rules, totalProfit, onUpdate, onRemove, onAdd }: Props) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {rules.map((rule) => {
//         const calculatedAmount = totalProfit * (Number(rule.percent) / 100);
//         return (
//           <div key={rule.id} className="group relative bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
//             <div className="flex items-start gap-4">
              
//               {/* Color Picker Input */}
//               <input 
//                 type="color" 
//                 value={rule.color}
//                 onChange={(e) => onUpdate(rule.id, "color", e.target.value)}
//                 className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent p-0 shrink-0"
//                 title="Change Color"
//               />
              
//               <div className="flex-1 space-y-3 min-w-0">
//                 <div>
//                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category Name</label>
//                   <input 
//                     type="text" 
//                     value={rule.name}
//                     onChange={(e) => onUpdate(rule.id, "name", e.target.value)}
//                     className="w-full text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[hsl(var(--primary))] focus:outline-none text-slate-900 dark:text-white transition-colors"
//                   />
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <div className="w-24 shrink-0">
//                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Percent</label>
//                     <div className="relative">
//                       {/* FIX APPLIED HERE: Added standard css to hide spinners and padding-right */}
//                       <input 
//                         type="number" 
//                         value={rule.percent}
//                         onChange={(e) => onUpdate(rule.id, "percent", Number(e.target.value))}
//                         className="w-full font-mono font-bold p-2 pr-8 bg-slate-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                       />
//                       <span className="absolute right-3 top-2.5 text-slate-400 text-sm pointer-events-none">%</span>
//                     </div>
//                   </div>
                  
//                   <div className="flex-1 opacity-50 group-hover:opacity-100 transition-opacity min-w-0">
//                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Value</label>
//                     <div className="flex items-center gap-1 text-lg font-medium text-emerald-600 dark:text-emerald-400 truncate">
//                       <DollarSign className="w-4 h-4" />
//                       {calculatedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <button 
//                 onClick={() => onRemove(rule.id)} 
//                 className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all shrink-0"
//               >
//                 <Trash2 className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         );
//       })}
      
//       <button 
//         onClick={onAdd} 
//         className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all h-full min-h-40"
//       >
//         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
//           <Plus className="w-6 h-6" />
//         </div>
//         <span className="font-semibold">Add New Category</span>
//       </button>
//     </div>
//   );
// }























// "use client";
// import { SavingsRule } from "@/src/types";
// import { Trash2, Plus, DollarSign, ArrowDownRight } from "lucide-react";

// interface Props {
//   rules: SavingsRule[];
//   onUpdate: (id: string, field: keyof SavingsRule, value: string | number) => void;
//   onRemove: (id: string) => void;
//   onAdd: () => void;
//   onSpend: (id: string, amount: number) => void;
// }

// export default function SavingsRulesList({ rules, onUpdate, onRemove, onAdd, onSpend }: Props) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {rules.map((rule) => {
//         // We now look directly at the real vault balance
//         const currentBalance = rule.balance || 0;
        
//         return (
//           <div key={rule.id} className="group relative bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
//             <div className="flex items-start gap-4">
              
//               <input 
//                 type="color" 
//                 value={rule.color}
//                 onChange={(e) => onUpdate(rule.id, "color", e.target.value)}
//                 className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent p-0 shrink-0 mt-1"
//                 title="Change Color"
//               />
              
//               <div className="flex-1 space-y-3 min-w-0">
//                 <div>
//                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category Name</label>
//                   <input 
//                     type="text" 
//                     value={rule.name}
//                     onChange={(e) => onUpdate(rule.id, "name", e.target.value)}
//                     className="w-full text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[hsl(var(--primary))] focus:outline-none text-slate-900 dark:text-white transition-colors"
//                   />
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <div className="w-24 shrink-0">
//                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Percent</label>
//                     <div className="relative">
//                       <input 
//                         type="number" 
//                         value={rule.percent}
//                         onChange={(e) => onUpdate(rule.id, "percent", Number(e.target.value))}
//                         className="w-full font-mono font-bold p-2 pr-8 bg-slate-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                       />
//                       <span className="absolute right-3 top-2.5 text-slate-400 text-sm pointer-events-none">%</span>
//                     </div>
//                   </div>
                  
//                   <div className="flex-1 min-w-0">
//                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Balance</label>
//                     <div className="flex items-center gap-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
//                       <DollarSign className="w-4 h-4" />
//                       {currentBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex flex-col gap-2 shrink-0">
//                   <button 
//                     onClick={() => {
//                         const val = window.prompt(`Spend from ${rule.name}?\nVault Balance: $${currentBalance.toLocaleString()}\n\nEnter amount to deduct:`);
//                         if (val && !isNaN(Number(val)) && Number(val) > 0) {
//                             if (Number(val) > currentBalance) {
//                                 alert("Insufficient funds in this vault!");
//                             } else {
//                                 onSpend(rule.id, Number(val));
//                             }
//                         }
//                     }}
//                     className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
//                     title="Spend / Deduct from Vault"
//                   >
//                     <ArrowDownRight className="w-5 h-5" />
//                   </button>
//                   <button 
//                     onClick={() => onRemove(rule.id)} 
//                     className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
//                     title="Delete Category"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//               </div>
//             </div>
//           </div>
//         );
//       })}
      
//       <button 
//         onClick={onAdd} 
//         className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all h-full min-h-[160px]"
//       >
//         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
//           <Plus className="w-6 h-6" />
//         </div>
//         <span className="font-semibold">Add New Vault</span>
//       </button>
//     </div>
//   );
// }



















"use client";
import { SavingsRule } from "@/src/types";
import { Trash2, Plus, DollarSign, ArrowDownRight } from "lucide-react";

interface Props {
  rules: SavingsRule[];
  onUpdate: (id: string, field: keyof SavingsRule, value: string | number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  // NEW: Passes the full rule object instead of triggering a prompt
  onSpendClick: (rule: SavingsRule) => void; 
}

export default function SavingsRulesList({ rules, onUpdate, onRemove, onAdd, onSpendClick }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rules.map((rule) => {
        const currentBalance = rule.balance || 0;
        
        return (
          <div key={rule.id} className="group relative bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              
              <input 
                type="color" 
                value={rule.color}
                onChange={(e) => onUpdate(rule.id, "color", e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent p-0 shrink-0 mt-1"
                title="Change Color"
              />
              
              <div className="flex-1 space-y-3 min-w-0">
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
                  <div className="w-24 shrink-0">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Percent</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={rule.percent}
                        onChange={(e) => onUpdate(rule.id, "percent", Number(e.target.value))}
                        className="w-full font-mono font-bold p-2 pr-8 bg-slate-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3 top-2.5 text-slate-400 text-sm pointer-events-none">%</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Balance</label>
                    <div className="flex items-center gap-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      <DollarSign className="w-4 h-4" />
                      {currentBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => onSpendClick(rule)} // Triggers custom modal
                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Spend / Deduct from Vault"
                  >
                    <ArrowDownRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onRemove(rule.id)} 
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    title="Delete Category"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
              </div>
            </div>
          </div>
        );
      })}
      
      <button 
        onClick={onAdd} 
        className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all h-full min-h-[160px]"
      >
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-semibold">Add New Vault</span>
      </button>
    </div>
  );
}