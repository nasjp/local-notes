"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface NewNoteFormProps {
  onClose?: () => void;
  onSave?: () => void;
}

export function NewNoteForm({ onClose, onSave }: NewNoteFormProps) {
  const router = useRouter();
  const { addNote } = useLocalStorage();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSaving(true);

    try {
      const newNote = addNote({ title: title.trim(), body: body.trim() });

      if (newNote) {
        toast.success("Note saved successfully");
        if (onSave) {
          onSave();
        } else if (onClose) {
          onClose();
        } else {
          router.push("/");
        }
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
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

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">New Note</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
    </>
  );
}
