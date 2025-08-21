"use client";

import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getPromptById, updatePrompt, deletePrompt, isLoading } =
    useLocalStorage();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  const promptId = params.id as string;
  const prompt = getPromptById(promptId);

  useEffect(() => {
    // データ読み込みが完了してからプロンプトの存在を確認
    if (!isLoading) {
      if (prompt) {
        setTitle(prompt.title);
        setBody(prompt.body);
      } else {
        // プロンプトが見つからない場合は一覧に戻る
        toast.error("プロンプトが見つかりません");
        router.push("/");
      }
    }
  }, [prompt, router, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    setIsSaving(true);

    try {
      const success = updatePrompt(promptId, {
        title: title.trim(),
        body: body.trim(),
      });

      if (success) {
        toast.success("プロンプトを更新しました");
        router.push("/");
      } else {
        throw new Error("更新に失敗しました");
      }
    } catch {
      toast.error("更新に失敗しました。再度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const success = deletePrompt(promptId);

      if (success) {
        toast.success("プロンプトを削除しました");
        router.push("/");
      } else {
        throw new Error("削除に失敗しました");
      }
    } catch {
      toast.error("削除に失敗しました。再度お試しください。");
      setIsDeleting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      toast.success("プロンプトをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  // ローディング中または プロンプトが見つからない場合
  if (isLoading || !prompt) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          削除
        </Button>
      </div>

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
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor={bodyId} className="text-sm font-medium">
              プロンプト本文
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!body.trim()}
            >
              <Copy className="w-4 h-4 mr-2" />
              コピー
            </Button>
          </div>
          <Textarea
            id={bodyId}
            placeholder="プロンプトの内容を入力"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
          <Link href="/">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
        </div>
      </form>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>プロンプトの削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{prompt.title}」を削除してもよろしいですか？
              この操作は取り消すことができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "削除中..." : "削除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
