# LifeLog505 詳細設計書 第1版

## 1. 詳細設計の目的

本書は、要件定義書および基本設計書をもとに、LifeLog505の実装に必要な詳細仕様を整理するものである。

本書では、以下を具体化する。

* 画面構成
* Reactコンポーネント構成
* ルーティング
* Supabaseテーブル定義
* RLSポリシー方針
* Edge Function設計
* OpenAI APIへのプロンプト方針
* AI返却JSON形式
* エラー処理
* 実装順序

本書は、Codexに実装を依頼する際の前提資料として利用する。

---

## 2. 前提

### 2.1 アプリ名

アプリ名は以下とする。

LifeLog505

### 2.2 技術構成

MVPでは以下の技術構成とする。

React
Supabase
Supabase Auth
Supabase Database
Supabase Edge Functions
OpenAI API

### 2.3 開発方針

MVPでは、まずWebアプリとして実装する。

スマホアプリ化、PWA対応、通知、写真投稿、意味検索は将来拡張とする。

### 2.4 AIチャットの基本方針

AIは日記作成担当としてではなく、友達のような話し相手として振る舞う。

チャット体験では、ユーザーが「日記を書いている」「記録されている」と強く意識しないようにする。

AIは原則として以下の表現を使用しない。

日記に残しておくね
記録しておくね
メモしておくね
保存しておくね

---

## 3. 推奨ディレクトリ構成

Reactプロジェクト内の構成は以下を想定する。

```text
lifelog505/
├── docs/
│   ├── requirements.md
│   ├── basic-design.md
│   └── detailed-design.md
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   ├── chat/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── GenerateDiaryButton.jsx
│   │   ├── diary/
│   │   │   ├── DiaryCard.jsx
│   │   │   ├── DiaryList.jsx
│   │   │   ├── DiaryDetail.jsx
│   │   │   └── DiaryEditor.jsx
│   │   ├── logs/
│   │   │   ├── MealList.jsx
│   │   │   └── ExerciseList.jsx
│   │   └── search/
│   │       └── SearchForm.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── DiaryListPage.jsx
│   │   ├── DiaryDetailPage.jsx
│   │   ├── SearchPage.jsx
│   │   └── SettingsPage.jsx
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   ├── auth.js
│   │   ├── diaries.js
│   │   ├── chat.js
│   │   ├── meals.js
│   │   ├── exercises.js
│   │   └── profiles.js
│   ├── routes/
│   │   └── AppRouter.jsx
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── functions/
│       ├── chat/
│       │   └── index.ts
│       └── generate-diary/
│           └── index.ts
├── .env.example
├── package.json
└── README.md
```

---

## 4. 画面設計

### 4.1 ログイン画面

目的

登録済みユーザーがLifeLog505にログインする。

URL

/login

表示項目

* アプリ名
* メールアドレス入力欄
* パスワード入力欄
* ログインボタン
* 新規登録画面へのリンク
* エラーメッセージ表示エリア

入力項目

| 項目 | 必須 | 備考 |
| --- | --- | --- |
| メールアドレス | 必須 | Supabase Authで使用 |
| パスワード | 必須 | Supabase Authで使用 |

処理

1. ユーザーがメールアドレスとパスワードを入力する
2. ログインボタンを押す
3. Supabase Authでログイン処理を行う
4. 成功時はチャット画面へ遷移する
5. 失敗時はエラーメッセージを表示する

---

### 4.2 新規登録画面

目的

新規ユーザーがアカウントを作成する。

URL

/signup

表示項目

* アプリ名
* メールアドレス入力欄
* パスワード入力欄
* パスワード確認欄
* 新規登録ボタン
* ログイン画面へのリンク
* エラーメッセージ表示エリア

入力項目

| 項目 | 必須 | 備考 |
| --- | --- | --- |
| メールアドレス | 必須 | Supabase Authで使用 |
| パスワード | 必須 | 8文字以上を推奨 |
| パスワード確認 | 必須 | パスワードと一致確認 |

処理

1. ユーザーが登録情報を入力する
2. 新規登録ボタンを押す
3. パスワードと確認欄の一致を確認する
4. Supabase Authでユーザーを作成する
5. profilesテーブルに初期プロフィールを作成する
6. 成功時はチャット画面へ遷移する

