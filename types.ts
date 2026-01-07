
export enum TaskCategory {
  SURVEY = 'Survey',
  VIDEO = 'Video',
  GAME = 'Game',
  MICRO_TASK = 'Micro Task',
  AI_CHAT = 'AI Feedback'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: TaskCategory;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: string;
}

export interface User {
  id: string;
  name: string;
  balance: number;
  totalEarned: number;
  completedTasks: number;
  streak: number;
  role: 'user' | 'admin';
}

export interface Transaction {
  id: string;
  userId?: string; // Added to track which user the tx belongs to in admin view
  type: 'Earning' | 'Payout';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
  description: string;
}

export type ViewState = 'dashboard' | 'earn' | 'payouts' | 'profile' | 'admin';
