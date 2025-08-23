"use client";

import { Copy, Trash2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { debounce } from "@/lib/utils";

interface NoteEditorProps {
  noteId: string;
  onClose?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onBeforeClose?: (handler: (callback: () => void) => void) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function NoteEditor({
  noteId,
  onClose,
  onSave,
  onDelete,
  onBeforeClose,
}: NoteEditorProps) {
  const { getNoteById, updateNote, deleteNote, isLoading } = useLocalStorage();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<SaveStatus>("idle");
  const titleId = useId();
  const bodyId = useId();
  const initialValuesRef = useRef({ title: "", body: "" });
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const note = getNoteById(noteId);

  useEffect(() => {
    // 削除済みの場合は何もしない
    if (isDeleted) return;

    // ローディング中は何もしない
    if (isLoading) return;

    if (note) {
      setTitle(note.title);
      setBody(note.body);
      // 初期値を保存
      initialValuesRef.current = { title: note.title, body: note.body };
    } else {
      // ノートが見つからない場合のエラー表示
      toast.error("Note not found");
      if (onClose) {
        onClose();
      }
    }
  }, [note, isLoading, onClose, isDeleted]);

  // 自動保存関数
  const autoSave = useCallback(
    (newTitle: string, newBody: string) => {
      // 初期値と同じ場合は保存しない
      if (
        newTitle.trim() === initialValuesRef.current.title &&
        newBody.trim() === initialValuesRef.current.body
      ) {
        return;
      }

      // タイトルが空の場合は保存しない
      if (!newTitle.trim()) {
        return;
      }

      setAutoSaveStatus("saving");

      const success = updateNote(noteId, {
        title: newTitle.trim(),
        body: newBody.trim(),
      });

      if (success) {
        setAutoSaveStatus("saved");
        // 保存完了後に初期値を更新
        initialValuesRef.current = {
          title: newTitle.trim(),
          body: newBody.trim(),
        };

        // 2秒後に"saved"表示を消す
        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }
        savedTimeoutRef.current = setTimeout(() => {
          setAutoSaveStatus("idle");
        }, 2000);
      } else {
        setAutoSaveStatus("error");
        toast.error("Auto-save failed. Please save manually.");
      }
    },
    [noteId, updateNote],
  );

  // デバウンスされた自動保存関数
  const debouncedAutoSave = useMemo(() => debounce(autoSave, 1500), [autoSave]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  // 未保存の変更があるかチェック
  const hasUnsavedChanges = useCallback(() => {
    return (
      title.trim() !== initialValuesRef.current.title ||
      body.trim() !== initialValuesRef.current.body
    );
  }, [title, body]);

  // onBeforeCloseの登録
  useEffect(() => {
    if (!onBeforeClose) return;

    const handleBeforeClose = (callback: () => void) => {
      // 未保存の変更がない場合は即座にコールバックを実行
      if (!hasUnsavedChanges()) {
        callback();
        return;
      }

      // タイトルが空の場合はバリデーションエラー
      if (!title.trim()) {
        toast.error("Please enter a title before closing");
        return;
      }

      // 保存を実行
      setAutoSaveStatus("saving");
      const success = updateNote(noteId, {
        title: title.trim(),
        body: body.trim(),
      });

      if (success) {
        // 保存成功後に初期値を更新
        initialValuesRef.current = {
          title: title.trim(),
          body: body.trim(),
        };
        // 少し遅延を入れてから閉じる（UIフィードバックのため）
        setTimeout(callback, 100);
      } else {
        setAutoSaveStatus("error");
        toast.error("Failed to save. Please try again.");
      }
    };

    onBeforeClose(handleBeforeClose);
  }, [onBeforeClose, hasUnsavedChanges, title, body, noteId, updateNote]);

  // タイトル変更ハンドラー
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setAutoSaveStatus("idle");
    debouncedAutoSave(newTitle, body);
  };

  // 本文変更ハンドラー
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBody = e.target.value;
    setBody(newBody);
    setAutoSaveStatus("idle");
    debouncedAutoSave(title, newBody);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const success = deleteNote(noteId);

      if (success) {
        setIsDeleted(true);
        toast.success("Note deleted successfully");
        if (onDelete) {
          onDelete();
        } else if (onClose) {
          onClose();
        }
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      toast.success("Note copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (isLoading || !note || isDeleted) {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-start pr-10">
          <h2 className="text-lg font-semibold">Edit Note</h2>
          {autoSaveStatus !== "idle" && (
            <span
              className={`text-xs ${
                autoSaveStatus === "saving"
                  ? "text-muted-foreground"
                  : autoSaveStatus === "saved"
                    ? "text-green-600"
                    : "text-red-600"
              }`}
            >
              {autoSaveStatus === "saving" && "保存中..."}
              {autoSaveStatus === "saved" && "保存済み"}
              {autoSaveStatus === "error" && "保存エラー"}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor={titleId} className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
          <Input
            id={titleId}
            type="text"
            placeholder="Enter note title"
            value={title}
            onChange={handleTitleChange}
            required
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
            onChange={handleBodyChange}
            rows={10}
            className="resize-none rounded-2xl px-6 py-4"
          />
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{note.title}&rdquo;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
