"use client";

import { Copy, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

interface NoteEditorProps {
  noteId: string;
  onClose?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

export function NoteEditor({
  noteId,
  onClose,
  onSave,
  onDelete,
}: NoteEditorProps) {
  const router = useRouter();
  const { getNoteById, updateNote, deleteNote, isLoading } = useLocalStorage();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  const note = getNoteById(noteId);

  useEffect(() => {
    // 削除済みの場合は何もしない
    if (isDeleted) return;

    // ローディング中は何もしない
    if (isLoading) return;

    if (note) {
      setTitle(note.title);
      setBody(note.body);
    } else {
      // ノートが見つからない場合のエラー表示とリダイレクト
      toast.error("Note not found");
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }
  }, [note, router, isLoading, onClose, isDeleted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSaving(true);

    try {
      const success = updateNote(noteId, {
        title: title.trim(),
        body: body.trim(),
      });

      if (success) {
        toast.success("Note updated successfully");
        if (onSave) {
          onSave();
        } else if (onClose) {
          onClose();
        } else {
          router.back();
        }
      } else {
        throw new Error("Failed to update");
      }
    } catch {
      toast.error("Failed to update. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
        } else {
          router.back();
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

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            onChange={(e) => setTitle(e.target.value)}
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
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="resize-none rounded-2xl px-6 py-4"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving} className="rounded-full">
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="rounded-full"
          >
            Cancel
          </Button>
        </div>
      </form>

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
