import { useSyncExternalStore } from 'react';

const QUOTA_KEY = 'fate-ai-quota-until';

type Listener = () => void;

const listeners = new Set<Listener>();
let timer: number | null = null;

function read(): number | null {
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    const value = raw ? Number(raw) : 0;
    if (Number.isFinite(value) && value > Date.now()) return value;
    if (raw) localStorage.removeItem(QUOTA_KEY);
  } catch {
    /* приватный режим */
  }
  return null;
}

let current = read();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function stopTimer(): void {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

function ensureTimer(): void {
  if (timer !== null) return;
  timer = window.setInterval(() => {
    if (current !== null && current <= Date.now()) setQuotaUntil(null);
  }, 30_000);
}

export function getQuotaUntil(): number | null {
  if (current !== null && current <= Date.now()) {
    current = null;
    try {
      localStorage.removeItem(QUOTA_KEY);
    } catch {
      /* приватный режим */
    }
  }
  return current;
}

export function setQuotaUntil(value: number | null): void {
  current = value;
  try {
    if (value) localStorage.setItem(QUOTA_KEY, String(value));
    else localStorage.removeItem(QUOTA_KEY);
  } catch {
    /* приватный режим */
  }
  if (value) ensureTimer();
  else stopTimer();
  emit();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (current !== null) ensureTimer();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopTimer();
  };
}

export function useQuotaUntil(): number | null {
  return useSyncExternalStore(subscribe, getQuotaUntil, getQuotaUntil);
}

export function formatQuotaReset(until: number): string {
  const date = new Date(until);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);
  if (date.toDateString() === now.toDateString()) return `сегодня в ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `завтра в ${time}`;
  const day = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
  return `${day} в ${time}`;
}
