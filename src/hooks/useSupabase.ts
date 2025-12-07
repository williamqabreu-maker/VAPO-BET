
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BetsService, ProfileService } from '../services/supabaseDataService';
import { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await ProfileService.getProfile(userId);
    if (data) setProfile(data);
    setLoading(false);
  };

  return { user, profile, loading };
};

export const useRealtimeBets = (userId: string) => {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBets = async () => {
    setLoading(true);
    const { data } = await BetsService.fetchBets(userId);
    if (data) {
        // Map snake_case to camelCase if necessary for frontend compatibility
        // For now, keeping as is or mapping manually
        const mapped = data.map(b => ({
            ...b,
            stakeUnits: b.stake_units,
            profitUnits: b.profit_units,
            sentToGroup: b.sent_to_group,
            tipType: b.tip_type
        }));
        setBets(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    
    loadBets();

    // Subscribe to realtime changes on 'bets' table
    const channel = supabase
      .channel('public:bets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bets' }, (payload) => {
        // Simple strategy: reload all on change to ensure consistency with RLS
        // Optimization: Handle INSERT/UPDATE/DELETE locally
        console.log('Realtime change detected:', payload);
        loadBets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { bets, loading, refresh: loadBets };
};
