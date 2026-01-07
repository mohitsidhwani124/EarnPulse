
import { db } from './db';
import { User, Task, Transaction } from '../types';

const LATENCY = 800; 

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
      
      const role = email.includes('admin') ? 'admin' : 'user';
      const newUser: User = {
        id: email,
        name: email.split('@')[0],
        balance: 0,
        totalEarned: 0,
        completedTasks: 0,
        streak: 1,
        role: role as 'user' | 'admin'
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
    }
  },
  wallet: {
    async getHistory(): Promise<Transaction[]> {
      await wait();
      const userId = db.getCurrentUserId();
      return userId ? db.getTransactions(userId) : [];
    }
  },
  admin: {
    async getStats() {
      await wait();
      const users = db.getAllUsers();
      const txs = db.getAllTransactions();
      return {
        totalUsers: users.length,
        totalBalance: users.reduce((acc, u) => acc + u.balance, 0),
        totalPayouts: txs.filter(t => t.type === 'Payout').reduce((acc, t) => acc + t.amount, 0),
        activeTasks: db.getTasks().length
      };
    },
    async getUsers(): Promise<User[]> {
      await wait();
      return db.getAllUsers();
    },
    async getTransactions(): Promise<Transaction[]> {
      await wait();
      return db.getAllTransactions();
    },
    async upsertTask(task: Task) {
      await wait();
      db.saveTask(task);
    },
    async deleteTask(id: string) {
      await wait();
      db.deleteTask(id);
    }
  }
};
