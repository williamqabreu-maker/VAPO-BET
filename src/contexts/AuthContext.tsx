
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';
import { ProfileService } from '../services/supabaseDataService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<User[]>; 
  deleteUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mapeia o perfil do banco (snake_case) para o objeto User da aplicação (camelCase)
  const mapProfileToUser = (profile: any, authUser: any): User => ({
    id: authUser.id,
    email: authUser.email!,
    name: profile?.full_name || profile?.username || authUser.user_metadata?.full_name || 'Usuário',
    avatarUrl: profile?.avatar_url || '',
    role: profile?.role || 'user',
    joinedAt: profile?.joined_at || new Date().toISOString(),
    plan: profile?.plan || 'free',
    status: profile?.status || 'active',
    subscriptionEnds: profile?.subscription_ends_at
  });

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await ProfileService.getProfile(session.user.id);
          
          if (mounted) {
            if (profile) {
              setUser(mapProfileToUser(profile, session.user));
            } else {
              // Fallback temporário usando metadados da sessão
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.full_name || 'Novo Usuário',
                role: 'user',
                plan: 'free',
                status: 'active',
                joinedAt: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.error("Erro auth:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
            setUser(null);
            setIsLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const { data: profile } = await ProfileService.getProfile(session.user.id);
        if (mounted) {
            if (profile) {
                setUser(mapProfileToUser(profile, session.user));
            } else {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.full_name || 'Usuário',
                    role: 'user',
                    plan: 'free',
                    status: 'active',
                    joinedAt: new Date().toISOString()
                });
            }
            setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    } catch (error: any) {
        setIsLoading(false);
        throw new Error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }
            }
        });

        if (error) throw error;

        // CRÍTICO: Criar o perfil manualmente se o cadastro for bem sucedido
        if (data.user) {
            const { error: profileError } = await ProfileService.upsertProfile({
                id: data.user.id,
                email: email,
                full_name: name,
                role: 'user',
                plan: 'free',
                status: 'active',
                joined_at: new Date().toISOString()
            });
            
            if (profileError) {
                console.error("Erro ao criar perfil:", profileError);
            }
        }
    } catch (error: any) {
        setIsLoading(false);
        throw new Error(error.message);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const getAllUsers = async (): Promise<User[]> => {
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error(error);
      return [];
    }
    return profiles.map(p => ({
      id: p.id,
      email: p.email || 'hidden',
      name: p.full_name || 'User',
      avatarUrl: p.avatar_url || undefined,
      role: p.role,
      joinedAt: p.joined_at,
      plan: p.plan,
      status: p.status
    })) as User[];
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'banned' }).eq('id', userId);
    if (error) throw error;
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
