/* eslint-disable @typescript-eslint/no-explicit-any */
// src/actions/business.ts
"use server";

import { db } from "@/src/lib/firebase";
import { Business, NewBusinessPayload, SavingsConfig } from "@/src/types";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp 
} from "firebase/firestore";
import { revalidatePath } from "next/cache";

// Helper for standardized error responses
type ActionResponse = { success: boolean; error?: string; data?: any };

/**
 * Fetch all businesses for a specific user
 */
export async function getBusinesses(userId: string): Promise<ActionResponse> {
  try {
    const businessesRef = collection(db, "users", userId, "businesses");
    const snapshot = await getDocs(businessesRef);

    const businesses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to Date for serialization
      createdAt: doc.data().createdAt?.toDate(), 
    })) as Business[];

    return { success: true, data: businesses };
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return { success: false, error: "Failed to load businesses" };
  }
}

/**
 * Create a new Business
 */
export async function createBusiness(userId: string, data: NewBusinessPayload): Promise<ActionResponse> {
  try {
    const businessesRef = collection(db, "users", userId, "businesses");
    
    // Default stats are 0
    const newBusiness = {
      ...data,
      stats: {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
      },
      createdAt: Timestamp.now(),
    };

    await addDoc(businessesRef, newBusiness);
    
    revalidatePath("/dashboard"); // Refresh the dashboard UI
    return { success: true };
  } catch (error) {
    console.error("Error creating business:", error);
    return { success: false, error: "Failed to create business" };
  }
}

/**
 * Fetch Savings Rules (The "Brain" Logic)
 */
export async function getSavingsRules(userId: string): Promise<ActionResponse> {
  try {
    const docRef = doc(db, "users", userId, "savings_rules", "current");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() as SavingsConfig };
    } else {
      // Return default rules if none exist
      return { success: true, data: null };
    }
  } catch (error) {
    console.error("Error fetching rules:", error);
    return { success: false, error: "Failed to load savings rules" };
  }
}


export async function updateSavingsRules(userId: string, rules: any[]) {
  try {
    const docRef = doc(db, "users", userId, "savings_rules", "current");
    await setDoc(docRef, { allocations: rules }, { merge: true });
    
    revalidatePath("/dashboard/savings");
    return { success: true };
  } catch (error) {
    console.error("Error updating rules:", error);
    return { success: false, error: "Failed to update rules" };
  }
}