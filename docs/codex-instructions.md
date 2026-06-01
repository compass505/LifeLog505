# LifeLog505 Codex実装指示書 第1版

## 1. この指示書の目的

このドキュメントは、LifeLog505のMVPをCodexで実装するための指示書である。

Codexは、以下の設計書を前提に実装を進めること。

* docs/requirements.md
* docs/basic-design.md
* docs/detailed-design.md

本指示書では、実装の進め方、優先順位、守るべき仕様、作成するファイル、注意点をまとめる。

---

## 2. アプリ概要

LifeLog505は、ユーザーがAIと友達のように自然に会話することで、日々の出来事、感情、食事、運動などを記録できる日記・ライフログWebアプリである。

ユーザーは「日記を書く」ことを強く意識せず、AIと話しているだけで会話ログが保存される。

日記本文はチャットのたびに作成せず、ユーザーが「今日の日記を作成する」ボタンを押したタイミングで、その日の会話ログや食事・運動データをもとに生成する。

---

## 3. 技術スタック

MVPでは以下を使用する。

React
Supabase
Supabase Auth
Supabase Database
Supabase Edge Functions
OpenAI API

フロントエンドはReactで実装する。

認証・DBはSupabaseを利用する。

OpenAI APIはフロントエンドから直接呼び出さず、必ずSupabase Edge Functionsを経由する。

---

## 4. 最重要方針

### 4.1 AIチャット体験

AIは日記作成担当ではなく、友達のような話し相手として振る舞う。

AIの返答では、以下のような表現を原則使用しない。

日記に残しておくね
記録しておくね
メモしておくね
保存しておくね

チャット体験では、ユーザーが「記録されている」と強く意識しないようにする。

---

### 4.2 日記生成方針

日記本文はチャットのたびに生成しない。

チャット時は以下を行う。

* ユーザー発言の保存
* AI返答の保存
* 必要に応じた食事データ保存
* 必要に応じた運動データ保存
* 必要に応じた過去日更新候補保存

日記本文は、generate-diary Edge Functionで生成する。

MVPでは、チャット画面の「今日の日記を作成する」ボタンで日記生成を行う。

---

### 4.3 セキュリティ

OpenAI APIキーをフロントエンドに置いてはいけない。

.env に置く値は、フロントエンド用とサーバー用を分ける。

Supabase RLSを設定し、ログインユーザーは自分のデータだけ操作できるようにする。

---

## 5. 実装対象

MVPで実装する機能は以下である。

* ユーザー登録
* ログイン
* ログアウト
* 認証状態による画面制御
* チャット画面
* AIチャット返答
* 会話ログ保存
* 食事データ保存
* 運動データ保存
* 過去日更新候補保存
* 今日の日記作成
* 日記一覧
* 日記詳細
* 日記本文の手動編集
* 日記削除
* キーワード検索
* 設定画面
* ユーザープロフィール編集

---

## 6. 実装しないもの

MVPでは以下は実装しない。

* スマホアプリ化
* PWA対応
* 写真投稿
* プッシュ通知
* OpenAI Embeddings
* Supabase pgvector
* 意味検索
* 感情グラフ
* 食事グラフ
* 運動グラフ
* 週次レポート
* 月次レポート
* 自動日記生成

---

## 7. 推奨ディレクトリ構成

以下の構成を基本とする。

