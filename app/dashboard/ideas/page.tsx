/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import useSWR from "swr"; // FAST LOADING
import { useAuth } from "@/src/components/AuthProvider";
import { db } from "@/src/lib/firebase"; 
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore"; 
import { useToast } from "@/src/components/ToastProvider";
import Button from "@/src/components/ui/Button";
import DashboardHeader from "@/src/components/DashboardHeader";
import IdeaCard from "@/src/components/IdeaCard";
import IdeaModal from "@/src/components/IdeaModal";
import { Lightbulb, Plus, Loader2, Search, AlertTriangle } from "lucide-react";

// SWR Fetcher
const ideasFetcher = async (userId: string) => {
    const q = query(collection(db, "users", userId, "ideas"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Timestamp to Date for client use
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
};

export default function IdeasPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // 1. USE SWR FOR INSTANT LOAD
  const { data: ideas = [], error, isLoading, mutate } = useSWR(
    user ? [user.uid, "ideas"] : null,
    ([uid]) => ideasFetcher(uid),
    { revalidateOnFocus: false }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any>(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 2. Filter Logic
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea: any) => 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ideas, searchQuery]);

  // Actions
  const openModal = (idea: any = null) => {
    setEditingIdea(idea);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    try {
      if (editingIdea) {
        await updateDoc(doc(db, "users", user.uid, "ideas", editingIdea.id), { title, content });
        showToast("Note updated", "success");
      } else {
        await addDoc(collection(db, "users", user.uid, "ideas"), { title, content, createdAt: serverTimestamp() });
        showToast("New idea added", "success");
      }
      mutate(); // Refresh SWR
      setIsModalOpen(false);
    } catch (e) { showToast("Failed to save", "error"); } 
    finally { setIsSaving(false); }
  };

  const confirmDelete = async () => {
    if (!user || !deletingId) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "ideas", deletingId));
      showToast("Idea discarded", "success");
      mutate(); // Refresh SWR
    } catch (e) { showToast("Failed to delete", "error"); } 
    finally { setDeletingId(null); }
  };

  if (isLoading && ideas.length === 0) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen relative animate-in fade-in duration-500">
      <DashboardHeader title="Ideas & Plans" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <Lightbulb className="absolute -top-6 -right-6 w-32 h-32 text-yellow-400/20 rotate-12" />
        <div className="relative z-10 w-full md:w-auto">
             <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search your mind..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <Button onClick={() => openModal()} className="h-11 px-6 shadow-lg shadow-blue-500/20">
                    <Plus className="w-5 h-5" /> <span className="hidden sm:inline">New Idea</span>
                </Button>
            </div>
        </div>
      </div>

      {/* Grid */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea: any) => (
                <IdeaCard key={idea.id} idea={idea} onEdit={openModal} onDelete={setDeletingId} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <Lightbulb className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-xl font-bold dark:text-slate-300">No ideas found</h3>
        </div>
      )}

      {/* Modals */}
      <IdeaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} idea={editingIdea} isSaving={isSaving} />
      
      {deletingId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold dark:text-white">Discard Idea?</h3>
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" className="flex-1" onClick={() => setDeletingId(null)}>Cancel</Button>
                    <Button variant="danger" className="flex-1" onClick={confirmDelete}>Delete</Button>
                </div>
            </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button onClick={() => openModal()} className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40">
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}