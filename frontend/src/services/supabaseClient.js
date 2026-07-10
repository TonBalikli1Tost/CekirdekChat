import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function getUserId() {
  try {
    if (!supabase) return 'anon';
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data?.user?.id || 'anon';
  } catch (error) {
    console.error('Anon oturum hatası:', error);
    return 'anon';
  }
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Kullanıcı alınamadı:', error);
    return null;
  }
  return data?.user || null;
}
