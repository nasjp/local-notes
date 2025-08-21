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

export function PromptGrid() {
  const router = useRouter();
  const { prompts, isLoading, error } = useLocalStorage();
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
  const filteredPrompts = useMemo(() => {
    if (!searchQuery.trim()) return prompts;

    const query = searchQuery.toLowerCase();
    return prompts.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.body.toLowerCase().includes(query),
    );
  }, [prompts, searchQuery]);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("プロンプトをコピーしました");
      })
      .catch(() => {
        toast.error("コピーに失敗しました");
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
      {filteredPrompts.length === 0 ? (
        searchQuery ? (
          <Card className="p-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <FileText className="w-12 h-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">検索結果が見つかりません</p>
                <p className="text-sm text-muted-foreground">
                  別の検索キーワードを試してください
                </p>
              </div>
            </div>
          </Card>
        ) : null
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="h-full hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => router.push(`/p/${prompt.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="line-clamp-1 text-lg flex-1">
                    {prompt.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 rounded-full"
                    onClick={(e) => handleCopy(e, prompt.body)}
                    disabled={!prompt.body}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  {new Date(prompt.updatedAt).toLocaleDateString("ja-JP", {
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
                  {prompt.body || "（本文なし）"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
