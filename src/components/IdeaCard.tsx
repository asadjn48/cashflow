/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Pencil, Trash2, Sparkles } from "lucide-react";

interface Props {
  idea: any;
  onEdit: (idea: any) => void;
  onDelete: (id: string) => void;
}

export default function IdeaCard({ idea, onEdit, onDelete }: Props) {
  return (
    <div className="group relative bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-70">
        <div className="absolute top-0 left-6 right-6 h-1 bg-linear-to-r from-yellow-400 to-orange-400 rounded-b-full opacity-50"></div>
        
        <div className="flex justify-between items-start mb-4 mt-2">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                {idea.title}
            </h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(idea)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-[hsl(var(--primary))]">
                    <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(idea.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
            <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed line-clamp-6">
                {idea.content}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white dark:from-slate-900 to-transparent"></div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-500" /> Idea</span>
        </div>
    </div>
  );
}