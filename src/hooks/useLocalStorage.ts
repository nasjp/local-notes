"use client";

import { useCallback, useEffect, useState } from "react";
import type { Note, Store } from "@/types/note";
import { STORAGE_KEY } from "@/types/note";

const sortNotesByUpdatedAt = (data: Note[]) =>
  [...data].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

const isValidDateString = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  return !Number.isNaN(Date.parse(value));
};

const buildContentKey = (title: string, body: string) =>
  `${title.trim()}__${body.trim()}`;

const sanitizeImportedNotes = (
  rawNotes: unknown[],
  existingIds: Set<string> = new Set(),
): Note[] => {
  const seenIds = new Set(existingIds);

  return rawNotes.reduce<Note[]>((acc, raw) => {
    if (!raw || typeof raw !== "object") {
      return acc;
    }

    const candidate = raw as Partial<Note> & Record<string, unknown>;
    const normalizedTitle =
      typeof candidate.title === "string" ? candidate.title.trim() : "";

    if (!normalizedTitle) {
      return acc;
    }

    const normalizedBody =
      typeof candidate.body === "string" ? candidate.body : "";
    const normalizedCreatedAt = isValidDateString(candidate.createdAt)
      ? candidate.createdAt
      : new Date().toISOString();
    const normalizedUpdatedAt = isValidDateString(candidate.updatedAt)
      ? candidate.updatedAt
      : normalizedCreatedAt;

    const baseId =
      typeof candidate.id === "string" && candidate.id.trim()
        ? candidate.id.trim()
        : crypto.randomUUID();
    const uniqueId = seenIds.has(baseId) ? crypto.randomUUID() : baseId;
    seenIds.add(uniqueId);

    acc.push({
      id: uniqueId,
      title: normalizedTitle,
      body: normalizedBody,
      createdAt: normalizedCreatedAt,
      updatedAt: normalizedUpdatedAt,
    });

    return acc;
  }, []);
};

type ImportResult = {
  success: boolean;
  addedCount?: number;
  skippedCount?: number;
  message?: string;
};

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
        setNotes(sortNotesByUpdatedAt(data.notes));
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

      const nextNotes = sortNotesByUpdatedAt([...notes, newNote]);
      if (saveToStorage(nextNotes)) {
        setNotes(nextNotes);
        return newNote;
      }
      return null;
    },
    [notes, saveToStorage],
  );

  // ノートを更新する
  const updateNote = useCallback(
    (id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => {
      const updatedNotes = notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note,
      );
      const nextNotes = sortNotesByUpdatedAt(updatedNotes);

      if (saveToStorage(nextNotes)) {
        setNotes(nextNotes);
        return true;
      }
      return false;
    },
    [notes, saveToStorage],
  );

  // ノートを削除する
  const deleteNote = useCallback(
    (id: string) => {
      const remainingNotes = notes.filter((note) => note.id !== id);
      const nextNotes = sortNotesByUpdatedAt(remainingNotes);

      if (saveToStorage(nextNotes)) {
        setNotes(nextNotes);
        return true;
      }
      return false;
    },
    [notes, saveToStorage],
  );

  const exportNotes = useCallback(() => {
    const store: Store = {
      notes: sortNotesByUpdatedAt(notes),
      version: 1,
    };
    return JSON.stringify(store, null, 2);
  }, [notes]);

  const importNotes = useCallback(
    (payload: string | Store): ImportResult => {
      try {
        const parsed =
          typeof payload === "string" ? JSON.parse(payload) : payload;

        const maybeStore = parsed as Partial<Store>;

        if (
          !parsed ||
          typeof parsed !== "object" ||
          maybeStore.version !== 1 ||
          !Array.isArray(maybeStore.notes)
        ) {
          return { success: false, message: "Invalid file format." };
        }

        const storeNotes = maybeStore.notes as Note[];
        const existingIds = new Set(notes.map((note) => note.id));
        const parsedNotes = sanitizeImportedNotes(storeNotes, existingIds);

        if (parsedNotes.length === 0) {
          return {
            success: false,
            message: "No valid notes found in the file.",
          };
        }

        const existingContentKeys = new Set(
          notes.map((note) => buildContentKey(note.title, note.body)),
        );

        let skippedCount = 0;
        const dedupedNotes = parsedNotes.filter((note) => {
          const key = buildContentKey(note.title, note.body);
          if (existingContentKeys.has(key)) {
            skippedCount += 1;
            return false;
          }
          existingContentKeys.add(key);
          return true;
        });

        if (dedupedNotes.length === 0) {
          return {
            success: true,
            addedCount: 0,
            skippedCount,
            message: "All imported notes already exist.",
          };
        }

        const nextNotes = sortNotesByUpdatedAt([...notes, ...dedupedNotes]);

        if (saveToStorage(nextNotes)) {
          setNotes(nextNotes);
          return {
            success: true,
            addedCount: dedupedNotes.length,
            skippedCount,
          };
        }

        return { success: false, message: "Failed to save imported notes." };
      } catch (err) {
        console.error("Failed to import notes:", err);
        return {
          success: false,
          message: "Failed to parse the selected file.",
        };
      }
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
    exportNotes,
    importNotes,
    reload: loadFromStorage,
  };
}
