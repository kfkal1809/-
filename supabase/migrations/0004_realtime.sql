-- 갑판 실시간 채팅(3.20 / FR-DECK-002)이 동작하려면 chat_messages가 Realtime
-- publication에 포함되어야 postgres_changes INSERT 이벤트가 클라이언트로 전달된다.
alter publication supabase_realtime add table public.chat_messages;
