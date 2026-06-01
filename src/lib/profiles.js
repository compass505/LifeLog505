import { supabase } from './supabaseClient';

export async function getMyProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertMyProfile(profile) {
  const { data, error } = await supabase.from('profiles').upsert(profile, { onConflict: 'user_id' }).select().single();
  if (error) throw error;
  return data;
}
