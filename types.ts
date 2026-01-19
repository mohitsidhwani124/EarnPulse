
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
  providerValue?: number;
  category: TaskCategory;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: string;
  videoUrl?: string;
  requiredWatchTime?: number;
}

export interface User {
  id: string;
  name: string;
  balance: number;
  totalEarned: number;
  completedTasks: number;
  streak: number;
  role: 'user' | 'admin';
  status: 'Active' | 'Banned' | 'Pending';
  adsWatched?: number; // Track for AdMob revenue simulation
}

export interface Transaction {
  id: string;
  userId?: string;
  type: 'Earning' | 'Payout' | 'AdReward';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Rejected';
  description: string;
  method?: string;
}

export type ViewState = 'dashboard' | 'earn' | 'payouts' | 'profile' | 'admin';

export interface AdMobSettings {
  appId: string;
  rewardedId: string;
  interstitialId: string;
  bannerId: string;
  estimatedCPM: number; // e.g., $10.00
  adsEnabled: boolean;
}
