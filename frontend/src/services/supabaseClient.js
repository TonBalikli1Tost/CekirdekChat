import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function ensureAuthenticatedUser() {
  if (!supabase) return null;

  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return data.user;
    }

    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) {
      console.error('Anon oturum açma hatası:', anonError);
      return null;
    }
    return anonData?.user || null;
  } catch (error) {
    console.error('Auth işlemi hatası:', error);
    return null;
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
