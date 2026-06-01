import { supabase } from './supabaseClient';

export async function getRecentMessages(limit = 40) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return [...(data ?? [])].reverse();
}

export async function sendChatMessage({ message, clientDate }) {
  const { data, error } = await supabase.functions.invoke('chat', {
    body: { message, client_date: clientDate },
  });
  if (error) throw error;
  return data;
}

export async function generateDiary(targetDate) {
  const { data, error } = await supabase.functions.invoke('generate-diary', {
    body: { target_date: targetDate },
  });
  if (error) throw error;
  return data;
}
