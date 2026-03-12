
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
  deleteDoc, 
  updateDoc, 
  Timestamp 
} from "firebase/firestore";
import { revalidatePath } from "next/cache";


type ActionResponse = { success: boolean; error?: string; data?: any };

/**
 * Fetch all businesses
 */
export async function getBusinesses(userId: string): Promise<ActionResponse> {
  try {
    const businessesRef = collection(db, "users", userId, "businesses");
    const snapshot = await getDocs(businessesRef);

    const businesses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating business:", error);
    return { success: false, error: "Failed to create business" };
  }
}

/**
 * Fetch Savings Rules 
 */
export async function getSavingsRules(userId: string): Promise<ActionResponse> {
  try {
    const docRef = doc(db, "users", userId, "savings_rules", "current");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() as SavingsConfig };
    } else {
  
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


/* Delete a Business*/
export async function deleteBusiness(userId: string, businessId: string): Promise<ActionResponse> {
  try {
    const docRef = doc(db, "users", userId, "businesses", businessId);
    await deleteDoc(docRef);
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting business:", error);
    return { success: false, error: "Failed to delete business" };
  }
}


export async function updateBusiness(userId: string, businessId: string, data: Partial<Business>): Promise<ActionResponse> {
  try {
    const docRef = doc(db, "users", userId, "businesses", businessId);
    
    await updateDoc(docRef, data);
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating business:", error);
    return { success: false, error: "Failed to update business" };
  }
}