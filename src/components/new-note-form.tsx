"use client";

import { Copy } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface NewNoteFormProps {
  onClose?: () => void;
  onSave?: () => void;
  onBeforeClose?: (handler: (callback: () => void) => void) => void;
}

export function NewNoteForm({
  onClose,
  onSave,
  onBeforeClose,
}: NewNoteFormProps) {
  const { addNote } = useLocalStorage();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const titleId = useId();
  const bodyId = useId();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      toast.success("Note copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // コンテンツがあるかチェック
  const hasContent = useCallback(() => {
    return title.trim() !== "" || body.trim() !== "";
  }, [title, body]);

  // onBeforeCloseの登録
  useEffect(() => {
    if (!onBeforeClose) return;

    const handleBeforeClose = (callback: () => void) => {
      // コンテンツがない場合は即座にコールバックを実行
      if (!hasContent()) {
        callback();
        return;
      }

      // タイトルが空の場合はバリデーションエラー
      if (!title.trim()) {
        toast.error("Please enter a title before closing");
        return;
      }

      // 保存を実行
      const newNote = addNote({ title: title.trim(), body: body.trim() });

      if (newNote) {
        toast.success("Note saved successfully");
        // 少し遅延を入れてから閉じる
        setTimeout(callback, 100);
      } else {
        toast.error("Failed to save. Please try again.");
      }
    };

    onBeforeClose(handleBeforeClose);
  }, [onBeforeClose, hasContent, title, body, addNote]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">New Note</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor={titleId} className="text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            id={titleId}
            type="text"
            placeholder="Enter note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="rounded-full px-6"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor={bodyId} className="text-sm font-medium">
              Note Content
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!body.trim()}
              className="rounded-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea
            id={bodyId}
            placeholder="Enter note content"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="resize-none rounded-2xl px-6 py-4"
          />
        </div>
      </div>
    </>
  );
}
