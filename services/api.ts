
import { db } from './db';
import { User, Task, Transaction } from '../types';

const LATENCY = 400; 

const wait = () => new Promise(resolve => setTimeout(resolve, LATENCY));

export const api = {
  auth: {
    async login(email: string): Promise<User> {
      await wait();
      const existingUser = db.getUser(email);
      if (existingUser) {
        db.setCurrentUser(email);
        return existingUser;
      }
      
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
      const newUser: User = {
        id: email,
        name: email.split('@')[0],
        balance: 0,
        totalEarned: 0,
        completedTasks: 0,
        streak: 1,
        role: role as 'user' | 'admin',
        status: 'Active',
        adsWatched: 0
      };
      db.saveUser(newUser);
      db.setCurrentUser(email);
      return newUser;
    },
    async logout() {
      await wait();
      db.setCurrentUser(null);
    },
    async checkSession(): Promise<User | null> {
      const id = db.getCurrentUserId();
      if (!id) return null;
      return db.getUser(id);
    }
  },
  tasks: {
    async getAll(): Promise<Task[]> {
      await wait();
      return db.getTasks();
    },
    async complete(taskId: string): Promise<{ user: User; transaction: Transaction }> {
      await wait();
      const userId = db.getCurrentUserId();
      if (!userId) throw new Error("Unauthorized");

      const user = db.getUser(userId)!;
      const task = db.getTasks().find(t => t.id === taskId);
      if (!task) throw new Error("Task not found");

      user.balance += task.reward;
      user.totalEarned += task.reward;
      user.completedTasks += 1;
      db.saveUser(user);

      const transaction = db.addTransaction(userId, {
        type: 'Earning',
        amount: task.reward,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        description: `Completed: ${task.title}`
      });

      return { user, transaction };
    },
    async completeAd(reward: number): Promise<{ user: User; transaction: Transaction }> {
      await wait();
      const userId = db.getCurrentUserId();
      if (!userId) throw new Error("Unauthorized");

      const user = db.getUser(userId)!;
      user.balance += reward;
      user.totalEarned += reward;
      user.adsWatched = (user.adsWatched || 0) + 1;
      db.saveUser(user);

      const transaction = db.addTransaction(userId, {
        type: 'AdReward',
        amount: reward,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        description: `AdMob Rewarded Bonus`
      });

      return { user, transaction };
    }
  },
  wallet: {
    async getHistory(): Promise<Transaction[]> {
      await wait();
      const userId = db.getCurrentUserId();
      return userId ? db.getTransactions(userId) : [];
    },
    async requestPayout(amount: number, method: string): Promise<Transaction> {
      await wait();
      const userId = db.getCurrentUserId();
      if (!userId) throw new Error("Unauthorized");
      const user = db.getUser(userId)!;
      if (user.balance < amount) throw new Error("Insufficient balance");
      
      user.balance -= amount;
      db.saveUser(user);

      return db.addTransaction(userId, {
        type: 'Payout',
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        description: `Withdrawal via ${method}`,
        method
      });
    }
  },
  admin: {
    async getStats() {
      await wait();
      const users = db.getAllUsers();
      const txs = db.getAllTransactions();
      const settings = db.getSettings();
      return {
        totalUsers: users.length,
        totalBalance: users.reduce((acc, u) => acc + u.balance, 0),
        totalPayouts: txs.filter(t => t.type === 'Payout' && t.status === 'Completed').reduce((acc, t) => acc + t.amount, 0),
        pendingPayouts: txs.filter(t => t.type === 'Payout' && t.status === 'Pending').length,
        activeTasks: db.getTasks().length,
        settings
      };
    },
    async getUsers(): Promise<User[]> {
      await wait();
      return db.getAllUsers();
    },
    async updateUserBalance(userId: string, amount: number) {
      await wait();
      db.updateUserBalance(userId, amount);
    },
    async toggleUserStatus(userId: string) {
      await wait();
      const user = db.getUser(userId);
      if (user) {
        db.updateUserStatus(userId, user.status === 'Active' ? 'Banned' : 'Active');
      }
    },
    async getTransactions(): Promise<Transaction[]> {
      await wait();
      return db.getAllTransactions();
    },
    async handlePayout(txId: string, action: 'approve' | 'reject') {
      await wait();
      const txs = db.getAllTransactions();
      const tx = txs.find(t => t.id === txId);
      if (!tx || tx.type !== 'Payout' || tx.status !== 'Pending') return;

      if (action === 'approve') {
        db.updateTransactionStatus(txId, 'Completed');
      } else {
        db.updateTransactionStatus(txId, 'Rejected');
        const user = db.getUser(tx.userId!);
        if (user) {
          user.balance += tx.amount;
          db.saveUser(user);
        }
      }
    },
    async upsertTask(task: Task) {
      await wait();
      db.saveTask(task);
    },
    async deleteTask(id: string) {
      await wait();
      db.deleteTask(id);
    },
    async updateSettings(settings: any) {
      await wait();
      db.updateSettings(settings);
    },
    exportDB() {
      return db.exportData();
    },
    importDB(json: string) {
      db.importData(json);
    }
  }
};
