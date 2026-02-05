/* eslint-disable prefer-const */
// src/actions/transaction.ts
"use server";

import { db } from "@/src/lib/firebase";
import { Transaction } from "@/src/types";
import { 
  doc, 
  runTransaction, 
  collection, 
  Timestamp 
} from "firebase/firestore";
import { revalidatePath } from "next/cache";

type TransactionPayload = Omit<Transaction, "id" | "businessId" | "date">;

export async function addTransaction(
  userId: string, 
  businessId: string, 
  data: TransactionPayload
) {
  try {
    // 1. References
    const businessRef = doc(db, "users", userId, "businesses", businessId);
    const transactionsRef = collection(db, "users", userId, "businesses", businessId, "transactions");
    const newTransactionRef = doc(transactionsRef); // Generate ID automatically

    // 2. Run the Atomic Transaction
    await runTransaction(db, async (transaction) => {
      // A. Read the business first (Required for consistency)
      const businessDoc = await transaction.get(businessRef);
      if (!businessDoc.exists()) {
        throw "Business does not exist!";
      }

      const currentStats = businessDoc.data().stats || { totalIncome: 0, totalExpense: 0, netProfit: 0 };
      const amount = Number(data.amount);

      // B. Calculate new stats
      let newStats = { ...currentStats };
      
      if (data.type === 'income') {
        newStats.totalIncome += amount;
        newStats.netProfit += amount;
      } else {
        newStats.totalExpense += amount;
        newStats.netProfit -= amount;
      }

      // C. Write: Create the Transaction Record
      transaction.set(newTransactionRef, {
        ...data,
        businessId,
        amount, // Ensure it's a number
        date: Timestamp.now(),
      });

      // D. Write: Update the Business Stats
      transaction.update(businessRef, { stats: newStats });
    });

    // 3. Revalidate
    revalidatePath(`/dashboard/business/${businessId}`);
    revalidatePath("/dashboard"); 

    return { success: true };
  } catch (error) {
    console.error("Transaction Failed:", error);
    return { success: false, error: "Transaction failed. Please try again." };
  }
}




export async function deleteTransaction(
  userId: string, 
  businessId: string, 
  transactionId: string
) {
  try {
    const businessRef = doc(db, "users", userId, "businesses", businessId);
    const transactionRef = doc(db, "users", userId, "businesses", businessId, "transactions", transactionId);

    await runTransaction(db, async (transaction) => {
      // 1. Get the transaction to know what we are deleting
      const transDoc = await transaction.get(transactionRef);
      if (!transDoc.exists()) throw "Transaction does not exist!";
      
      const transData = transDoc.data();
      const amount = transData.amount;
      const type = transData.type; // 'income' or 'expense'

      // 2. Get the Business to update stats
      const businessDoc = await transaction.get(businessRef);
      if (!businessDoc.exists()) throw "Business does not exist!";
      
      const currentStats = businessDoc.data().stats;
      
      // 3. REVERSE the math
      let newStats = { ...currentStats };

      if (type === 'income') {
        // Removing income: Total Income goes DOWN, Profit goes DOWN
        newStats.totalIncome -= amount;
        newStats.netProfit -= amount;
      } else {
        // Removing expense: Total Expense goes DOWN, Profit goes UP
        newStats.totalExpense -= amount;
        newStats.netProfit += amount;
      }

      // 4. Commit Writes
      transaction.delete(transactionRef);
      transaction.update(businessRef, { stats: newStats });
    });

    revalidatePath(`/dashboard/business/${businessId}`);
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Delete Failed:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}







// src/actions/transaction.ts (Add to bottom)

export async function updateTransaction(
  userId: string,
  businessId: string,
  transactionId: string,
  newData: { amount: number; type: "income" | "expense"; description: string }
) {
  try {
    const businessRef = doc(db, "users", userId, "businesses", businessId);
    const transactionRef = doc(db, "users", userId, "businesses", businessId, "transactions", transactionId);

    await runTransaction(db, async (transaction) => {
      // 1. Fetch current data (to know what we are changing FROM)
      const transDoc = await transaction.get(transactionRef);
      if (!transDoc.exists()) throw "Transaction missing";
      const oldData = transDoc.data();

      const businessDoc = await transaction.get(businessRef);
      if (!businessDoc.exists()) throw "Business missing";
      const stats = businessDoc.data().stats;

      // 2. REVERSE the Old Math (Strip it out)
      let newStats = { ...stats };
      if (oldData.type === 'income') {
        newStats.totalIncome -= oldData.amount;
        newStats.netProfit -= oldData.amount;
      } else {
        newStats.totalExpense -= oldData.amount;
        newStats.netProfit += oldData.amount;
      }

      // 3. APPLY the New Math (Put new numbers in)
      if (newData.type === 'income') {
        newStats.totalIncome += newData.amount;
        newStats.netProfit += newData.amount;
      } else {
        newStats.totalExpense += newData.amount;
        newStats.netProfit -= newData.amount;
      }

      // 4. Save Everything
      transaction.update(businessRef, { stats: newStats });
      transaction.update(transactionRef, {
        amount: newData.amount,
        type: newData.type,
        description: newData.description,
        // We don't change the 'date' usually, or update 'updatedAt'
      });
    });

    revalidatePath(`/dashboard/business/${businessId}`);
    return { success: true };
  } catch (error) {
    console.error("Update Failed:", error);
    return { success: false, error: "Failed to update" };
  }
}