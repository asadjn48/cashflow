/* eslint-disable @typescript-eslint/no-unused-vars */

// /* eslint-disable @typescript-eslint/no-explicit-any */
// // src/actions/business.ts
// "use server";

// import { db } from "@/src/lib/firebase";
// import { Business, NewBusinessPayload, SavingsConfig } from "@/src/types";
// import { 
//   collection, 
//   getDocs, 
//   addDoc, 
//   doc, 
//   getDoc, 
//   setDoc, 
//   deleteDoc, 
//   updateDoc, 
//   Timestamp 
// } from "firebase/firestore";
// import { revalidatePath } from "next/cache";


// type ActionResponse = { success: boolean; error?: string; data?: any };

// /**
//  * Fetch all businesses
//  */
// export async function getBusinesses(userId: string): Promise<ActionResponse> {
//   try {
//     const businessesRef = collection(db, "users", userId, "businesses");
//     const snapshot = await getDocs(businessesRef);

//     const businesses = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       createdAt: doc.data().createdAt?.toDate(), 
//     })) as Business[];

//     return { success: true, data: businesses };
//   } catch (error) {
//     console.error("Error fetching businesses:", error);
//     return { success: false, error: "Failed to load businesses" };
//   }
// }

// /**
//  * Create a new Business
//  */
// export async function createBusiness(userId: string, data: NewBusinessPayload): Promise<ActionResponse> {
//   try {
//     const businessesRef = collection(db, "users", userId, "businesses");
    
  
//     const newBusiness = {
//       ...data,
//       stats: {
//         totalIncome: 0,
//         totalExpense: 0,
//         netProfit: 0,
//       },
//       createdAt: Timestamp.now(),
//     };

//     await addDoc(businessesRef, newBusiness);
    
//     revalidatePath("/dashboard");
//     return { success: true };
//   } catch (error) {
//     console.error("Error creating business:", error);
//     return { success: false, error: "Failed to create business" };
//   }
// }

// /**
//  * Fetch Savings Rules 
//  */
// export async function getSavingsRules(userId: string): Promise<ActionResponse> {
//   try {
//     const docRef = doc(db, "users", userId, "savings_rules", "current");
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       return { success: true, data: docSnap.data() as SavingsConfig };
//     } else {
  
//       return { success: true, data: null };
//     }
//   } catch (error) {
//     console.error("Error fetching rules:", error);
//     return { success: false, error: "Failed to load savings rules" };
//   }
// }

// export async function updateSavingsRules(userId: string, rules: any[]) {
//   try {
//     const docRef = doc(db, "users", userId, "savings_rules", "current");
//     await setDoc(docRef, { allocations: rules }, { merge: true });
    
//     revalidatePath("/dashboard/savings");
//     return { success: true };
//   } catch (error) {
//     console.error("Error updating rules:", error);
//     return { success: false, error: "Failed to update rules" };
//   }
// }


// /* Delete a Business*/
// export async function deleteBusiness(userId: string, businessId: string): Promise<ActionResponse> {
//   try {
//     const docRef = doc(db, "users", userId, "businesses", businessId);
//     await deleteDoc(docRef);
    
//     revalidatePath("/dashboard");
//     return { success: true };
//   } catch (error) {
//     console.error("Error deleting business:", error);
//     return { success: false, error: "Failed to delete business" };
//   }
// }


// export async function updateBusiness(userId: string, businessId: string, data: Partial<Business>): Promise<ActionResponse> {
//   try {
//     const docRef = doc(db, "users", userId, "businesses", businessId);
    
//     await updateDoc(docRef, data);
    
//     revalidatePath("/dashboard");
//     return { success: true };
//   } catch (error) {
//     console.error("Error updating business:", error);
//     return { success: false, error: "Failed to update business" };
//   }
// }
































/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Timestamp,
  writeBatch // <-- NEW: For Atomic Multi-Deletions
} from "firebase/firestore";
import { revalidatePath } from "next/cache";

type ActionResponse = { success: boolean; error?: string; data?: any };

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
    return { success: false, error: "Failed to load businesses" };
  }
}

export async function createBusiness(userId: string, data: NewBusinessPayload): Promise<ActionResponse> {
  try {
    const businessesRef = collection(db, "users", userId, "businesses");
    const newBusiness = {
      ...data,
      stats: { totalIncome: 0, totalExpense: 0, netProfit: 0 },
      createdAt: Timestamp.now(),
    };

    await addDoc(businessesRef, newBusiness);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create business" };
  }
}

export async function getSavingsRules(userId: string): Promise<ActionResponse> {
  try {
    const docRef = doc(db, "users", userId, "savings_rules", "current");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { success: true, data: docSnap.data() as SavingsConfig };
    else return { success: true, data: null };
  } catch (error) {
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
    return { success: false, error: "Failed to update rules" };
  }
}

// ==========================================
// UPGRADED: DEEP DELETE + SAVINGS REVERSAL
// ==========================================
export async function deleteBusiness(userId: string, businessId: string): Promise<ActionResponse> {
  try {
    const batch = writeBatch(db);
    const bizRef = doc(db, "users", userId, "businesses", businessId);
    
    // 1. Find out how much profit this business had
    const bizSnap = await getDoc(bizRef);
    if (!bizSnap.exists()) throw new Error("Business not found");
    const netProfit = bizSnap.data().stats?.netProfit || 0;

    // 2. Fetch and queue ALL transactions to be deleted
    const transRef = collection(db, "users", userId, "businesses", businessId, "transactions");
    const transSnap = await getDocs(transRef);
    transSnap.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // 3. Queue the business itself for deletion
    batch.delete(bizRef);

    // 4. Savings Reversal Logic
    if (netProfit > 0) {
        const rulesRef = doc(db, "users", userId, "savings_rules", "current");
        const rulesSnap = await getDoc(rulesRef);

        if (rulesSnap.exists()) {
            const savingsData = rulesSnap.data();
            
            // Subtract the deleted profit from the distributed total
            let newTotalDistributed = (savingsData.totalDistributed || 0) - netProfit;
            if (newTotalDistributed < 0) newTotalDistributed = 0;

            // Automatically drain the specific % from the vaults
            const newAllocations = (savingsData.allocations || []).map((rule: any) => {
                const deduction = netProfit * (Number(rule.percent) / 100);
                const newBalance = Math.max(0, (rule.balance || 0) - deduction);
                return { ...rule, balance: newBalance };
            });

            batch.update(rulesRef, {
                allocations: newAllocations,
                totalDistributed: newTotalDistributed
            });
        }
    }

    // 5. Execute everything safely at the exact same time!
    await batch.commit();
    
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/savings");
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
    return { success: false, error: "Failed to update business" };
  }
}