
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { dbService } from '../services/database';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getAllUsers: () => Promise<User[]>; // Kept for compatibility, redirects to DB
  deleteUser: (userId: string) => Promise<void>; // Kept for compatibility
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('vapobet_session');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao recuperar sessão", e);
        localStorage.removeItem('vapobet_session');
      }
    }
    // Optional: Seed DB for demo
    dbService.seedDatabase();
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    return new Promise<void>((resolve, reject) => {
      try {
        // BACKDOOR / DEFAULT ADMIN ACCESS
        if (email === 'admin@vapobet.com' && (password === 'admin123' || password === 'admin@vapobet.com')) {
           const adminUser: User = {
              id: 'admin-master',
              email: 'admin@vapobet.com',
              name: 'VapoMaster (Admin)',
              avatarUrl: '',
              role: 'admin',
              joinedAt: new Date().toISOString(),
              plan: 'pro',
              status: 'active'
           };
           // Ensure admin is in DB too
           dbService.saveUser(adminUser);
           
           localStorage.setItem('vapobet_session', JSON.stringify(adminUser));
           setUser(adminUser);
           resolve();
           return;
        }

        const usersDb = dbService.getUsers();
        // Simple password check (In real app, hash this!)
        // Since we don't store passwords in the public User type for safety in this demo, 
        // we assume if user exists in DB, they pass for now OR we check a separate credential store.
        // For this mock, we are reusing the Users DB array which DOES NOT have passwords in the type definition above
        // but might have them in the raw JSON. To keep it simple for this mock:
        // We will trust the email exists. In a real scenario, use Firebase/Auth0.
        
        // Simulating: If email exists, let them in (Mock Mode)
        // OR check against the legacy array if it exists
        const legacyDb = JSON.parse(localStorage.getItem('vapobet_users_db') || '[]');
        const foundLegacy = legacyDb.find((u: any) => u.email === email && u.password === password);
        
        const foundDbUser = usersDb.find(u => u.email === email);

        if (foundLegacy || foundDbUser) {
          const u = foundDbUser || foundLegacy;
          const sessionUser: User = {
              id: u.id,
              email: u.email,
              name: u.name,
              avatarUrl: u.avatarUrl,
              role: u.role,
              joinedAt: u.joinedAt,
              plan: u.plan || 'free',
              status: u.status || 'active',
              lastLogin: new Date().toISOString()
          };
          
          // Update last login in DB
          dbService.saveUser(sessionUser);

          localStorage.setItem('vapobet_session', JSON.stringify(sessionUser));
          setUser(sessionUser);
          resolve();
        } else {
          reject(new Error("E-mail ou senha incorretos."));
        }
      } catch (error) {
        reject(error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    return new Promise<void>((resolve, reject) => {
      try {
        const usersDb = dbService.getUsers();
        
        if (usersDb.find((u) => u.email === email)) {
          throw new Error("Este e-mail já está em uso.");
        }

        const role = email === 'admin@vapobet.com' ? 'admin' : 'user';
        
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          avatarUrl: '',
          role,
          joinedAt: new Date().toISOString(),
          plan: 'free',
          status: 'active',
          lastLogin: new Date().toISOString()
        };

        // Save to DB Service
        dbService.saveUser(newUser);
        
        // Save legacy password separately (Mock)
        const legacyDb = JSON.parse(localStorage.getItem('vapobet_users_db') || '[]');
        legacyDb.push({ ...newUser, password });
        localStorage.setItem('vapobet_users_db', JSON.stringify(legacyDb));

        localStorage.setItem('vapobet_session', JSON.stringify(newUser));
        setUser(newUser);
        resolve();

      } catch (error: any) {
        reject(error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('vapobet_session');
    setUser(null);
  };

  const getAllUsers = async (): Promise<User[]> => {
      return dbService.getUsers();
  };

  const deleteUser = async (userId: string) => {
      dbService.deleteUser(userId);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, getAllUsers, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
