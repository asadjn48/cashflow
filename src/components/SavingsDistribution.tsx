/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/SavingsDistribution.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SavingsRule } from "@/src/types";

export default function SavingsDistribution({ 
  totalProfit, 
  rules 
}: { 
  totalProfit: number;
  rules: SavingsRule[];
}) {
  const activeRules = rules.length > 0 ? rules : [
     { id: '1', name: 'Unallocated', percent: 100, color: '#94a3b8' }
  ];

  const data = activeRules.map(rule => ({
    ...rule,
    value: totalProfit * (Number(rule.percent) / 100)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Distribution</h3>
        
        {/* FIX: explicit height style to prevent "height(-1)" error */}
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {/* FIX: Tooltip type safety */}
              <Tooltip formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, name]} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation Cards */}
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-3 h-12 rounded-full" style={{ backgroundColor: item.color }}></div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</h4>
                <p className="text-sm text-slate-500">{item.percent}% Allocation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                ${item.value.toLocaleString()}
              </div>
              <span className="text-xs text-slate-400">Available</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}