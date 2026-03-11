// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// import { SavingsRule } from "@/src/types";

// export default function SavingsDistribution({ 
//   totalProfit, 
//   rules 
// }: { 
//   totalProfit: number;
//   rules: SavingsRule[];
// }) {
//   const activeRules = rules.length > 0 ? rules : [
//      { id: '1', name: 'Unallocated', percent: 100, color: '#94a3b8' }
//   ];

//   const data = activeRules.map(rule => ({
//     ...rule,
//     value: totalProfit * (Number(rule.percent) / 100)
//   }));

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
//       {/* --- CHART SECTION (Flexible Card) --- */}
//       <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
//         <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">
//             Distribution
//         </h3>
        
//         {/* 1. The Donut  */}
//         <div className="w-full h-62.5 sm:h-75 mb-6">
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie
//                 data={data}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius="60%" 
//                 outerRadius="90%" 
//                 paddingAngle={5}
//                 dataKey="value"
//                 stroke="none"
//               >
//                 {data.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip 
//                 formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
//                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* 2. THE UNIQUE SOLUTION: "Chip Cloud" Legend     */}
//         <div className="flex flex-wrap gap-2 justify-center content-center mx-auto">
//           {data.map((item) => (
//             <div 
//               key={item.id} 
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-medium"
//             >
//               <div 
//                 className="w-2.5 h-2.5 rounded-full" 
//                 style={{ backgroundColor: item.color }} 
//               />
//               <span className="text-slate-600 dark:text-slate-300 max-w-25 truncate">
//                 {item.name}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* --- DETAILED LIST SECTION --- */}
//       <div className="flex flex-col gap-3">
//         {data.map((item) => (
//           <div 
//             key={item.id} 
//             className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-emerald-500/30 transition-all"
//           >
//             <div className="flex items-center gap-3 overflow-hidden">
//               {/* Larger Color Bar for Detail View */}
//               <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
              
//               <div className="min-w-0">
//                 <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate">
//                     {item.name}
//                 </h4>
//                 <div className="flex items-center gap-2">
//                     <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
//                         {item.percent}%
//                     </span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="text-right shrink-0">
//               <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
//                 ${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
//               </div>
//               <span className="text-[10px] text-slate-400 uppercase font-semibold">Allocated</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }























/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SavingsRule } from "@/src/types";

export default function SavingsDistribution({ 
  rules 
}: { 
  rules: SavingsRule[];
}) {
  // Check if there is ANY money in any vault
  const totalBalance = rules.reduce((sum, r) => sum + (r.balance || 0), 0);
  
  // If all vaults are empty, show a grey placeholder ring
  const activeRules = totalBalance > 0 ? rules : [
     { id: '1', name: 'Empty Vaults', percent: 100, color: '#94a3b8', balance: 1 } 
  ];

  const data = activeRules.map(rule => ({
    ...rule,
    value: rule.balance || 0 // Read directly from the Ledger Balance
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* --- CHART SECTION --- */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 px-4 pt-4 text-slate-800 dark:text-white">
            Vault Balances
        </h3>
        
        <div className="w-full h-64 sm:h-72 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%" 
                outerRadius="90%" 
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`$${totalBalance === 0 ? 0 : Number(value).toLocaleString()}`, 'Balance']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend "Chip Cloud" */}
        <div className="flex flex-wrap gap-2 justify-center content-center mx-auto pb-4 px-2">
          {rules.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-medium"
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-300 max-w-[100px] truncate">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- DETAILED LIST SECTION --- */}
      <div className="flex flex-col gap-3">
        {rules.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
              
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate">
                    {item.name}
                </h4>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.percent}% of New Profit
                    </span>
                </div>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ${(item.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Vault Balance</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}