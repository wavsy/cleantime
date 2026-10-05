"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { findTopic, type Topic } from "@/lib/assistant";
import type { Dictionary } from "@/lib/i18n";

type Message = { from: "bot" | "user"; text: string; call?: boolean };

type Props = {
  t: Dictionary["assistant"];
  topics: Topic[];
  phones: { href: string; label: string }[];
};

const chipOrder = ["services", "stain", "label", "pickup", "locations", "dye"] as const;

export function Assistant({ t, topics, phones }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: t.greeting },
  ]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, typing, open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reply = (userText: string, topic: Topic | undefined) => {
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setTyping(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        topic
          ? { from: "bot", text: topic.answer, call: topic.call }
          : { from: "bot", text: t.fallback, call: true },
      ]);
    }, 550);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    reply(text, findTopic(topics, text));
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className="assistant-panel fixed right-4 bottom-40 z-50 flex h-[min(34rem,calc(100dvh-12rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-foam shadow-2xl shadow-ink/25 sm:bottom-24"
        >
          <div className="flex items-center gap-3 bg-ink px-5 py-4 text-foam">
            <span className="assistant-orb size-9 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="font-semibold">{t.title}</p>
              <p className="truncate text-xs text-foam/70">{t.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="ml-auto grid size-9 place-items-center rounded-full text-xl hover:bg-foam/10"
            >
              ×
            </button>
          </div>

          <div
            ref={listRef}
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto bg-mist p-4"
          >
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.from === "user" ? "justify-end" : ""}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.from === "user"
                      ? "rounded-br-md bg-ink text-foam"
                      : "rounded-bl-md border border-line bg-foam"
                  }`}
                >
                  {message.text.split("\n").map((line, j) => (
                    <p key={j} className={j ? "mt-1.5" : ""}>
                      {line}
                    </p>
                  ))}
                  {message.call && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {phones.map((phone) => (
                        <a
                          key={phone.href}
                          href={phone.href}
                          className="rounded-full bg-aqua px-3 py-1.5 text-xs font-semibold text-ink hover:bg-ink hover:text-foam"
                        >
                          {phone.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <p className="text-xs text-ink-soft" role="status">
                {t.typing}
              </p>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-line px-4 py-3">
            {chipOrder.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  reply(t.chips[id], topics.find((topic) => topic.id === id))
                }
                className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:border-aqua-deep hover:text-aqua-deep"
              >
                {t.chips[id]}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 px-4 pb-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              className="min-w-0 flex-1 rounded-full border border-line bg-mist px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              aria-label={t.send}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-foam hover:bg-aqua-deep"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          <p className="px-5 pb-3 text-[11px] leading-snug text-ink-soft">
            {t.disclaimer}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          // Skip autofocus on touch screens so the keyboard does not cover the chat.
          if (window.matchMedia("(hover: hover)").matches) {
            window.setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        aria-label={open ? t.close : t.open}
        aria-expanded={open}
        className="fixed right-4 bottom-24 z-50 flex items-center gap-2.5 rounded-full bg-ink p-2 font-semibold sm:pr-5 text-foam shadow-xl shadow-ink/30 hover:bg-aqua-deep sm:bottom-6"
      >
        <span className="assistant-orb size-9" aria-hidden />
        <span className="max-sm:sr-only">{t.title}</span>
      </button>
    </>
  );
}
