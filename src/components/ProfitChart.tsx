/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ProfitChart.tsx
"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfitChart({ data }: { data: any[] }) {
  // FIX: The data now comes in as a string, so we use new Date(t.date) directly
  const chartData = data.map(t => ({
    date: new Date(t.date).toLocaleDateString(), // Simple string parsing
    amount: t.type === 'income' ? t.amount : -t.amount
  })).reverse(); 

  return (
    <div className="h-75 w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 mb-4">Financial Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" hide />
          <YAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px' }}
          />
          <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}