"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";
import type { DeckSelf, DeckChatMessage } from "@/lib/game/deckData";

interface PresenceMeta {
  userId: string;
  nickname: string;
  characterId: string | null;
  appearance: CharacterAppearance;
  kind: CharacterKind;
  childGender: ChildGender | null;
  childStage: ChildStage | null;
  joinedAt: string;
}

function extractTrailingMention(value: string): string | null {
  const match = value.match(/(?:^|\s)@([^\s@]*)$/);
  return match ? match[1] : null;
}

// 낙관적 전송용 로컬 상태만 추가한 타입 — DB에는 저장되지 않고 이 화면 안에서만 쓴다.
// "sending": 서버 응답 기다리는 중, "failed": 저장 실패(재전송 버튼 표시).
type LocalMessage = DeckChatMessage & { status?: "sending" | "failed" };

// 채팅 입력창(input state)이 DeckScreen 안에 같이 있어서, memo 없이는 한 글자 칠 때마다
// 접속자 목록(CharacterSprite 여러 개)과 전체 메시지 목록이 매번 다시 계산됐다 — 타이핑이
// 버벅이고 메시지가 늦게 올라오는 것처럼 느껴지던 원인. props(onlineOthers/messages)가
// 실제로 안 바뀌면 다시 그리지 않도록 분리한다.
const PresenceStrip = memo(function PresenceStrip({
  onlineOthers,
  onSelect,
}: {
  onlineOthers: PresenceMeta[];
  onSelect: (p: PresenceMeta) => void;
}) {
  if (onlineOthers.length === 0) {
    return (
      <p className="absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-4 py-1.5 text-[13px] font-bold text-[var(--color-navy)]">
        지금 갑판에는 아무도 없어요
      </p>
    );
  }
  return (
    <div className="scrollbar-none absolute bottom-4 left-3 right-3 flex gap-3 overflow-x-auto">
      {onlineOthers.map((p) => (
        <button key={p.userId} onClick={() => onSelect(p)} className="flex shrink-0 flex-col items-center">
          <CharacterSprite appearance={p.appearance} kind={p.kind} childGender={p.childGender} childStage={p.childStage} size={80} />
          <p className="rounded-full bg-white/85 px-2 text-[11px] font-bold text-[var(--color-navy)]">{p.nickname}</p>
        </button>
      ))}
    </div>
  );
});

const MessageList = memo(function MessageList({ messages, onRetry }: { messages: LocalMessage[]; onRetry: (m: LocalMessage) => void }) {
  if (messages.length === 0) {
    return <p className="py-6 text-center text-[13px] text-[var(--color-navy-soft)]">아직 대화가 없어요. 먼저 말을 걸어볼까요?</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {messages.map((m) => (
        <li key={m.id} className="flex items-center gap-1.5 text-[13px]">
          <span className={`flex-1 ${m.status ? "opacity-60" : ""}`}>
            <span className="font-bold text-[var(--color-navy)]">{m.nickname}</span>{" "}
            <span className="text-[var(--color-navy)]">{m.body}</span>
          </span>
          {m.status === "sending" && (
            <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-[var(--color-navy-soft)]/30 border-t-[var(--color-navy-soft)]" />
          )}
          {m.status === "failed" && (
            <button
              onClick={() => onRetry(m)}
              className="shrink-0 rounded-full bg-[var(--color-danger)]/10 px-2 py-0.5 text-[11px] font-bold text-[var(--color-danger)]"
            >
              재전송
            </button>
          )}
        </li>
      ))}
    </ul>
  );
});

