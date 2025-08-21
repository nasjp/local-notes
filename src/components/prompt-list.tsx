"use client";

import { Copy, FileText, Plus } from "lucide-react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function PromptList() {
  const router = useRouter();
  const { prompts, isLoading, error } = useLocalStorage();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 検索入力のデバウンス処理（200ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchInput]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* タイトル */}
      <h1 className="text-3xl font-bold text-center mb-8">Prompt Storage</h1>

      {/* 検索バーと新規作成ボタン */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="検索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-full px-6 shadow-sm"
          />
        </div>
        <Link href="/new">
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </Link>
      </div>

      {/* カードグリッド */}
      {filteredPrompts.length === 0 ? (
        searchQuery ? (
          <Card className="p-8">
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