---

### 4.3 チャット画面

目的

ユーザーがAIと友達のように自然に会話する。

URL

/chat

表示項目

* ヘッダー
* チャット履歴
* ユーザー入力欄
* 送信ボタン
* 今日の日記を作成するボタン
* 日記一覧へのリンク
* 検索画面へのリンク
* 設定画面へのリンク

入力項目

| 項目 | 必須 | 備考 |
| --- | --- | --- |
| メッセージ | 必須 | ユーザーがAIに送る内容 |

処理

1. ユーザーがメッセージを入力する
2. 送信ボタンを押す
3. 入力メッセージをEdge Function chat に送信する
4. Edge FunctionがOpenAI APIを呼び出す
5. AI返答を受け取る
6. ユーザー発言とAI返答をchat_messagesに保存する
7. 必要に応じてmeals、exercises、diary_update_requestsに保存する
8. AI返答を画面に表示する

補足

チャット画面では、日記作成を前面に出しすぎない。

「今日の日記を作成する」ボタンは配置するが、メイン体験はあくまでAIとの会話とする。

---

### 4.4 日記一覧画面

目的

生成済みの日記を一覧表示する。

URL

/diaries

表示項目

* 日付
* タイトル
* 本文プレビュー
* 感情
* タグ
* 日記詳細へのリンク

処理

1. ログイン中ユーザーのdiariesを取得する
2. diary_dateの降順で表示する
3. 日記カードをクリックすると日記詳細画面へ遷移する

---

### 4.5 日記詳細画面

目的

選択した日付の日記本文、食事、運動などを確認する。

URL

/diaries/:id

表示項目

* 日付
* タイトル
* 日記本文
* 感情
* 要約
* タグ
* 食事データ
* 運動データ
* 編集ボタン
* 削除ボタン

処理

1. URLのidから対象日記を取得する
2. 対象日記に関連する食事データを取得する
3. 対象日記に関連する運動データを取得する
4. 編集ボタン押下で編集モードにする
5. 保存ボタンで日記本文を更新する
6. 削除ボタンで日記を削除する

---

### 4.6 検索画面

目的

過去の日記をキーワードで検索する。

URL

/search

表示項目

* 検索キーワード入力欄
* 検索ボタン
* 検索結果一覧

処理

1. ユーザーが検索キーワードを入力する
2. 検索ボタンを押す
3. diaries.title、diaries.body、diaries.summary、tags.nameを対象に検索する
4. 検索結果を一覧表示する
5. 日記をクリックすると日記詳細画面へ遷移する

---

### 4.7 設定画面

目的

ユーザー設定を管理する。

URL

/settings

表示項目

* 表示名
* AIの口調設定
* 重要プロフィール
* 最近の関心ごと
* 保存ボタン
* ログアウトボタン

入力項目

| 項目 | 必須 | 備考 |
| --- | --- | --- |
| 表示名 | 任意 | AIの呼びかけに利用可能 |
| AIの口調設定 | 任意 | MVPでは友達寄りを初期値にする |
| 重要プロフィール | 任意 | AIに渡す継続的情報 |
| 最近の関心ごと | 任意 | AIに渡す最近の傾向 |

処理

1. profilesから現在の設定を取得する
2. ユーザーが内容を編集する
3. 保存ボタンでprofilesを更新する
4. ログアウトボタンでSupabase Authからログアウトする

---

## 5. ルーティング設計

MVPのルートは以下とする。

| パス | 画面 | 認証 |
| --- | --- | --- |
| /login | ログイン画面 | 不要 |
| /signup | 新規登録画面 | 不要 |
| /chat | チャット画面 | 必要 |
| /diaries | 日記一覧画面 | 必要 |
| /diaries/:id | 日記詳細画面 | 必要 |
| /search | 検索画面 | 必要 |
| /settings | 設定画面 | 必要 |

未ログイン状態で認証が必要な画面にアクセスした場合は、/login にリダイレクトする。

ログイン済み状態で /login または /signup にアクセスした場合は、/chat にリダイレクトする。

---

## 6. Reactコンポーネント設計

### 6.1 共通コンポーネント

Header

役割

アプリ共通のヘッダーを表示する。

表示内容

