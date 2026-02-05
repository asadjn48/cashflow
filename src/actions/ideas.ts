// src/actions/ideas.ts
"use server";

import { db } from "@/src/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

// Add a new Idea
export async function addIdea(userId: string, title: string, content: string) {
  try {
    await addDoc(collection(db, "users", userId, "ideas"), {
      title,
      content,
      createdAt: Timestamp.now(),
    });
    revalidatePath("/dashboard/ideas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to add idea" };
  }
}

// Fetch all Ideas
export async function getIdeas(userId: string) {
  try {
    const snapshot = await getDocs(collection(db, "users", userId, "ideas"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Date for Client
      createdAt: doc.data().createdAt?.toDate().toISOString() 
    }));
  } catch (error) {
    return [];
  }
}

// Delete an Idea
export async function deleteIdea(userId: string, ideaId: string) {
  try {
    await deleteDoc(doc(db, "users", userId, "ideas", ideaId));
    revalidatePath("/dashboard/ideas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete" };
  }
}