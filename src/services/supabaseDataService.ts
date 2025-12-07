
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/database.types';

// Tipos auxiliares
type DbBet = Database['public']['Tables']['bets']['Row'];
type DbProfile = Database['public']['Tables']['profiles']['Row'];

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export const BetsService = {
  /**
   * Busca apostas do usuário logado E apostas compartilhadas no grupo (Feed)
   */
  async fetchBets(userId: string): Promise<ServiceResponse<DbBet[]>> {
    try {
      // A política RLS no banco já filtra: (user_id = me) OR (sent_to_group = true)
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (err: any) {
      console.error('Error fetching bets:', err);
      return { data: null, error: err.message };
    }
  },

  async createBet(betData: Partial<DbBet>): Promise<ServiceResponse<DbBet>> {
    try {
      // Garantir que não haja campos undefined
      const cleanData = JSON.parse(JSON.stringify(betData));
      
      const { data, error } = await supabase
        .from('bets')
        .insert(cleanData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  async updateBet(betId: string, updates: Partial<DbBet>): Promise<ServiceResponse<DbBet>> {
    try {
      const { data, error } = await supabase
        .from('bets')
        .update(updates)
        .eq('id', betId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  async deleteBet(betId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('bets').delete().eq('id', betId);
      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
};

export const ProfileService = {
  async getProfile(userId: string): Promise<ServiceResponse<DbProfile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Se der erro de não encontrado, retornamos null sem lançar exceção crítica
      if (error && error.code !== 'PGRST116') throw error;
      
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  // UPSERT: Cria se não existir, atualiza se existir. Crítico para Auth.
  async upsertProfile(profileData: Partial<DbProfile>): Promise<ServiceResponse<DbProfile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData as any)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err);
      return { data: null, error: err.message };
    }
  },

  async updateProfile(userId: string, updates: Partial<DbProfile>): Promise<ServiceResponse<DbProfile>> {
      return this.upsertProfile({ ...updates, id: userId });
  }
};

export const BankrollService = {
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from('bankroll_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  },

  async upsertSettings(userId: string, settings: any) {
    const { data, error } = await supabase
      .from('bankroll_settings')
      .upsert({ ...settings, user_id: userId })
      .select()
      .single();
      
    return { data, error };
  }
};
