"use client";

import { useCallback, useEffect, useState } from "react";
import type { Note, Store } from "@/types/note";
import { STORAGE_KEY } from "@/types/note";

const initialStore: Store = {
  notes: [],
  version: 1,
};

export function useLocalStorage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージからデータを読み込む
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore));
        setNotes([]);
      } else {
        const data: Store = JSON.parse(stored);
        setNotes(
          data.notes.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
      }
      setError(null);
    } catch (err) {
      console.error("Failed to load from localStorage:", err);
      setError("Failed to load data.");
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ローカルストレージにデータを保存する
  const saveToStorage = useCallback((newNotes: Note[]) => {
    try {
      const store: Store = {
        notes: newNotes,
        version: 1,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      setError(null);
      // カスタムイベントを発火（同じタブ内での更新を通知）
      window.dispatchEvent(new Event("local-storage-update"));
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        setError("Storage quota exceeded. Please delete unnecessary notes.");
      } else {
        setError("Failed to save data.");
      }
      console.error("Failed to save to localStorage:", err);
      return false;
    }
  }, []);

  // ノートを追加する
  const addNote = useCallback(
    (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newNote: Note = {
        ...note,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const newNotes = [...notes, newNote];
      if (saveToStorage(newNotes)) {
        setNotes(
          newNotes.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
        return newNote;
      }
      return null;
    },
    [notes, saveToStorage],
  );

  // ノートを更新する
  const updateNote = useCallback(
    (id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => {
      const newNotes = notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note,
      );

      if (saveToStorage(newNotes)) {
        setNotes(
          newNotes.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
        return true;
      }
      return false;
    },
    [notes, saveToStorage],
  );

  // ノートを削除する
  const deleteNote = useCallback(
    (id: string) => {
      const newNotes = notes.filter((note) => note.id !== id);

      if (saveToStorage(newNotes)) {
        setNotes(newNotes);
        return true;
      }
      return false;
    },
    [notes, saveToStorage],
  );

  // ノートをIDで取得する
  const getNoteById = useCallback(
    (id: string) => {
      return notes.find((note) => note.id === id);
    },
    [notes],
  );

  // 初回マウント時にデータを読み込む & ストレージの変更を監視
  useEffect(() => {
    loadFromStorage();

    // ストレージイベントをリッスン（他のタブ/ウィンドウでの変更を検知）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadFromStorage();
      }
    };

    // カスタムイベントをリッスン（同じタブ内での変更を検知）
    const handleLocalChange = () => {
      loadFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage-update", handleLocalChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage-update", handleLocalChange);
    };
  }, [loadFromStorage]);

  return {
    notes,
    isLoading,
    error,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    reload: loadFromStorage,
  };
}
