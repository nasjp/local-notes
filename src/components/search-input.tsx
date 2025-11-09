"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useSearchContext } from "@/contexts/search-context";
import { consumeSkipHomeFocusFlag } from "@/lib/scroll-position";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useSearchContext();
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isHome = useMemo(() => pathname === "/", [pathname]);

  // Debounce search input (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchInput);
    }, 200);

    return () => clearTimeout(timer);
  }, [localSearchInput, setSearchQuery]);

  // 初期表示時（ホームのみ）に自動フォーカス
  useEffect(() => {
    if (!isHome) return;
    if (consumeSkipHomeFocusFlag()) return;
    // 少し遅らせてレイアウト確定後にフォーカス
    const t = setTimeout(() => {
      inputRef.current?.focus();
      // 末尾にキャレットを移動
      const len = inputRef.current?.value?.length ?? 0;
      inputRef.current?.setSelectionRange?.(len, len);
    }, 0);
    return () => clearTimeout(t);
  }, [isHome]);

  // ホームではグローバルなキー入力を受け付けて検索に反映
  useEffect(() => {
    if (!isHome) return;

    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select")
        return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // 既に入力系にフォーカスがある場合は何もしない
      if (isEditable(e.target)) return;
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // IME合成中は無視
      if (e.isComposing) return;

      const key = e.key;

      // 受け付けるキー: 単一文字, Space, Backspace
      const isChar = key.length === 1;
      const isSpace = key === " ";
      const isBackspace = key === "Backspace";

      if (!isChar && !isSpace && !isBackspace) return;

      // 検索入力へフォーカス
      inputRef.current?.focus();

      // 最初のキーも失わないように反映
      e.preventDefault();
      if (isBackspace) {
        setLocalSearchInput((prev) => prev.slice(0, -1));
      } else {
        setLocalSearchInput((prev) => prev + key);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isHome]);

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder="Search..."
      value={localSearchInput}
      onChange={(e) => setLocalSearchInput(e.target.value)}
      className="w-full rounded-full px-6 shadow-sm"
      inputMode="search"
    />
  );
}
