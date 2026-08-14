"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { DeckSelf, DeckChatMessage } from "@/lib/game/deckData";

interface PresenceMeta {
  userId: string;
  nickname: string;
  characterId: string | null;
  appearance: CharacterAppearance;
  joinedAt: string;
}

function extractTrailingMention(value: string): string | null {
  const match = value.match(/(?:^|\s)@([^\s@]*)$/);
  return match ? match[1] : null;
}

export function DeckScreen({ self, initialMessages }: { self: DeckSelf; initialMessages: DeckChatMessage[] }) {
  const [presence, setPresence] = useState<PresenceMeta[]>([]);
  const [messages, setMessages] = useState(initialMessages);
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
        setMessages((prev) =>
          prev.some((m) => m.id === row.id)
            ? prev
            : [
                ...prev,
                {
                  id: row.id,
                  userId: row.user_id,
                  nickname: row.nickname_snapshot,
                  body: row.body,
                  mentions: row.mentions ?? [],
                  createdAt: row.created_at,
                },
              ]
        );
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId,
            nickname: self.nickname,
            characterId: self.characterId,
            appearance: self.appearance,
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

  async function handleSend() {
    const body = input.trim();
    if (!body || !self.userId) return;

    const mentions = onlineOthers.filter((p) => body.includes(`@${p.nickname}`)).map((p) => p.nickname);

    const supabase = createClient();
    await supabase.from("chat_messages").insert({
      user_id: self.userId,
      nickname_snapshot: self.nickname,
      body,
      mentions,
    });
    setInput("");
  }

  function pickMention(nickname: string) {
    setInput((prev) => prev.replace(/(?:^|\s)@([^\s@]*)$/, (m) => `${m.startsWith(" ") ? " " : ""}@${nickname} `));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">갑판 광장</h1>
      </div>

      <div className="relative mx-4 mt-3 h-40 shrink-0 overflow-hidden rounded-[24px] border-2 border-white bg-gradient-to-b from-[#8fd6f7] to-[#5fb8e8]">
        <svg className="absolute inset-x-0 bottom-0 h-12 w-full" viewBox="0 0 400 48" preserveAspectRatio="none">
          <path d="M0 16 Q100 0 200 16 T400 16 V48 H0 Z" fill="#4fb6e6" />
        </svg>
        <div className="absolute left-6 top-5 h-6 w-6 rounded-full border-4 border-white/80" />

        {onlineOthers.length === 0 ? (
          <p className="absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-4 py-1.5 text-[12px] font-bold text-[var(--color-navy)]">
            지금 갑판에는 아무도 없어요
          </p>
        ) : (
          <div className="scrollbar-none absolute bottom-4 left-3 right-3 flex gap-3 overflow-x-auto">
            {onlineOthers.map((p) => (
              <button key={p.userId} onClick={() => setActiveCharacter(p)} className="flex shrink-0 flex-col items-center">
                <CharacterSprite appearance={p.appearance} size={52} />
                <p className="rounded-full bg-white/85 px-2 text-[10px] font-bold text-[var(--color-navy)]">{p.nickname}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeCharacter && (
        <div className="mx-4 mt-2 flex items-center justify-between gap-2 rounded-2xl bg-white p-2.5 shadow-[0_4px_14px_rgba(36,54,90,0.10)]">
          <p className="text-[12px] font-bold text-[var(--color-navy)]">{activeCharacter.nickname}</p>
          <div className="flex gap-1.5">
            {activeCharacter.characterId && (
              <>
                <Link
                  href={`/boarding-pass/${activeCharacter.characterId}`}
                  className="rounded-full bg-[var(--color-sky)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-navy)]"
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
              className="rounded-full bg-[var(--color-mint)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-navy)]"
            >
              태그
            </button>
            <button
              onClick={() => setActiveCharacter(null)}
              className="rounded-full bg-[var(--color-navy)]/10 px-2.5 py-1 text-[10px] font-bold text-[var(--color-navy-soft)]"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-col overflow-hidden rounded-[24px] border-2 border-white bg-white/70 px-4 pt-3">
        <div ref={listRef} className="scrollbar-none h-64 overflow-y-auto pb-2">
          {messages.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-[var(--color-navy-soft)]">아직 대화가 없어요. 먼저 말을 걸어볼까요?</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {messages.map((m) => (
                <li key={m.id} className="text-[12px]">
                  <span className="font-bold text-[var(--color-navy)]">{m.nickname}</span>{" "}
                  <span className="text-[var(--color-navy)]">{m.body}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative shrink-0 border-t border-[var(--color-navy)]/10 py-2">
          {mentionCandidates.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 flex gap-1 rounded-xl bg-white p-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.12)]">
              {mentionCandidates.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => pickMention(c.nickname)}
                  className="rounded-full bg-[var(--color-sky)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-navy)]"
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
              className="flex-1 rounded-full bg-[var(--color-sky)] px-4 py-2.5 text-[13px] outline-none disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={!self.ready || !input.trim()}
              className="rounded-full bg-[var(--color-coral)] px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-40"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
