# AGENTS.md

## Project

LifeLog505 is a diary and lifelog web application.

Users chat naturally with an AI like a friend. The app saves chat logs and structured lifelog data such as meals, exercises, moods, and tags.

Diary entries are not generated on every chat message. They are generated through the `generate-diary` flow when the user presses the "今日の日記を作成する" button.

---

## Read First

Before implementation, read these files in order:

1. `docs/requirements.md`
2. `docs/basic-design.md`
3. `docs/detailed-design.md`
4. `docs/codex-instructions.md`

If specifications conflict, follow this priority:

1. `docs/detailed-design.md`
2. `docs/basic-design.md`
3. `docs/requirements.md`
4. `docs/codex-instructions.md`
5. `AGENTS.md`

However, the critical rules below must always be followed.

---

## Critical Rules

- Do not make the AI behave like a diary-writing assistant or record keeper.
- The AI should feel like a friendly conversation partner.
- Do not use phrases such as:
  - 「日記に残しておくね」
  - 「記録しておくね」
  - 「メモしておくね」
  - 「保存しておくね」
- Do not generate diary entries on every chat message.
- Generate diary entries through the `generate-diary` flow.
- Do not expose OpenAI API keys in frontend code.
- Do not expose Supabase service role keys in frontend code.
- Use Supabase Row Level Security so users can access only their own data.
- Do not build future features before the MVP is complete.

---

## Tech Stack

Use the following stack:

- React
- Supabase
- Supabase Auth
- Supabase Database
- Supabase Edge Functions
- OpenAI API

Do not change the stack unless explicitly instructed.

---

## MVP Scope

Implement the MVP described in `docs/codex-instructions.md`.

Do not implement future features unless explicitly requested.

Future features that are out of scope for the MVP include:

- Native mobile app
- PWA
- Push notifications
- Photo upload
- Semantic search
- OpenAI Embeddings
- Supabase pgvector
- Graphs
- Weekly reports
- Monthly reports
- Automatic diary generation

---

## Implementation Notes

- Keep the code simple and readable.
- Prefer small components and clear file names.
- Use Japanese for user-facing UI text.
- Do not over-engineer.
- Prioritize completing the MVP flow before polishing future features.
- 並列処理などが生じた場合、必要に応じてサブエージェントを使用してください。

---

## Validation

Before finishing a task, check the following:

- The app builds successfully.
- Protected routes require login.
- API keys are not exposed in frontend code.
- RLS SQL exists.
- The implementation follows the docs.
- The MVP flow is not broken.
