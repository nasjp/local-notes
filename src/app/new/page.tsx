"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function NewPromptPage() {
  const router = useRouter();
  const { addPrompt } = useLocalStorage();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    setIsSaving(true);

    try {
      const newPrompt = addPrompt({ title: title.trim(), body: body.trim() });

      if (newPrompt) {
        toast.success("プロンプトを保存しました");
        router.push("/");
      } else {
        throw new Error("保存に失敗しました");
      }
    } catch {
      toast.error("保存に失敗しました。再度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* タイトル */}
      <h1 className="text-3xl font-bold text-center mb-8">New Prompt</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor={titleId} className="text-sm font-medium">
            タイトル <span className="text-destructive">*</span>
          </label>
          <Input
            id={titleId}
            type="text"
            placeholder="プロンプトのタイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="rounded-full px-6"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor={bodyId} className="text-sm font-medium">
            プロンプト本文
          </label>
          <Textarea
            id={bodyId}
            placeholder="プロンプトの内容を入力"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="resize-none rounded-2xl px-6 py-4"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving} className="rounded-full">
            {isSaving ? "保存中..." : "保存"}
          </Button>
          <Link href="/">
            <Button type="button" variant="outline" className="rounded-full">
              キャンセル
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
