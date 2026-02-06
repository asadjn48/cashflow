// src/types/index.ts

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
}

export interface SavingsConfig {
  id: string;
  allocations: SavingsRule[];
  updatedAt: Date | Timestamp;
}

// 4. Idea/Note Interface
export interface Idea {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date | Timestamp;
}

export type NewBusinessPayload = Omit<Business, 'id' | 'stats' | 'createdAt'>;