```text
lifelog505/
├── docs/
│   ├── requirements.md
│   ├── basic-design.md
│   ├── detailed-design.md
│   └── codex-instructions.md
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── diary/
│   │   ├── logs/
│   │   └── search/
│   ├── pages/
│   ├── lib/
│   ├── routes/
│   ├── styles/
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

## 8. 実装順序

Codexは以下の順番で実装を進めること。

---

### Step 1: Reactプロジェクト作成

Reactアプリを作成する。

可能であればViteを使用する。

実装内容:

* React環境作成
* src 配下の基本構成作成
* ルーティング準備
* 共通CSS作成
* 最低限の画面表示確認

完了条件:

* npm install が成功する
* npm run dev でアプリが起動する
* ブラウザで初期画面が表示される

---

### Step 2: Supabase接続

Supabaseクライアントを作成する。

作成対象:

src/lib/supabaseClient.js

環境変数例:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

.env.example も作成すること。

完了条件:

* Supabaseクライアントが作成されている
* フロントエンドからSupabaseを利用する準備ができている
* APIキーなどの実値はコミットしない

---

### Step 3: ルーティング実装

React Routerを使ってルーティングを実装する。

対象ルート:

/login
/signup
/chat
/diaries
/diaries/:id
/search
/settings

認証が必要なルート:

/chat
/diaries
/diaries/:id
/search
/settings

未ログインの場合は /login に遷移する。

ログイン済みで /login または /signup にアクセスした場合は /chat に遷移する。

---

### Step 4: 認証機能

Supabase Authを使って以下を実装する。

* 新規登録
* ログイン
* ログアウト
* 認証状態の監視
* 認証状態による画面制御

作成対象例:

src/lib/auth.js
src/pages/LoginPage.jsx
src/pages/SignupPage.jsx
src/components/auth/LoginForm.jsx
src/components/auth/SignupForm.jsx

新規登録時には、可能であれば profiles に初期プロフィールを作成する。

---

### Step 5: DBテーブル作成SQL

Supabase SQL Editorで実行できるSQLを作成する。

保存場所:

supabase/schema.sql

作成するテーブル:

* profiles
* diaries
* chat_messages
* meals
* exercises
* tags
* diary_tags
* diary_update_requests

詳細は docs/detailed-design.md の「Supabaseテーブル詳細設計」に従うこと。

注意:

docs/detailed-design.md のRLS例に誤字がある場合は修正すること。

正しい形は以下。

```sql
using (auth.uid() = user_id);
```

---

### Step 6: RLSポリシー作成

Supabase RLSを設定するSQLを作成する。

保存場所:

supabase/rls.sql

基本方針:

* ログイン中ユーザーは自分のデータのみselect可能
* ログイン中ユーザーは自分のデータのみinsert可能
* ログイン中ユーザーは自分のデータのみupdate可能
* ログイン中ユーザーは自分のデータのみdelete可能

対象テーブル:

* profiles
* diaries
* chat_messages
* meals
* exercises
* tags
* diary_update_requests

diary_tags については、MVPでは実装を簡単にするため user_id を追加してもよい。

その場合、schema.sql もそれに合わせて調整すること。

---

### Step 7: 共通UI

共通コンポーネントを作成する。

作成対象:

src/components/common/Header.jsx
src/components/common/Loading.jsx
src/components/common/ErrorMessage.jsx
src/styles/global.css

Headerには以下のリンクを表示する。

* LifeLog505
* チャット
* 日記一覧
* 検索
* 設定

---

### Step 8: チャット画面

チャット画面を実装する。

作成対象:

src/pages/ChatPage.jsx
src/components/chat/ChatWindow.jsx
src/components/chat/ChatMessage.jsx
src/components/chat/ChatInput.jsx
src/components/chat/GenerateDiaryButton.jsx
src/lib/chat.js

表示内容:

* チャット履歴
* 入力欄
* 送信ボタン
* 今日の日記を作成するボタン

チャット送信時の処理:

1. 入力欄が空なら送信しない
2. 入力内容を chat Edge Functionに送信する
3. AI返答を受け取る
4. チャット履歴を更新する
5. ローディング状態を解除する

---

### Step 9: chat Edge Function

Supabase Edge Function chat を実装する。

作成対象:

supabase/functions/chat/index.ts

リクエスト形式:

```json
{
  "message": "今日研修で結構疲れた",
  "client_date": "2026-06-01"
}
```

レスポンス形式:

```json
{
  "reply": "おつかれ！研修って座ってるだけでも意外と体力持っていかれるよね。今日は頭も体もけっこう使った感じ？"
}
```

処理内容:

1. Authorizationヘッダーからログインユーザーを取得する
2. messageとclient_dateを取得する
3. profilesを取得する
4. 直近のchat_messagesを取得する
5. OpenAI APIを呼び出す
6. JSON形式で返答を受け取る
7. ユーザー発言をchat_messagesに保存する
8. AI返答をchat_messagesに保存する
9. mealsがあれば保存する
10. exercisesがあれば保存する
11. diary_update_requestがあれば保存する
12. replyを返す

---

### Step 10: chat用AIプロンプト

chat Edge Function内で、OpenAI APIに渡すシステムプロンプトを実装する。

重要方針:

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

AIの返却JSON:

```json
{
  "reply": "string",
  "target_date": "YYYY-MM-DD or null",
  "needs_diary_update": true,
  "mood": "string or null",
  "tags": ["string"],
  "meals": [],
  "exercises": [],
  "diary_update_request": null
}
```

---

### Step 11: 日記生成機能

generate-diary Edge Functionを実装する。

作成対象:

supabase/functions/generate-diary/index.ts

リクエスト形式:

```json
{
  "target_date": "2026-06-01"
}
```

処理内容:

1. Authorizationヘッダーからログインユーザーを取得する
2. target_dateを取得する
3. 対象日付のchat_messagesを取得する
4. 対象日付のmealsを取得する
5. 対象日付のexercisesを取得する
6. 対象日付のpending状態のdiary_update_requestsを取得する
7. 既存のdiariesを取得する
8. OpenAI APIで日記本文を生成する
9. diariesにupsertする
10. tagsを保存または取得する
11. diary_tagsを保存する
12. 反映したdiary_update_requestsをappliedに更新する
13. 生成した日記を返す

---

### Step 12: 日記生成用AIプロンプト

generate-diary Edge Function内で、OpenAI APIに渡すプロンプトを実装する。

重要方針:

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

AIの返却JSON:

```json
{
  "title": "string",
  "body": "string",
  "mood": "string",
  "summary": "string",
  "tags": ["string"]
}
```

---

### Step 13: 今日の日記を作成するボタン

チャット画面にある「今日の日記を作成する」ボタンから、generate-diary Edge Functionを呼び出す。

処理:

1. 今日の日付を取得する
2. generate-diary にtarget_dateを送る
3. 生成中はボタンを無効化する
4. 成功時は日記詳細画面へ遷移する
5. 失敗時はエラーメッセージを表示する

---

### Step 14: 日記一覧・詳細

日記一覧画面と日記詳細画面を実装する。

作成対象:

src/pages/DiaryListPage.jsx
src/pages/DiaryDetailPage.jsx
src/components/diary/DiaryCard.jsx
src/components/diary/DiaryList.jsx
src/components/diary/DiaryDetail.jsx
src/components/diary/DiaryEditor.jsx
src/lib/diaries.js

日記一覧:

* diariesをdiary_date降順で取得する
* タイトル、日付、本文プレビュー、感情を表示する

日記詳細:

* diary idからdiaryを取得する
* 同じdiary_dateのmealsを取得する
* 同じdiary_dateのexercisesを取得する
* タグを表示する
* 本文を手動編集できる
* 日記を削除できる

---

### Step 15: 検索機能

検索画面を実装する。

作成対象:

src/pages/SearchPage.jsx
src/components/search/SearchForm.jsx

検索対象:

* diaries.title
* diaries.body
* diaries.summary
* tags.name

MVPでは部分一致検索でよい。

検索結果から日記詳細画面へ遷移できるようにする。

---

### Step 16: 設定画面

設定画面を実装する。

作成対象:

src/pages/SettingsPage.jsx
src/lib/profiles.js

編集項目:

* 表示名
* AIの口調設定
* 重要プロフィール
* 最近の関心ごと

ログアウトボタンも配置する。

---

### Step 17: UI調整

MVPとして使いやすいように最低限のデザインを整える。

方針:

* スマホ幅でも使いやすい
* チャット画面を見やすくする
* userメッセージとassistantメッセージを見分けやすくする
* 日記カードを読みやすくする
* エラー表示を分かりやすくする
* ローディング表示を入れる

凝ったデザインは不要。

まずは実用性を優先する。

---

## 18. エラー処理

最低限、以下を実装する。

* 未ログイン時はログイン画面へ
* チャット送信が空なら送信しない
* AI APIエラー時は自然なメッセージを表示
* DBエラー時はエラーメッセージを表示
* 日記生成失敗時は再実行できるようにする

AI APIエラー時の表示例:

ごめん、今ちょっと返事がうまくできなかった。もう一回送ってみて。

---

## 19. 環境変数

.env.example に以下を用意する。

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

注意:

* VITE_ から始まるものはフロントエンドで利用される
* OPENAI_API_KEY はフロントエンドで使ってはいけない
* SUPABASE_SERVICE_ROLE_KEY もフロントエンドで使ってはいけない
* 実際の .env はGit管理しない

---

## 20. READMEに書くこと

README.md に以下を記載する。

* アプリ名
* 概要
* 技術スタック
* セットアップ手順
* 環境変数
* Supabase SQLの実行方法
* Supabase Edge Functionsのデプロイ方法
* 開発サーバー起動方法
* MVP機能一覧

---

## 21. MVP完了条件

以下を満たしたらMVP完了とする。

* ユーザー登録できる
* ログインできる
* ログアウトできる
* チャット画面でAIと会話できる
* AIが友達のような自然な返答をする
* AIが禁止表現を原則使わない
* 会話ログが保存される
* 食事データが保存される
* 運動データが保存される
* 過去日更新候補が保存される
* 「今日の日記を作成する」ボタンで日記が生成される
* 日記一覧が表示される
* 日記詳細が表示される
* 日記本文を編集できる
* 日記を削除できる
* キーワード検索できる
* 設定画面でプロフィールを編集できる
* OpenAI APIキーがフロントエンドに露出していない
* ユーザーごとにデータが分離されている

---

## 22. 実装時の注意

Codexは、実装中に仕様が曖昧な場合、以下の優先順位で判断する。

1. docs/detailed-design.md
2. docs/basic-design.md
3. docs/requirements.md
4. docs/codex-instructions.md

ただし、本指示書の「最重要方針」は必ず守ること。

特に以下は厳守する。

* AIを記録係のように見せない
* チャット中に日記本文を毎回生成しない
* OpenAI APIキーをフロントエンドに置かない
* RLSでユーザーごとのデータ分離を行う
* まずはMVP完成を優先し、将来拡張を作り込みすぎない
