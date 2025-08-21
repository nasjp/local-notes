"use client";

import { useCallback, useEffect, useState } from "react";
import type { Prompt, Store } from "@/types/prompt";
import { STORAGE_KEY } from "@/types/prompt";

const initialStore: Store = {
  prompts: [],
  version: 1,
};

export function useLocalStorage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージからデータを読み込む
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore));
        setPrompts([]);
      } else {
        const data: Store = JSON.parse(stored);
        setPrompts(
          data.prompts.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
      }
      setError(null);
    } catch (err) {
      console.error("Failed to load from localStorage:", err);
      setError("データの読み込みに失敗しました。");
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ローカルストレージにデータを保存する
  const saveToStorage = useCallback((newPrompts: Prompt[]) => {
    try {
      const store: Store = {
        prompts: newPrompts,
        version: 1,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        setError(
          "ストレージの容量が不足しています。不要なプロンプトを削除してください。",
        );
      } else {
        setError("データの保存に失敗しました。");
      }
      console.error("Failed to save to localStorage:", err);
      return false;
    }
  }, []);

  // プロンプトを追加する
  const addPrompt = useCallback(
    (prompt: Omit<Prompt, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newPrompt: Prompt = {
        ...prompt,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const newPrompts = [...prompts, newPrompt];
      if (saveToStorage(newPrompts)) {
        setPrompts(
          newPrompts.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
        return newPrompt;
      }
      return null;
    },
    [prompts, saveToStorage],
  );

  // プロンプトを更新する
  const updatePrompt = useCallback(
    (id: string, updates: Partial<Omit<Prompt, "id" | "createdAt">>) => {
      const newPrompts = prompts.map((prompt) =>
        prompt.id === id
          ? { ...prompt, ...updates, updatedAt: new Date().toISOString() }
          : prompt,
      );

      if (saveToStorage(newPrompts)) {
        setPrompts(
          newPrompts.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
        return true;
      }
      return false;
    },
    [prompts, saveToStorage],
  );

  // プロンプトを削除する
  const deletePrompt = useCallback(
    (id: string) => {
      const newPrompts = prompts.filter((prompt) => prompt.id !== id);

      if (saveToStorage(newPrompts)) {
        setPrompts(newPrompts);
        return true;
      }
      return false;
    },
    [prompts, saveToStorage],
  );

  // プロンプトをIDで取得する
  const getPromptById = useCallback(
    (id: string) => {
      return prompts.find((prompt) => prompt.id === id);
    },
    [prompts],
  );

  // 初回マウント時にデータを読み込む
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    prompts,
    isLoading,
    error,
    addPrompt,
    updatePrompt,
    deletePrompt,
    getPromptById,
    reload: loadFromStorage,
  };
}
