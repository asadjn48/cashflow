// src/components/BusinessCard.tsx
import { Business } from "@/src/types";
import { 
  Car, 
  Shirt, 
  Building2, 
  Store, 
  TrendingUp, 
  ArrowRight 
} from "lucide-react";
import Link from "next/link";

// 1. Icon Mapper: Chooses icon based on business type
const getIcon = (type: string) => {
  switch (type) {
    case 'taxi': return <Car className="w-6 h-6 text-blue-500" />;
    case 'laundry': return <Shirt className="w-6 h-6 text-cyan-500" />;
    case 'property': return <Building2 className="w-6 h-6 text-purple-500" />;
    case 'carwash': return <Store className="w-6 h-6 text-blue-400" />;
    default: return <Store className="w-6 h-6 text-gray-500" />;
  }
};

export default function BusinessCard({ business }: { business: Business }) {
  const { stats } = business;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {getIcon(business.type)}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              {business.name}
            </h3>
            <span className="text-xs text-slate-500 uppercase font-medium">
              {business.type}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Stats Table */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Income</span>
          <span className="text-emerald-600 font-medium">
            +{business.currency} {stats.totalIncome.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Expenses</span>
          <span className="text-rose-600 font-medium">
            -{business.currency} {stats.totalExpense.toLocaleString()}
          </span>
        </div>
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
        <div className="flex justify-between text-base">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Net Profit</span>
          <span className={`font-bold ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {business.currency} {stats.netProfit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Link 
        href={`/dashboard/business/${business.id}`}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-sm font-medium transition-colors"
      >
        View Details
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}