"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "rocketlaunch_favorite_mission_ids";

let listeners = [];
function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

function subscribe(listener) {
  listeners.push(listener);
  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY) emitChange();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let favorites = [];
  try {
    favorites = JSON.parse(raw);
    if (!Array.isArray(favorites)) favorites = [];
  } catch {
    favorites = [];
  }

  const isFavorite = useCallback(
    (id) => {
      if (!id) return false;
      return favorites.includes(id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (id) => {
      if (!id || typeof window === "undefined") return;
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      emitChange();
    },
    []
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    count: favorites.length,
  };
}
