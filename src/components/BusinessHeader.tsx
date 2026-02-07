"use client";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { ThemeToggle } from "@/src/components/ThemeProvider";
import AddTransactionModal from "@/src/components/AddTransactionModal";

interface Props {
  businessName: string;
  userId: string;
  businessId: string;
  onRefresh: () => void;
}

export default function BusinessHeader({ businessName, userId, businessId, onRefresh }: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1">
        <Link href="/dashboard" className="flex items-center text-slate-500 hover:text-[hsl(var(--primary))] transition-colors mb-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[hsl(var(--primary))]/10 rounded-xl">
            <Wallet className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{businessName}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <AddTransactionModal userId={userId} businessId={businessId} onSuccess={onRefresh} />
      </div>
    </div>
  );
}