* LifeLog505
* チャット画面へのリンク
* 日記一覧へのリンク
* 検索画面へのリンク
* 設定画面へのリンク

---

Loading

役割

通信中やAI応答待ちのローディング表示を行う。

---

ErrorMessage

役割

エラーメッセージを表示する。

---

### 6.2 認証系コンポーネント

LoginForm

役割

ログインフォームを表示する。

props

onSubmit
error
loading

---

SignupForm

役割

新規登録フォームを表示する。

props

onSubmit
error
loading

---

### 6.3 チャット系コンポーネント

ChatWindow

役割

チャット履歴全体を表示する。

props

messages
loading

---

ChatMessage

役割

1件のチャットメッセージを表示する。

props

role
content
createdAt

表示方針

* userメッセージは右寄せ
* assistantメッセージは左寄せ
* systemメッセージは原則表示しない

---

ChatInput

役割

ユーザー入力欄と送信ボタンを表示する。

props

value
onChange
onSubmit
loading

---

GenerateDiaryButton

役割

今日の日記を作成するボタンを表示する。

props

onClick
loading

---

### 6.4 日記系コンポーネント

DiaryCard

役割

日記一覧で1件の日記をカード形式で表示する。

props

diary

---

DiaryList

役割

日記カードを一覧表示する。

props

diaries

---

DiaryDetail

役割

日記詳細を表示する。

props

diary
meals
exercises
tags

---

DiaryEditor

役割

日記本文の手動編集を行う。

props

diary
onSave
onCancel

---

## 7. Supabaseテーブル詳細設計

### 7.1 profiles

ユーザーのプロフィール情報を管理する。

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  ai_tone text not null default 'friendly',
  important_profile text,
  recent_interests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);
```

カラム説明

| カラム | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | uuid | 必須 | 主キー |
| user_id | uuid | 必須 | auth.usersへの参照 |
| display_name | text | 任意 | 表示名 |
| ai_tone | text | 必須 | AIの口調 |
| important_profile | text | 任意 | 継続的に重要な情報 |
| recent_interests | text | 任意 | 最近の関心ごと |
| created_at | timestamptz | 必須 | 作成日時 |
| updated_at | timestamptz | 必須 | 更新日時 |

---

### 7.2 diaries

1日ごとの日記本文を管理する。

```sql
create table diaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diary_date date not null,
  title text,
  body text,
  mood text,
  summary text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, diary_date)
);
```

statusの値

| 値 | 意味 |
| --- | --- |
| draft | 下書き |
| generated | AI生成済み |
| edited | ユーザー編集済み |

---

### 7.3 chat_messages

ユーザーとAIの会話ログを管理する。

```sql
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diary_date date not null,
  role text not null,
  content text not null,
  target_date date,
  needs_diary_update boolean not null default false,
  created_at timestamptz not null default now()
);
```

roleの値

| 値 | 意味 |
| --- | --- |
| user | ユーザー発言 |
| assistant | AI返答 |
| system | システム用 |

補足

diary_date は、そのメッセージが発生した日付を表す。
target_date は、発言内容が実際に関係する日付を表す。

たとえば、今日「昨日の研修の話だけど」と送った場合、diary_date は今日、target_date は昨日になる。

---

### 7.4 meals

食事データを管理する。

```sql
create table meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diary_date date not null,
  meal_type text not null default 'unknown',
  description text not null,
  calories integer,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

meal_typeの値

| 値 | 意味 |
| --- | --- |
| breakfast | 朝食 |
| lunch | 昼食 |
| dinner | 夕食 |
| snack | 間食 |
| unknown | 不明 |

---

### 7.5 exercises

運動データを管理する。

