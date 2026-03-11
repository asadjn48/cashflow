// // src/types/index.ts

// import { Timestamp } from 'firebase/firestore';

// // 1. Business Interface
// export interface Business {
//   id: string; 
//   name: string;
//   type: 'taxi' | 'laundry' | 'carwash' | 'property' | 'other';
//   currency: string;
//   stats: {
//     totalIncome: number;
//     totalExpense: number;
//     netProfit: number;
//   };
//   createdAt: Date | Timestamp;
// }

// // 2. Transaction Interface
// export interface Transaction {
//   id: string;
//   businessId: string; 
//   amount: number;
//   type: 'income' | 'expense';
//   date: Date | Timestamp;
//   description: string;
//   category?: string; 
// }

// // 3. Savings Rule Interface
// export interface SavingsRule {
//   id: string;
//   name: string;
//   percent: number; 
//   color: string;   
// }

// export interface SavingsConfig {
//   id: string;
//   allocations: SavingsRule[];
//   updatedAt: Date | Timestamp;
// }

// // 4. Idea/Note Interface
// export interface Idea {
//   id: string;
//   title: string;
//   description: string;
//   tags?: string[];
//   createdAt: Date | Timestamp;
// }

// export type NewBusinessPayload = Omit<Business, 'id' | 'stats' | 'createdAt'>;























// import { Timestamp } from 'firebase/firestore';

// // 1. Business Interface
// export interface Business {
//   id: string; 
//   name: string;
//   type: 'taxi' | 'laundry' | 'carwash' | 'property' | 'other';
//   currency: string;
//   stats: {
//     totalIncome: number;
//     totalExpense: number;
//     netProfit: number;
//   };
//   createdAt: Date | Timestamp;
// }

// // 2. Transaction Interface
// export interface Transaction {
//   id: string;
//   businessId: string; 
//   amount: number;
//   type: 'income' | 'expense';
//   date: Date | Timestamp;
//   description: string;
//   category?: string; 
// }

// // 3. Savings Rule Interface (ADDED BALANCE)
// export interface SavingsRule {
//   id: string;
//   name: string;
//   percent: number; 
//   color: string;   
//   balance: number; // <-- NEW
// }

// // Added totalDistributed
// export interface SavingsConfig {
//   id?: string;
//   allocations: SavingsRule[];
//   totalDistributed: number; // <-- NEW
//   updatedAt?: Date | Timestamp;
// }

// // 4. Idea/Note Interface
// export interface Idea {
//   id: string;
//   title: string;
//   description: string;
//   tags?: string[];
//   createdAt: Date | Timestamp;
// }

// export type NewBusinessPayload = Omit<Business, 'id' | 'stats' | 'createdAt'>;



















import { Timestamp } from 'firebase/firestore';

// 1. Business Interface
export interface Business {
  id: string; 
  name: string;
  type: 'taxi' | 'laundry' | 'carwash' | 'property' | 'other';
  currency: string;
  stats: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
  };
  createdAt: Date | Timestamp;
}

// 2. Transaction Interface
export interface Transaction {
  id: string;
  businessId: string; 
  amount: number;
  type: 'income' | 'expense';
  date: Date | Timestamp;
  description: string;
  category?: string; 
}

// 3. Savings Rule Interface
export interface SavingsRule {
  id: string;
  name: string;
  percent: number; 
  color: string;   
  balance: number; 
}

export interface SavingsConfig {
  id?: string;
  allocations: SavingsRule[];
  totalDistributed: number; 
  totalSpent: number; // <-- NEW: Tracks lifetime vault spending
  updatedAt?: Date | Timestamp;
}

// 4. Idea/Note Interface
export interface Idea {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  createdAt: Date | Timestamp;
}

export type NewBusinessPayload = Omit<Business, 'id' | 'stats' | 'createdAt'>;