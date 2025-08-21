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
  const { addNote } = useLocalStorage();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSaving(true);

    try {
      const newNote = addNote({ title: title.trim(), body: body.trim() });

      if (newNote) {
        toast.success("Note saved successfully");
        router.push("/");
      } else {
        throw new Error("保存に失敗しました");
      }
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center md:h-[50vh] h-auto md:py-0 py-12">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-center mb-8">New Note</h1>
        </div>
      </div>

      <div className="pb-12 max-w-2xl mx-auto">
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
            <label htmlFor={bodyId} className="text-sm font-medium">
              Note Content
            </label>
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
            <Link href="/">
              <Button type="button" variant="outline" className="rounded-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
