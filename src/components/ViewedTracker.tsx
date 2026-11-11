"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cah_viewed_v1";
const CHANGE_EVENT = "cah-viewed-change";
const MAX_REMEMBERED = 500;

function readViewed(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeViewed(ids: string[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(ids.slice(-MAX_REMEMBERED))
    );
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Browser storage is blocked (e.g. some private modes). Skip quietly.
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// Put this on a detail page. It quietly notes that this entry was opened.
// It shows nothing on screen.
export function MarkViewed({ id }: { id: string }) {
  useSyncExternalStore(
    subscribe,
    () => {
      const ids = readViewed();
      if (!ids.includes(id)) writeViewed([...ids, id]);
      return true;
    },
    () => true
  );
  return null;
}

// Put this on a card. It shows a "Viewed" pill if this entry was opened before.
export function ViewedBadge({ id }: { id: string }) {
  const viewed = useSyncExternalStore(
    subscribe,
    () => readViewed().includes(id),
    () => false
  );

  if (!viewed) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-500 bg-white text-gray-700 font-medium">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      Viewed
    </span>
  );
}