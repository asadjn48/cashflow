"use client";
import Button from "@/src/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteTransactionModal({ isOpen, onClose, onConfirm, isDeleting }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/20 rounded-full mb-4">
                    <AlertTriangle className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Transaction?</h3>
                <p className="text-slate-500 text-sm mt-2 mb-6">
                    This will delete the record and automatically reverse the profit calculation. This cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                    <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isDeleting}>Cancel</Button>
                    <Button variant="danger" className="flex-1" onClick={onConfirm} isLoading={isDeleting}>Delete</Button>
                </div>
            </div>
        </div>
    </div>
  );
}