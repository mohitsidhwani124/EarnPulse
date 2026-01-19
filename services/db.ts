
import { User, Task, Transaction, TaskCategory, AdMobSettings } from '../types';

const STORAGE_KEY = 'earnpulse_db_v1';

interface DBState {
  users: Record<string, User>;
  tasks: Task[];
  transactions: Transaction[];
  currentUser: string | null;
  settings?: {
    maintenanceMode: boolean;
    payoutsEnabled: boolean;
    announcement: string;
    globalCommission: number;
    admob: AdMobSettings;
  };
}

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Customer Satisfaction Survey', description: 'Help brands improve their service.', reward: 0.85, providerValue: 1.50, category: TaskCategory.SURVEY, estimatedTime: '5m', difficulty: 'Easy', icon: 'fa-poll' },
  { id: '2', title: 'Watch: New Movie Trailer', description: 'Watch the full video to earn rewards.', reward: 0.15, providerValue: 0.30, category: TaskCategory.VIDEO, estimatedTime: '2m', difficulty: 'Easy', icon: 'fa-play', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', requiredWatchTime: 15 },
  { id: '3', title: 'Test Strategy Game: Kingdom Rise', description: 'Reach level 5 within 48 hours.', reward: 4.50, providerValue: 8.00, category: TaskCategory.GAME, estimatedTime: '1h', difficulty: 'Medium', icon: 'fa-gamepad' },
  { id: '4', title: 'Categorize Product Images', description: 'Identify items in 20 product photos.', reward: 1.20, providerValue: 2.00, category: TaskCategory.MICRO_TASK, estimatedTime: '10m', difficulty: 'Easy', icon: 'fa-tags' },
];

class VirtualDB {
  private state: DBState;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.state = JSON.parse(saved);
    } else {
      this.state = {
        users: {
          'admin@earnpulse.com': {
            id: 'admin@earnpulse.com',
            name: 'System Admin',
            balance: 1000,
            totalEarned: 1000,
            completedTasks: 0,
            streak: 99,
            role: 'admin',
            status: 'Active',
            adsWatched: 0
          }
        },
        tasks: DEFAULT_TASKS,
        transactions: [],
        currentUser: null,
        settings: {
          maintenanceMode: false,
          payoutsEnabled: true,
          announcement: "Welcome to EarnPulse Pro! Start earning today.",
          globalCommission: 40,
          admob: {
            appId: '',
            rewardedId: '',
            interstitialId: '',
            bannerId: '',
            estimatedCPM: 12.50,
            adsEnabled: true
          }
        }
      };
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  getUser(id: string): User | null {
    return this.state.users[id] || null;
  }

  getAllUsers(): User[] {
    return Object.values(this.state.users);
  }

  saveUser(user: User) {
    this.state.users[user.id] = user;
    this.save();
  }

  updateUserBalance(id: string, newBalance: number) {
    if (this.state.users[id]) {
      this.state.users[id].balance = newBalance;
      this.save();
    }
  }

  updateUserStatus(id: string, status: 'Active' | 'Banned') {
    if (this.state.users[id]) {
      this.state.users[id].status = status;
      this.save();
    }
  }

  setCurrentUser(id: string | null) {
    this.state.currentUser = id;
    this.save();
  }

  getCurrentUserId() {
    return this.state.currentUser;
  }

  getTasks() {
    return this.state.tasks;
  }

  saveTask(task: Task) {
    const index = this.state.tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
      this.state.tasks[index] = task;
    } else {
      this.state.tasks.push(task);
    }
    this.save();
  }

  deleteTask(id: string) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.save();
  }

  getTransactions(userId: string) {
    return this.state.transactions.filter(t => t.userId === userId);
  }

  getAllTransactions() {
    return this.state.transactions;
  }

  updateTransactionStatus(id: string, status: 'Completed' | 'Rejected') {
    const tx = this.state.transactions.find(t => t.id === id);
    if (tx) {
      tx.status = status;
      this.save();
    }
  }

  addTransaction(userId: string, tx: Omit<Transaction, 'id'>) {
    const fullTx: Transaction = {
      ...tx,
      userId,
      id: `${userId}_${Date.now()}`
    };
    this.state.transactions.unshift(fullTx);
    this.save();
    return fullTx;
  }

  getSettings() {
    return this.state.settings || { 
      maintenanceMode: false, 
      payoutsEnabled: true, 
      announcement: "", 
      globalCommission: 40,
      admob: { appId: '', rewardedId: '', interstitialId: '', bannerId: '', estimatedCPM: 10, adsEnabled: false }
    };
  }

  updateSettings(settings: any) {
    this.state.settings = { ...this.getSettings(), ...settings };
    this.save();
  }

  exportData(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importData(json: string) {
    try {
      const newState = JSON.parse(json);
      this.state = newState;
      this.save();
      window.location.reload();
    } catch (e) {
      console.error("Invalid database file");
    }
  }
}

export const db = new VirtualDB();