export function DeckScreen({ self, initialMessages }: { self: DeckSelf; initialMessages: DeckChatMessage[] }) {
  const [presence, setPresence] = useState<PresenceMeta[]>([]);
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [activeCharacter, setActiveCharacter] = useState<PresenceMeta | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const onlineOthers = useMemo(() => presence.filter((p) => p.userId !== self.userId), [presence, self.userId]);
  const mentionQuery = extractTrailingMention(input);
  const mentionCandidates =
    mentionQuery !== null
      ? onlineOthers.filter((p) => p.nickname.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5)
      : [];

  useEffect(() => {
    if (!self.ready || !self.userId) return;
    const userId = self.userId;

    const supabase = createClient();
    const channel = supabase.channel("deck:main", { config: { presence: { key: userId } } });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceMeta>();
        const flat = Object.values(state)
          .flat()
          .map((meta) => meta as unknown as PresenceMeta);
        setPresence(flat);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const row = payload.new as {
          id: string;
          user_id: string;
          nickname_snapshot: string;
          body: string;
          mentions: string[] | null;
          created_at: string;
        };
        setMessages((prev) => {
          // 낙관적으로 이미 화면에 떠 있는 내 메시지(같은 id로 미리 넣어둔 것)가 실시간
          // 구독으로 다시 들어온 경우 — 새로 추가하지 않고 "전송 중" 상태만 지워서 중복
          // 렌더링을 막는다.
          const existingIdx = prev.findIndex((m) => m.id === row.id);
          if (existingIdx !== -1) {
            if (!prev[existingIdx].status) return prev;
            const next = [...prev];
            next[existingIdx] = { ...next[existingIdx], status: undefined };
            return next;
          }
          return [
            ...prev,
            {
              id: row.id,
              userId: row.user_id,
              nickname: row.nickname_snapshot,
              body: row.body,
              mentions: row.mentions ?? [],
              createdAt: row.created_at,
            },
          ];
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId,
            nickname: self.nickname,
            characterId: self.characterId,
            appearance: self.appearance,
            kind: self.kind,
            childGender: self.childGender,
            childStage: self.childStage,
            joinedAt: new Date().toISOString(),
          } satisfies PresenceMeta);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [self.ready, self.userId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  // 전송 버튼을 누르면 서버 응답을 기다리지 않고 즉시 입력창을 비우고 채팅창에 메시지를
  // 보여준다(낙관적 UI). id를 클라이언트에서 미리 만들어(chat_messages.id는 uuid 컬럼이라
  // insert 시 직접 지정 가능) 저장에 성공하면 실시간 구독으로 돌아오는 같은 id의 INSERT
  // 이벤트가 자연스럽게 "전송 중" 표시만 지우고(위 useEffect), 실패하면 그 메시지에만
  // "재전송" 상태를 표시한다.
  const sendMessage = useCallback(async (tempId: string, body: string, mentions: string[]) => {
    if (!self.userId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("chat_messages")
      .insert({ id: tempId, user_id: self.userId, nickname_snapshot: self.nickname, body, mentions });
    if (error) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)));
    }
  }, [self.userId, self.nickname]);

  function handleSend() {
    const body = input.trim();
    if (!body || !self.userId) return;

    const mentions = onlineOthers.filter((p) => body.includes(`@${p.nickname}`)).map((p) => p.nickname);
    const tempId = crypto.randomUUID();

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: tempId, userId: self.userId!, nickname: self.nickname, body, mentions, createdAt: new Date().toISOString(), status: "sending" },
    ]);
    void sendMessage(tempId, body, mentions);
  }

  const retrySend = useCallback(
    (m: LocalMessage) => {
      setMessages((prev) => prev.map((msg) => (msg.id === m.id ? { ...msg, status: "sending" } : msg)));
      void sendMessage(m.id, m.body, m.mentions);
    },
    [sendMessage]
  );

  function pickMention(nickname: string) {
    setInput((prev) => prev.replace(/(?:^|\s)@([^\s@]*)$/, (m) => `${m.startsWith(" ") ? " " : ""}@${nickname} `));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">갑판 광장</h1>
      </div>

      <div className="relative mx-4 mt-3 h-44 shrink-0 overflow-hidden rounded-[24px] border-2 border-white shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
        <Image src="/images/backgrounds/deck.jpg" alt="" fill unoptimized style={{ objectFit: "cover" }} />

        <PresenceStrip onlineOthers={onlineOthers} onSelect={setActiveCharacter} />
      </div>

      {activeCharacter && (
        <div className="mx-4 mt-2 flex items-center justify-between gap-2 rounded-2xl bg-white p-2.5 shadow-[0_4px_14px_rgba(36,54,90,0.10)]">
          <p className="text-[13px] font-bold text-[var(--color-navy)]">{activeCharacter.nickname}</p>
          <div className="flex gap-1.5">
            {activeCharacter.characterId && (
              <>
                <Link
                  href={`/boarding-pass/${activeCharacter.characterId}`}
                  className="rounded-full bg-[var(--color-sky)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-navy)]"
                >
                  승선확인증
                </Link>
              </>
            )}
            <button
              onClick={() => {
                setInput((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}@${activeCharacter.nickname} `);
                setActiveCharacter(null);
              }}
              className="rounded-full bg-[var(--color-mint)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-navy)]"
            >
              태그
            </button>
            <button
              onClick={() => setActiveCharacter(null)}
              className="rounded-full bg-[var(--color-navy)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--color-navy-soft)]"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-col overflow-hidden rounded-[24px] border-2 border-white bg-white/70 px-4 pt-3">
        <div ref={listRef} className="scrollbar-none h-64 overflow-y-auto pb-2">
          <MessageList messages={messages} onRetry={retrySend} />
        </div>

        <div className="relative shrink-0 border-t border-[var(--color-navy)]/10 py-2">
          {mentionCandidates.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 flex gap-1 rounded-xl bg-white p-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.12)]">
              {mentionCandidates.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => pickMention(c.nickname)}
                  className="rounded-full bg-[var(--color-sky)] px-2.5 py-1 text-[12px] font-bold text-[var(--color-navy)]"
                >
                  @{c.nickname}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={!self.ready}
              placeholder={self.ready ? "메시지를 입력해보세요" : "로그인 후 대화할 수 있어요"}
              className="flex-1 rounded-full bg-[var(--color-sky)] px-4 py-2.5 text-[14px] outline-none disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={!self.ready || !input.trim()}
              className="rounded-full bg-[var(--color-coral)] px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-40"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
