

import { User, UserPlan, UserStatus, AdminStats, Transaction, Banner } from '../types';

// Keys for LocalStorage simulating Tables
const DB_KEYS = {
  USERS: 'vapobet_db_users',
  TRANSACTIONS: 'vapobet_db_transactions',
  SETTINGS: 'vapobet_db_settings',
  BANNERS: 'vapobet_db_banners'
};

class DatabaseService {
  // --- USER TABLE OPERATIONS ---

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(DB_KEYS.USERS);
      let users: User[] = data ? JSON.parse(data) : [];
      
      // AUTO-DOWNGRADE CHECK
      // Every time we fetch users, we check if subscriptions expired
      const now = new Date();
      let hasUpdates = false;

      users = users.map(u => {
          if (u.plan !== 'free' && u.role !== 'admin' && u.subscriptionEnds) {
              const expireDate = new Date(u.subscriptionEnds);
              if (now > expireDate) {
                  hasUpdates = true;
                  return { ...u, plan: 'free', subscriptionEnds: undefined };
              }
          }
          return u;
      });

      if (hasUpdates) {
          localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      }

      return users;
    } catch (e) {
      console.error("DB Error: Failed to fetch users", e);
      return [];
    }
  }

  saveUser(user: User): void {
    const users = this.getUsers(); // This triggers the auto-downgrade check
    const index = users.findIndex(u => u.id === user.id);
    
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }

  deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }

  updateUserPlan(userId: string, plan: UserPlan, status: UserStatus = 'active', durationDays: number = 30): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      plan,
      status,
      // If becoming PRO, set expire date
      subscriptionEnds: plan !== 'free' 
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() 
        : undefined
    };

    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return users[index];
  }

  // --- TRANSACTION OPERATIONS ---

  createTransaction(transaction: Transaction): void {
      const transactions = this.getTransactions();
      transactions.unshift(transaction); // Newest first
      localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(transactions));

      // Automate Plan Upgrade upon approved transaction
      if (transaction.status === 'approved') {
          this.updateUserPlan(transaction.userId, transaction.planPurchased);
      }
  }

  getTransactions(): Transaction[] {
      try {
          const data = localStorage.getItem(DB_KEYS.TRANSACTIONS);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  }

  // --- BANNER OPERATIONS ---

  getBanners(): Banner[] {
      try {
          const data = localStorage.getItem(DB_KEYS.BANNERS);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  }

  saveBanner(banner: Banner): void {
      const banners = this.getBanners();
      // Add to beginning
      banners.unshift(banner);
      localStorage.setItem(DB_KEYS.BANNERS, JSON.stringify(banners));
  }

  deleteBanner(id: string): void {
      const banners = this.getBanners().filter(b => b.id !== id);
      localStorage.setItem(DB_KEYS.BANNERS, JSON.stringify(banners));
  }

  // --- ANALYTICS / SAAS METRICS ---

  getStats(): AdminStats {
    const users = this.getUsers();
    const transactions = this.getTransactions();
    
    // Calculate Stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const proCount = users.filter(u => u.plan === 'pro').length;
    
    // Calculate Real Revenue from Transactions
    // Filter approved transactions from current month to simulate MRR roughly
    const totalRevenue = transactions
        .filter(t => t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Mock Churn (random between 2-5%)
    const churnRate = 3.2;

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      proCount,
      churnRate
    };
  }

  // --- SEEDING (For Demo Purposes) ---
  
  seedDatabase() {
    const existing = this.getUsers();
    if (existing.length > 5) return; 

    const mockUsers: User[] = [
      {
        id: 'user_01', name: 'Ricardo Trader', email: 'ricardo@email.com', role: 'user', 
        joinedAt: new Date(Date.now() - 10000000).toISOString(), plan: 'pro', status: 'active', lastLogin: new Date().toISOString()
      },
      {
        id: 'user_02', name: 'Ana Souza', email: 'ana@email.com', role: 'user', 
        joinedAt: new Date(Date.now() - 20000000).toISOString(), plan: 'free', status: 'active'
      },
      {
        id: 'user_03', name: 'Pedro Apostas', email: 'pedro@email.com', role: 'user', 
        joinedAt: new Date(Date.now() - 5000000).toISOString(), plan: 'pro', status: 'active', subscriptionEnds: new Date(Date.now() + 864000000).toISOString()
      },
      {
        id: 'user_05', name: 'Lucas Green', email: 'lucas@email.com', role: 'user', 
        joinedAt: new Date().toISOString(), plan: 'free', status: 'active'
      }
    ];

    // Seed Transactions
    const mockTransactions: Transaction[] = [
        { id: 'tx_1', userId: 'user_01', userName: 'Ricardo Trader', amount: 97.00, planPurchased: 'pro', status: 'approved', method: 'pix', date: new Date(Date.now() - 10000000).toISOString() },
        { id: 'tx_2', userId: 'user_03', userName: 'Pedro Apostas', amount: 97.00, planPurchased: 'pro', status: 'approved', method: 'credit_card', date: new Date(Date.now() - 5000000).toISOString() }
    ];

    // Preserve Admin
    const admin = existing.find(u => u.role === 'admin');
    if (admin) mockUsers.push(admin);

    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(mockUsers));
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(mockTransactions));
    return mockUsers;
  }
}

export const dbService = new DatabaseService();