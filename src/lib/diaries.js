import { supabase } from './supabaseClient';

const diarySelect = '*, diary_tags(tags(*))';

export async function listDiaries() {
  const { data, error } = await supabase.from('diaries').select(diarySelect).order('diary_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getDiary(id) {
  const { data, error } = await supabase.from('diaries').select(diarySelect).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getDiaryLogs(diaryDate) {
  const [mealsResult, exercisesResult] = await Promise.all([
    supabase.from('meals').select('*').eq('diary_date', diaryDate).order('created_at'),
    supabase.from('exercises').select('*').eq('diary_date', diaryDate).order('created_at'),
  ]);
  if (mealsResult.error) throw mealsResult.error;
  if (exercisesResult.error) throw exercisesResult.error;
  return {
    meals: mealsResult.data ?? [],
    exercises: exercisesResult.data ?? [],
  };
}

export async function updateDiary(id, changes) {
  const { data, error } = await supabase
    .from('diaries')
    .update({ ...changes, status: 'edited', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDiary(id) {
  const { error } = await supabase.from('diaries').delete().eq('id', id);
  if (error) throw error;
}

export async function searchDiaries(keyword) {
  const term = keyword.trim();
  if (!term) return [];
  const { data, error } = await supabase
    .from('diaries')
    .select(diarySelect)
    .or(`title.ilike.%${term}%,body.ilike.%${term}%,summary.ilike.%${term}%`)
    .order('diary_date', { ascending: false });
  if (error) throw error;

  const { data: tagged, error: tagError } = await supabase
    .from('diary_tags')
    .select('diaries(*, diary_tags(tags(*))), tags!inner(name)')
    .ilike('tags.name', `%${term}%`);
  if (tagError) throw tagError;

  const map = new Map((data ?? []).map((diary) => [diary.id, diary]));
  for (const row of tagged ?? []) {
    if (row.diaries) map.set(row.diaries.id, row.diaries);
  }
  return [...map.values()].sort((a, b) => b.diary_date.localeCompare(a.diary_date));
}
