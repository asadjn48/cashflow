/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/ideas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/AuthProvider";
// REMOVED: import { addIdea, getIdeas, deleteIdea } from "@/src/actions/ideas";
import { db } from "@/src/lib/firebase"; // ADDED
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore"; // ADDED
import { Lightbulb, Trash2, Plus, Loader2 } from "lucide-react";

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Ideas on Load
  useEffect(() => {
    if (user) {
      loadIdeas();
    }
  }, [user]);

  async function loadIdeas() {
    if (!user) return;
    try {
      const q = query(collection(db, "users", user.uid, "ideas"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIdeas(data);
    } catch (error) {
      console.error("Error loading ideas:", error);
    } finally {
      setLoading(false);
    }
  }

  // 2. Handle Add
  async function handleAdd(formData: FormData) {
    if (!user) return;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "ideas"), {
        title,
        content,
        createdAt: serverTimestamp()
      });
      await loadIdeas(); // Refresh list
      (document.getElementById("ideaForm") as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error adding idea:", error);
      alert("Failed to save note.");
    }
    setLoading(false);
  }

  // 3. Handle Delete
  async function handleDelete(ideaId: string) {
    if (!user) return;
    if(!confirm("Delete this note?")) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "ideas", ideaId));
      await loadIdeas(); // Refresh list
    } catch (error) {
      console.error("Error deleting idea:", error);
      alert("Failed to delete note.");
    }
  }

  if (loading && ideas.length === 0) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-amber-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
          <Lightbulb className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ideas & Future Plans</h1>
          <p className="text-slate-500">Brainstorming for holidays, investments, and family goals.</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">New Idea</h3>
        <form id="ideaForm" action={handleAdd} className="space-y-4">
          <input 
            name="title" 
            placeholder="Title (e.g. Summer Holiday)" 
            className="w-full p-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 font-medium dark:text-white"
            required
          />
          <textarea 
            name="content" 
            placeholder="Write your plans here..." 
            className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border-none focus:ring-2 focus:ring-emerald-500 min-h-25 dark:text-slate-200"
            required
          />
          <div className="flex justify-end">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Save Note
            </button>
          </div>
        </form>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <div key={idea.id} className="group relative bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-xl border border-yellow-100 dark:border-yellow-900/30 hover:shadow-md transition-all">
            <h3 className="font-bold text-slate-800 dark:text-yellow-100 mb-2">{idea.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{idea.content}</p>
            
            <button 
                onClick={() => handleDelete(idea.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500"
            >
                <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}