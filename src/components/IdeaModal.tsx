/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Button from "@/src/components/ui/Button";
import { X, Pencil, Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  idea: any;
  isSaving: boolean;
}

export default function IdeaModal({ isOpen, onClose, onSave, idea, isSaving }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {idea ? <Pencil className="w-5 h-5 text-blue-600" /> : <Sparkles className="w-5 h-5 text-yellow-500" />}
                    {idea ? "Edit Idea" : "New Spark"}
                </h2>
                <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={onSave} className="p-6 space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                    <input name="title" defaultValue={idea?.title} required autoFocus className="w-full text-lg font-bold border-b-2 border-slate-200 dark:border-slate-700 py-2 bg-transparent focus:border-blue-500 outline-none dark:text-white placeholder:font-normal" placeholder="Catchy title..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Details</label>
                    <textarea name="content" defaultValue={idea?.content} required placeholder="Describe your plan..." className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:text-slate-200" />
                </div>
                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" isLoading={isSaving}>{idea ? "Save Changes" : "Create Note"}</Button>
                </div>
            </form>
        </div>
    </div>
  );
}