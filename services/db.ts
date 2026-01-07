
import { User, Task, Transaction, TaskCategory } from '../types';

const STORAGE_KEY = 'earnpulse_db_v1';

interface DBState {
  users: Record<string, User>;
  tasks: Task[];
  transactions: Transaction[];
  currentUser: string | null;
}

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Customer Satisfaction Survey', description: 'Help brands improve their service.', reward: 0.85, category: TaskCategory.SURVEY, estimatedTime: '5m', difficulty: 'Easy', icon: 'fa-poll' },
  { id: '2', title: 'Watch: New Movie Trailer', description: 'Watch the full video to earn rewards.', reward: 0.15, category: TaskCategory.VIDEO, estimatedTime: '2m', difficulty: 'Easy', icon: 'fa-play' },
  { id: '3', title: 'Test Strategy Game: Kingdom Rise', description: 'Reach level 5 within 48 hours.', reward: 4.50, category: TaskCategory.GAME, estimatedTime: '1h', difficulty: 'Medium', icon: 'fa-gamepad' },
  { id: '4', title: 'Categorize Product Images', description: 'Identify items in 20 product photos.', reward: 1.20, category: TaskCategory.MICRO_TASK, estimatedTime: '10m', difficulty: 'Easy', icon: 'fa-tags' },
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
            balance: 0,
            totalEarned: 0,
            completedTasks: 0,
            streak: 99,
            role: 'admin'
          }
        },
        tasks: DEFAULT_TASKS,
        transactions: [],
        currentUser: null
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

  getAllTransactions() {
    return this.state.transactions;
  }

  getTransactions(userId: string) {
    return this.state.transactions.filter(t => t.userId === userId);
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
}

export const db = new VirtualDB();
