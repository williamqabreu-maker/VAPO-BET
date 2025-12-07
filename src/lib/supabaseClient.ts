
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = 'https://bmstvzlfzvvrispwcesp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtc3R2emxmenZ2cmlzcHdjZXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5ODA5MTcsImV4cCI6MjA4MDU1NjkxN30.otGZZiJjyPFepNTctzc2FRoHzIwixE_tMRpY9iXARrY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
