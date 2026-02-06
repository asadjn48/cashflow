/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { db } from "@/src/lib/firebase"; 
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore"; 
import { useToast } from "@/src/components/ToastProvider";
import Button from "@/src/components/ui/Button";

import { 
  Lightbulb, 
  Trash2, 
  Plus, 
  Loader2, 
  Search, 
  Pencil, 
  X, 
  Sparkles,
  AlertTriangle 
} from "lucide-react";

export default function IdeasPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Data State
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any>(null); 
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom Delete Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- 1. FETCH ---
  const loadIdeas = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "users", user.uid, "ideas"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setIdeas(data);
    } catch (error) {
      console.error("Error loading ideas:", error);
      showToast("Failed to load ideas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --- 2. FILTER ---
  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ideas, searchQuery]);

  // --- 3. ACTIONS ---
  
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
        // UPDATE
        const ideaRef = doc(db, "users", user.uid, "ideas", editingIdea.id);
        await updateDoc(ideaRef, { title, content });
        showToast("Note updated successfully", "success");
      } else {
        // CREATE
        await addDoc(collection(db, "users", user.uid, "ideas"), {
          title,
          content,
          createdAt: serverTimestamp()
        });
        showToast("New idea added!", "success");
      }
      
      await loadIdeas();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving idea:", error);
      showToast("Failed to save note", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // The actual delete function called by the confirmation modal
  const confirmDelete = async () => {
    if (!user || !deletingId) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "ideas", deletingId));
      showToast("Idea discarded", "success");
      await loadIdeas(); 
    } catch (error) {
      console.error("Error deleting:", error);
      showToast("Failed to delete note", "error");
    } finally {
      setDeletingId(null); // Close modal
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-[hsl(var(--primary))]" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen relative animate-in fade-in duration-500">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <Lightbulb className="absolute -top-6 -right-6 w-32 h-32 text-yellow-400/20 rotate-12" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Ideas & Plans 
            <span className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold px-2 py-1 rounded-full">
              {ideas.length}
            </span>
          </h1>
          <p className="text-slate-500 mt-2 max-w-md">
            Capture your brilliant thoughts, holiday plans, and future investments.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search your mind..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none transition-all"
                />
            </div>
            <Button onClick={() => openModal()} className="h-11 px-6 shadow-lg shadow-blue-500/20">
                <Plus className="w-5 h-5" /> <span className="hidden sm:inline">New Idea</span>
            </Button>
        </div>
      </div>

      {/* --- Notes Grid --- */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
            <div 
                key={idea.id} 
                className="group relative bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-70"
            >
                <div className="absolute top-0 left-6 right-6 h-1 bg-linear-to-r from-yellow-400 to-orange-400 rounded-b-full opacity-50"></div>

                <div className="flex justify-between items-start mb-4 mt-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                        {idea.title}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(idea)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-[hsl(var(--primary))]">
                            <Pencil className="w-4 h-4" />
                        </button>
                        
                        {/* Trigger Custom Delete Modal */}
                        <button onClick={() => setDeletingId(idea.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full text-slate-400 hover:text-rose-500">
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
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4 animate-pulse">
                <Lightbulb className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No ideas found</h3>
            <p className="text-slate-500 max-w-sm mt-2">
                {searchQuery ? `No matches for "${searchQuery}"` : "Your mind is clear. Click the button to add a new plan!"}
            </p>
        </div>
      )}

      {/* --- CREATE / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {editingIdea ? <Pencil className="w-5 h-5 text-[hsl(var(--primary))]" /> : <Sparkles className="w-5 h-5 text-yellow-500" />}
                        {editingIdea ? "Edit Idea" : "New Spark"}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                        <input 
                            name="title"
                            defaultValue={editingIdea?.title}
                            placeholder="Give it a catchy name..."
                            required
                            autoFocus
                            className="w-full text-lg font-bold border-b-2 border-slate-200 dark:border-slate-700 py-2 bg-transparent focus:border-[hsl(var(--primary))] outline-none transition-colors dark:text-white placeholder:font-normal"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Details</label>
                        <textarea 
                            name="content"
                            defaultValue={editingIdea?.content}
                            placeholder="Describe your plan in detail..."
                            required
                            className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none resize-none dark:text-slate-200"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" isLoading={isSaving}>
                            {editingIdea ? "Save Changes" : "Create Note"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deletingId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/20 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Discard Idea?</h3>
                    <p className="text-slate-500 text-sm mt-2 mb-6">
                        Are you sure you want to remove this note? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => setDeletingId(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- FAB (Mobile Only) --- */}
      <button 
        onClick={() => openModal()}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[hsl(var(--primary))] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7" />
      </button>

    </div>
  );
}