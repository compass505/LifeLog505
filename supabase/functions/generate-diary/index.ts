import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requestJsonFromOpenAI } from '../_shared/openai.ts';

type DiaryAiResult = {
  title?: string;
  body?: string;
  mood?: string;
  summary?: string;
  tags?: string[];
};

const systemPrompt = `あなたはLifeLog505の日記生成AIです。
指定された日付の会話ログ、食事データ、運動データ、追記候補をもとに、自然な日本語の日記本文を作成してください。
日記本文の方針:
- 300〜600字程度
- 普通の日記として自然に読める文章
- 箇条書きではなく文章形式
- 事実と感情を自然に含める
- ポジティブに盛りすぎない
- ユーザー本人が後から読んで違和感が少ない文体
- 過度にきれいごとにしない
- 会話口調ではなく、落ち着いた日記文にする
返答は必ず次のJSON形式にしてください。
{"title":"string","body":"string","mood":"string","summary":"string","tags":["string"]}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !userData.user) return jsonResponse({ error: 'ログインが必要です。' }, 401);

    const { target_date } = await req.json();
    if (!target_date) return jsonResponse({ error: 'target_date is required' }, 400);

    const userId = userData.user.id;
    const [messagesResult, mealsResult, exercisesResult, requestsResult, diaryResult] = await Promise.all([
      supabase
        .from('chat_messages')
        .select('role, content, diary_date, target_date, needs_diary_update, created_at')
        .eq('user_id', userId)
        .or(`diary_date.eq.${target_date},target_date.eq.${target_date}`)
        .order('created_at'),
      supabase.from('meals').select('*').eq('user_id', userId).eq('diary_date', target_date).order('created_at'),
      supabase.from('exercises').select('*').eq('user_id', userId).eq('diary_date', target_date).order('created_at'),
      supabase.from('diary_update_requests').select('*').eq('user_id', userId).eq('target_date', target_date).eq('status', 'pending').order('created_at'),
      supabase.from('diaries').select('*').eq('user_id', userId).eq('diary_date', target_date).maybeSingle(),
    ]);

    if (messagesResult.error) throw messagesResult.error;
    if (mealsResult.error) throw mealsResult.error;
    if (exercisesResult.error) throw exercisesResult.error;
    if (requestsResult.error) throw requestsResult.error;

    const userPrompt = `対象日付:
${target_date}

既存の日記:
${JSON.stringify(diaryResult.data ?? null)}

会話ログ:
${JSON.stringify(messagesResult.data ?? [])}

食事データ:
${JSON.stringify(mealsResult.data ?? [])}

運動データ:
${JSON.stringify(exercisesResult.data ?? [])}

追記候補:
${JSON.stringify(requestsResult.data ?? [])}`;

    const ai = await requestJsonFromOpenAI(systemPrompt, userPrompt) as DiaryAiResult;
    const { data: diary, error: diaryError } = await supabase
      .from('diaries')
      .upsert({
        user_id: userId,
        diary_date: target_date,
        title: ai.title || `${target_date}の日記`,
        body: ai.body || '',
        mood: ai.mood || null,
        summary: ai.summary || null,
        status: 'generated',
      }, { onConflict: 'user_id,diary_date' })
      .select()
      .single();
    if (diaryError) throw diaryError;

    const tagNames = [...new Set((ai.tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
    const { error: deleteTagsError } = await supabase.from('diary_tags').delete().eq('user_id', userId).eq('diary_id', diary.id);
    if (deleteTagsError) throw deleteTagsError;

    for (const name of tagNames) {
      const { data: tag, error: tagError } = await supabase
        .from('tags')
        .upsert({ user_id: userId, name }, { onConflict: 'user_id,name' })
        .select()
        .single();
      if (tagError) throw tagError;
      await supabase.from('diary_tags').upsert({ user_id: userId, diary_id: diary.id, tag_id: tag.id }, { onConflict: 'diary_id,tag_id' });
    }

    const requestIds = (requestsResult.data ?? []).map((request) => request.id);
    if (requestIds.length) {
      await supabase.from('diary_update_requests').update({ status: 'applied' }).in('id', requestIds);
    }

    return jsonResponse({ diary: { ...diary, tags: tagNames } });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: '日記を作成できませんでした。' }, 500);
  }
});
