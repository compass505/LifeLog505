import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requestJsonFromOpenAI } from '../_shared/openai.ts';

type ChatAiResult = {
  reply?: string;
  target_date?: string | null;
  needs_diary_update?: boolean;
  mood?: string | null;
  tags?: string[];
  meals?: Array<{ meal_type?: string; description?: string; calories?: number | null; memo?: string | null }>;
  exercises?: Array<{ exercise_name?: string; sets?: number | null; reps?: number | null; weight?: number | null; duration_minutes?: number | null; memo?: string | null }>;
  diary_update_request?: { target_date?: string; content?: string } | null;
};

const systemPrompt = `あなたはLifeLog505というライフログアプリ内のAIです。
ただし、ユーザーに対して「日記作成担当」や「記録係」のようには振る舞わないでください。
最優先は、ユーザーが友達と楽しく自然に話しているように感じることです。
返答方針:
- 友達のように自然に話す
- 軽く共感する
- 必要なら会話が続くように自然な質問を1つだけする
- 質問しすぎない
- 説教しない
- 大げさに褒めすぎない
- ユーザーの話を否定しない
- 日記作成を前面に出さない
禁止表現:
- 「日記に残しておくね」
- 「記録しておくね」
- 「メモしておくね」
- 「保存しておくね」
内部的には、会話内容から食事、運動、感情、タグ、対象日付、過去日記への反映候補を抽出してください。
返答は必ず次のJSON形式にしてください。
{"reply":"string","target_date":"YYYY-MM-DD or null","needs_diary_update":true,"mood":"string or null","tags":["string"],"meals":[],"exercises":[],"diary_update_request":null}`;

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

    const { message, client_date } = await req.json();
    if (!message || !client_date) return jsonResponse({ error: 'message and client_date are required' }, 400);

    const userId = userData.user.id;
    const [{ data: profile }, { data: recentMessages }, { data: todayDiary }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('chat_messages').select('role, content, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('diaries').select('summary').eq('user_id', userId).eq('diary_date', client_date).maybeSingle(),
    ]);

    const userPrompt = `今回のユーザー入力:
${message}

今日の日付:
${client_date}

ユーザーの重要プロフィール:
${profile?.important_profile ?? 'なし'}

最近の関心ごと:
${profile?.recent_interests ?? 'なし'}

直近の会話:
${JSON.stringify([...(recentMessages ?? [])].reverse())}

当日の簡易サマリー:
${todayDiary?.summary ?? 'なし'}`;

    const ai = await requestJsonFromOpenAI(systemPrompt, userPrompt) as ChatAiResult;
    const reply = ai.reply || 'うん、聞いてるよ。もう少し話してみる？';
    const targetDate = ai.target_date || client_date;
    const needsUpdate = Boolean(ai.needs_diary_update);

    const { data: userMessage, error: userInsertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        diary_date: client_date,
        role: 'user',
        content: message,
        target_date: targetDate,
        needs_diary_update: needsUpdate,
      })
      .select()
      .single();
    if (userInsertError) throw userInsertError;

    await supabase.from('chat_messages').insert({
      user_id: userId,
      diary_date: client_date,
      role: 'assistant',
      content: reply,
      target_date: targetDate,
      needs_diary_update: needsUpdate,
    });

    const meals = (ai.meals ?? []).filter((meal) => meal.description).map((meal) => ({
      user_id: userId,
      diary_date: targetDate,
      meal_type: meal.meal_type || 'unknown',
      description: meal.description,
      calories: meal.calories ?? null,
      memo: meal.memo ?? null,
    }));
    if (meals.length) await supabase.from('meals').insert(meals);

    const exercises = (ai.exercises ?? []).filter((exercise) => exercise.exercise_name).map((exercise) => ({
      user_id: userId,
      diary_date: targetDate,
      exercise_name: exercise.exercise_name,
      sets: exercise.sets ?? null,
      reps: exercise.reps ?? null,
      weight: exercise.weight ?? null,
      duration_minutes: exercise.duration_minutes ?? null,
      memo: exercise.memo ?? null,
    }));
    if (exercises.length) await supabase.from('exercises').insert(exercises);

    if (ai.diary_update_request?.target_date && ai.diary_update_request?.content) {
      await supabase.from('diary_update_requests').insert({
        user_id: userId,
        target_date: ai.diary_update_request.target_date,
        content: ai.diary_update_request.content,
        source_chat_message_id: userMessage.id,
      });
    }

    return jsonResponse({ reply });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'ごめん、今ちょっと返事がうまくできなかった。もう一回送ってみて。' }, 500);
  }
});
