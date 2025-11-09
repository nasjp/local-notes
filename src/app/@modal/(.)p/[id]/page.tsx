"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { NoteEditor } from "@/components/note-editor";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { saveScrollPosition } from "@/lib/scroll-position";

export default function InterceptedNoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    saveScrollPosition();
    // Sheetを閉じる（アニメーション開始）
    setIsOpen(false);
    // アニメーション完了後にルーティング
    setTimeout(() => {
      router.back();
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
            onBeforeClose={() => {}}
            onDelete={handleClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
