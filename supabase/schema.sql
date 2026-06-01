create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists profiles (
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

create table if not exists diaries (
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

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diary_date date not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  target_date date,
  needs_diary_update boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists meals (
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

create table if not exists exercises (
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

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists diary_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diary_id uuid not null references diaries(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(diary_id, tag_id)
);

create table if not exists diary_update_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_date date not null,
  content text not null,
  source_chat_message_id uuid references chat_messages(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_messages_user_date_idx on chat_messages(user_id, diary_date, created_at);
create index if not exists diaries_user_date_idx on diaries(user_id, diary_date desc);
create index if not exists meals_user_date_idx on meals(user_id, diary_date);
create index if not exists exercises_user_date_idx on exercises(user_id, diary_date);
create index if not exists diary_update_requests_user_date_idx on diary_update_requests(user_id, target_date, status);

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at before update on profiles for each row execute function set_updated_at();

drop trigger if exists diaries_set_updated_at on diaries;
create trigger diaries_set_updated_at before update on diaries for each row execute function set_updated_at();

drop trigger if exists meals_set_updated_at on meals;
create trigger meals_set_updated_at before update on meals for each row execute function set_updated_at();

drop trigger if exists exercises_set_updated_at on exercises;
create trigger exercises_set_updated_at before update on exercises for each row execute function set_updated_at();

drop trigger if exists diary_update_requests_set_updated_at on diary_update_requests;
create trigger diary_update_requests_set_updated_at before update on diary_update_requests for each row execute function set_updated_at();
