grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table profiles to authenticated;
grant select, insert, update, delete on table diaries to authenticated;
grant select, insert, update, delete on table chat_messages to authenticated;
grant select, insert, update, delete on table meals to authenticated;
grant select, insert, update, delete on table exercises to authenticated;
grant select, insert, update, delete on table tags to authenticated;
grant select, insert, update, delete on table diary_tags to authenticated;
grant select, insert, update, delete on table diary_update_requests to authenticated;

grant select on table diaries to anon;
