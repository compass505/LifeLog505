# LifeLog505

LifeLog505は、AIと友達のように会話しながら日々の出来事、感情、食事、運動を残していく日記・ライフログWebアプリです。日記本文はチャットごとには作らず、チャット画面の「今日の日記を作成する」ボタンから生成します。

## 技術スタック

- React
- Vite
- React Router
- Supabase Auth
- Supabase Database
- Supabase Edge Functions
- OpenAI API

## セットアップ

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` にはローカル開発用の値を設定してください。`VITE_`で始まる値だけがフロントエンドで利用されます。

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
```

## Supabase

Supabase SQL Editorで以下を順番に実行します。

1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/grants.sql`

Edge Functions用の環境変数をSupabase側に設定します。

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=...
```

必要に応じて`OPENAI_MODEL`も設定できます。未設定時はEdge Function側で`gpt-4o-mini`を使います。

Edge Functionsをデプロイします。

```bash
supabase functions deploy chat
supabase functions deploy generate-diary
```

## MVP機能

- ユーザー登録、ログイン、ログアウト
- 認証済みルートの保護
- AIチャット
- 会話ログ保存
- 食事・運動データ保存
- 今日の日記生成
- 日記一覧、日記詳細
- 日記本文の編集、削除
- キーワード検索
- プロフィール設定

## セキュリティ

OpenAI APIキーとSupabase service role keyはフロントエンドに置きません。フロントエンドでは`VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`のみを使い、AI呼び出しはSupabase Edge Functions経由で実行します。