```sql
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diary_date date not null,
  exercise_name text not null,
  sets integer,
  reps integer,
  weight numeric,
  duration_minutes integer,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### 7.6 tags

タグ情報を管理する。

```sql
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);
```

---

### 7.7 diary_tags

日記とタグの関連を管理する。

```sql
create table diary_tags (
  id uuid primary key default gen_random_uuid(),
  diary_id uuid not null references diaries(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(diary_id, tag_id)
);
```

---

### 7.8 diary_update_requests

過去日の日記に追記・変更したい内容を一時保存する。

```sql
create table diary_update_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_date date not null,
  content text not null,
  source_chat_message_id uuid references chat_messages(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

statusの値

| 値 | 意味 |
| --- | --- |
| pending | 未反映 |
| applied | 反映済み |
| ignored | 無視 |

---

## 8. RLS設計

Supabaseの各テーブルではRow Level Securityを有効化する。

### 8.1 基本方針

全ての主要テーブルに対して、ログイン中ユーザーは自分のデータのみ操作可能とする。

### 8.2 対象テーブル

profiles
diaries
chat_messages
meals
exercises
tags
diary_update_requests

### 8.3 基本ポリシー例

以下はdiariesテーブルの例である。

```sql
alter table diaries enable row level security;
create policy "Users can select their own diaries"
on diaries for select
using (auth.uid() = user_id);
create policy "Users can insert their own diaries"
on diaries for insert
with check (auth.uid() = user_id);
create policy "Users can update their own diaries"
on diaries for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
create policy "Users can delete their own diaries"
on diaries for delete
using (auth.uid() = user_id);
```

他のuser_idを持つテーブルにも同様の方針でRLSを設定する。

### 8.4 diary_tagsのRLS方針

diary_tagsにはuser_idがないため、diary_idからdiariesを参照し、対象diaryのuser_idがauth.uid()と一致する場合のみ操作可能とする。

MVPでは実装を簡単にするため、diary_tagsにもuser_idを追加する案を検討してもよい。

---

## 9. Edge Function設計

MVPでは以下のEdge Functionを作成する。

chat
generate-diary

---

### 9.1 chat function

目的

ユーザーのチャット送信を受け取り、AI返答を生成し、会話ログや構造化データを保存する。

エンドポイント

POST /functions/v1/chat

リクエスト

```json
{
  "message": "今日研修で結構疲れた",
  "client_date": "2026-06-01"
}
```

レスポンス

```json
{
  "reply": "おつかれ！研修って座ってるだけでも意外と体力持っていかれるよね。今日は頭も体もけっこう使った感じ？"
}
```

処理手順

1. Authorizationヘッダーからログインユーザーを確認する
2. リクエスト本文からmessageとclient_dateを取得する
3. profilesからユーザー設定を取得する
4. chat_messagesから直近の会話を取得する
5. 当日の簡易サマリーを取得する
6. OpenAI APIにチャット用プロンプトを送る
7. AI返却JSONをパースする
8. ユーザー発言をchat_messagesに保存する
9. AI返答をchat_messagesに保存する
10. mealsがあればmealsに保存する
11. exercisesがあればexercisesに保存する
12. 過去日更新候補があればdiary_update_requestsに保存する
13. replyをフロントエンドへ返す

---

### 9.2 generate-diary function

目的

指定日付の会話ログ、食事、運動、更新候補をもとに、日記本文を生成または更新する。

エンドポイント

POST /functions/v1/generate-diary

リクエスト

```json
{
  "target_date": "2026-06-01"
}
```

レスポンス

```json
{
  "diary": {
    "id": "uuid",
    "diary_date": "2026-06-01",
    "title": "研修で疲れたけど頑張った日",
    "body": "今日は会社で研修があり、少し疲れを感じた一日だった...",
    "mood": "疲れたが前向き",
    "summary": "研修で疲れたが、前向きに過ごせた一日。"
  }
}
```

処理手順

1. Authorizationヘッダーからログインユーザーを確認する
2. target_dateを取得する
3. 対象日付のchat_messagesを取得する
4. 対象日付のmealsを取得する
5. 対象日付のexercisesを取得する
6. 対象日付のpending状態のdiary_update_requestsを取得する
7. 既存のdiariesデータがあれば取得する
8. OpenAI APIに日記生成用プロンプトを送る
9. AI返却JSONをパースする
10. diariesにupsertする
11. tagsを保存または取得する
12. diary_tagsを保存する
13. 反映したdiary_update_requestsをappliedに更新する
14. 生成結果をフロントエンドへ返す

---

## 10. AIプロンプト設計

### 10.1 チャット用システムプロンプト

チャット用AIは、ユーザーの友達のような自然な話し相手として振る舞う。

```text
あなたはLifeLog505というライフログアプリ内のAIです。
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
返答は必ず指定されたJSON形式で返してください。
```

---

### 10.2 チャット用ユーザープロンプトに含める情報

Edge Functionでは、以下の情報をAIに渡す。

```text
今回のユーザー入力:
{message}
今日の日付:
{client_date}
ユーザーの重要プロフィール:
{important_profile}
最近の関心ごと:
{recent_interests}
直近の会話:
{recent_messages}
当日の簡易サマリー:
{today_summary}
```

---

### 10.3 日記生成用システムプロンプト

```text
あなたはLifeLog505の日記生成AIです。
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
返答は必ず指定されたJSON形式で返してください。
```

---

## 11. AI返却JSON設計

### 11.1 チャット用JSON

chat functionでOpenAI APIから受け取るJSON形式は以下とする。

```json
{
  "reply": "おつかれ！研修って座ってるだけでも意外と体力持っていかれるよね。今日は頭も体もけっこう使った感じ？",
  "target_date": "2026-06-01",
  "needs_diary_update": true,
  "mood": "疲れた",
  "tags": ["研修", "仕事"],
  "meals": [],
  "exercises": [],
  "diary_update_request": null
}
```

フィールド説明

| フィールド | 型 | 説明 |
| --- | --- | --- |
| reply | string | ユーザーに表示するAI返答 |
| target_date | string or null | 発言内容が関係する日付 |
| needs_diary_update | boolean | 日記更新対象か |
| mood | string or null | 感情 |
| tags | array | タグ候補 |
| meals | array | 食事データ |
| exercises | array | 運動データ |
| diary_update_request | object or null | 過去日への追記候補 |

食事データ形式

```json
{
  "meal_type": "lunch",
  "description": "パスタサラダ",
  "calories": null,
  "memo": "昼食"
}
```

運動データ形式

```json
{
  "exercise_name": "スクワット",
  "sets": 3,
  "reps": 10,
  "weight": 80,
  "duration_minutes": null,
  "memo": "夜にジムで実施"
}
```

過去日更新候補形式

```json
{
  "target_date": "2026-05-31",
  "content": "研修で発表したことを追記したい"
}
```

---

### 11.2 日記生成用JSON

generate-diary functionでOpenAI APIから受け取るJSON形式は以下とする。

```json
{
  "title": "研修で疲れたけど前向きに過ごした日",
  "body": "今日は会社で研修があり、少し疲れを感じた一日だった。座って話を聞くだけでなく、内容を理解しようと頭を使う時間も多く、終わる頃にはかなり疲れていた。それでも、同期と話す時間があり、気持ちが少し軽くなった。昼はパスタサラダを食べ、食事にも少し気を配ることができた。全体として疲れはあったが、やるべきことをこなしながら前向きに過ごせた日だった。",
  "mood": "疲れたが前向き",
  "summary": "会社の研修で疲れたが、同期との会話や食事管理もあり、前向きに過ごせた。",
  "tags": ["研修", "仕事", "食事管理"]
}
```

---

## 12. データ保存ルール

### 12.1 チャットメッセージ保存

ユーザー発言とAI返答は、どちらもchat_messagesに保存する。

ユーザー発言のroleはuser、AI返答のroleはassistantとする。

---

### 12.2 食事データ保存

AI返却JSONのmeals配列にデータがある場合、mealsテーブルに保存する。

不明な項目はnullで保存する。

---

### 12.3 運動データ保存

AI返却JSONのexercises配列にデータがある場合、exercisesテーブルに保存する。

不明な項目はnullで保存する。

---

### 12.4 過去日更新候補保存

AI返却JSONのdiary_update_requestがnullでない場合、diary_update_requestsに保存する。

この時点ではdiaries本文は更新しない。

---

### 12.5 日記生成保存

generate-diary function実行時、diariesに対象日付の日記を保存する。

同じuser_idとdiary_dateの日記が既に存在する場合は更新する。

---

## 13. エラー処理設計

### 13.1 認証エラー

発生条件

* 未ログイン
* セッション切れ
* 不正な認証情報

対応

* ログイン画面に遷移する
* 「ログインが必要です」と表示する

---

### 13.2 入力エラー

発生条件

* チャットメッセージが空
* メールアドレスが空
* パスワードが空
* パスワード確認が一致しない

対応

* 画面上にエラーメッセージを表示する
* API呼び出しは行わない

---

### 13.3 AI APIエラー

発生条件

* OpenAI API呼び出し失敗
* レスポンス形式不正
* タイムアウト

対応

* ユーザーには自然なエラーメッセージを表示する

ごめん、今ちょっと返事がうまくできなかった。もう一回送ってみて。

* 開発者向けにはconsoleまたはログに詳細を出す

---

### 13.4 DBエラー

発生条件

* Supabase保存失敗
* Supabase取得失敗
* RLSによる拒否

対応

* ユーザーには簡単なエラーメッセージを表示する
* 必要に応じて再試行を促す

---

## 14. ローディング表示

### 14.1 チャット送信時

AI返答待ちの間、送信ボタンを無効化する。

チャット欄には以下のような表示を行う。

返信を考え中...

### 14.2 日記生成時

「今日の日記を作成する」ボタンを無効化する。

画面には以下のような表示を行う。

今日の日記を作成中...

---

## 15. MVP実装順序

Codexに実装させる場合、以下の順序で進める。

Step 1: Reactプロジェクト作成

* React環境を作成する
* 基本ルーティングを設定する
* 共通レイアウトを作成する

Step 2: Supabase接続

* Supabaseクライアントを作成する
* .envでSupabase URLとanon keyを管理する
* 接続確認を行う

Step 3: 認証機能

* ログイン画面を作成する
* 新規登録画面を作成する
* ログアウト機能を作成する
* 認証状態によるルート制御を行う

Step 4: DBテーブル作成

* profiles
* diaries
* chat_messages
* meals
* exercises
* tags
* diary_tags
* diary_update_requests

を作成する。

RLSも設定する。

Step 5: チャット画面

* チャットUIを作成する
* メッセージ入力と送信を実装する
* chat_messagesの表示を実装する

Step 6: chat Edge Function

* chat functionを作成する
* OpenAI APIを呼び出す
* AI返答を表示する
* 会話ログを保存する

Step 7: 構造化データ保存

* AI返却JSONからmealsを保存する
* AI返却JSONからexercisesを保存する
* 過去日更新候補をdiary_update_requestsに保存する

Step 8: generate-diary Edge Function

* 今日の日記を作成する機能を作成する
* 会話ログ、食事、運動、更新候補をもとにAIで日記を生成する
* diariesに保存する

Step 9: 日記一覧・詳細

* 日記一覧画面を作成する
* 日記詳細画面を作成する
* 食事・運動データを表示する

Step 10: 編集・削除・検索

* 日記本文を手動編集できるようにする
* 日記削除を実装する
* キーワード検索を実装する

Step 11: 設定画面

* 表示名を編集できるようにする
* 重要プロフィールを編集できるようにする
* 最近の関心ごとを編集できるようにする
* ログアウトできるようにする

Step 12: UI調整

* スマホ表示を調整する
* エラーメッセージを整える
* ローディング表示を整える
* 全体のデザインを統一する

---

## 16. MVP完了条件

MVP完了条件は以下とする。

* ユーザー登録ができる
* ログインができる
* ログアウトができる
* チャット画面でAIと会話できる
* AIが友達のような自然な返答をする
* AIが「日記に残しておくね」などの表現を原則使わない
* 会話ログが保存される
* 食事データが抽出・保存される
* 運動データが抽出・保存される
* 「今日の日記を作成する」ボタンで日記が生成される
* 日記一覧が表示される
* 日記詳細が表示される
* 日記本文を手動編集できる
* 日記を削除できる
* キーワード検索ができる
* OpenAI APIキーがフロントエンドに露出していない
* ユーザーごとにデータが分離されている

---

## 17. 将来拡張

MVP以降、以下を追加候補とする。

* 翌日初回アクセス時の自動日記生成
* 夜間自動日記生成
* PWA対応
* 写真投稿
* スマホアプリ化
* OpenAI Embeddingsによる意味検索
* Supabase pgvectorによるベクトル検索
* 感情グラフ
* 食事グラフ
* 運動グラフ
* 週次レポート
* 月次レポート
* AIによる振り返りコメント
* ユーザーの長期的な記憶機能
