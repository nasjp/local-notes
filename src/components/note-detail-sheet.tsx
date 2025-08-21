"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NoteEditor } from "@/components/note-editor";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface NoteDetailSheetProps {
  noteId: string;
}

export function NoteDetailSheet({ noteId }: NoteDetailSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    // Sheetを閉じる（アニメーション開始）
    setIsOpen(false);
    // アニメーション完了後にルーティング
    setTimeout(() => {
      router.push("/");
    }, 300); // Sheetのアニメーション時間
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetTitle className="sr-only">Edit</SheetTitle>
        <div className="p-6">
          <NoteEditor
            noteId={noteId}
            onClose={handleClose}
            onSave={handleClose}
            onDelete={handleClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
