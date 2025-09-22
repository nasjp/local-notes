"use client";

import { Copy, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchContext } from "@/contexts/search-context";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function NoteGrid() {
  const router = useRouter();
  const { notes, isLoading, error } = useLocalStorage();
  const { searchQuery } = useSearchContext();
  const [isVisible, setIsVisible] = useState(false);

  // フェードインアニメーション用のトリガー
  useEffect(() => {
    if (!isLoading) {
      // 少し遅延を入れてアニメーション効果を高める
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // 検索フィルタリング（部分一致、大文字小文字区別なし）
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;

    const normalizeForSearch = (value: string) =>
      value.normalize("NFKC").toLowerCase();

    const query = normalizeForSearch(searchQuery);
    return notes.filter((note) => {
      const normalizedTitle = normalizeForSearch(note.title);
      const normalizedBody = normalizeForSearch(note.body);
      return normalizedTitle.includes(query) || normalizedBody.includes(query);
    });
  }, [notes, searchQuery]);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Note copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  // エラー表示
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  // ローディング中は何も表示しない（フェードイン前の状態）
  if (isLoading) {
    return null;
  }

  return (
    <div
      className={`
        transition-opacity duration-500 ease-in-out
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
    >
      {/* カードグリッド */}
      {filteredNotes.length === 0 ? (
        searchQuery ? (
          <Card className="p-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <FileText className="w-12 h-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">No search results found</p>
                <p className="text-sm text-muted-foreground">
                  Try a different search keyword
                </p>
              </div>
            </div>
          </Card>
        ) : null
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="h-full hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => router.push(`/p/${note.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="line-clamp-1 text-lg flex-1">
                    {note.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 rounded-full"
                    onClick={(e) => handleCopy(e, note.body)}
                    disabled={!note.body}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  {new Date(note.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.body || "(No content)"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
