alter table profiles enable row level security;
alter table diaries enable row level security;
alter table chat_messages enable row level security;
alter table meals enable row level security;
alter table exercises enable row level security;
alter table tags enable row level security;
alter table diary_tags enable row level security;
alter table diary_update_requests enable row level security;

create policy "Users can select own profiles" on profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profiles" on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profiles" on profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own profiles" on profiles for delete using (auth.uid() = user_id);

create policy "Users can select own diaries" on diaries for select using (auth.uid() = user_id);
create policy "Users can insert own diaries" on diaries for insert with check (auth.uid() = user_id);
create policy "Users can update own diaries" on diaries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own diaries" on diaries for delete using (auth.uid() = user_id);

create policy "Users can select own chat messages" on chat_messages for select using (auth.uid() = user_id);
create policy "Users can insert own chat messages" on chat_messages for insert with check (auth.uid() = user_id);
create policy "Users can update own chat messages" on chat_messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own chat messages" on chat_messages for delete using (auth.uid() = user_id);

create policy "Users can select own meals" on meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on meals for insert with check (auth.uid() = user_id);
create policy "Users can update own meals" on meals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own meals" on meals for delete using (auth.uid() = user_id);

create policy "Users can select own exercises" on exercises for select using (auth.uid() = user_id);
create policy "Users can insert own exercises" on exercises for insert with check (auth.uid() = user_id);
create policy "Users can update own exercises" on exercises for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own exercises" on exercises for delete using (auth.uid() = user_id);

create policy "Users can select own tags" on tags for select using (auth.uid() = user_id);
create policy "Users can insert own tags" on tags for insert with check (auth.uid() = user_id);
create policy "Users can update own tags" on tags for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own tags" on tags for delete using (auth.uid() = user_id);

create policy "Users can select own diary tags" on diary_tags for select using (auth.uid() = user_id);
create policy "Users can insert own diary tags" on diary_tags for insert with check (auth.uid() = user_id);
create policy "Users can update own diary tags" on diary_tags for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own diary tags" on diary_tags for delete using (auth.uid() = user_id);

create policy "Users can select own diary update requests" on diary_update_requests for select using (auth.uid() = user_id);
create policy "Users can insert own diary update requests" on diary_update_requests for insert with check (auth.uid() = user_id);
create policy "Users can update own diary update requests" on diary_update_requests for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own diary update requests" on diary_update_requests for delete using (auth.uid() = user_id);
