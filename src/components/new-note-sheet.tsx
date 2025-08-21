"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { NewNoteForm } from "./new-note-form";

interface NewNoteSheetProps {
  isIntercepted?: boolean;
}

export function NewNoteSheet({ isIntercepted = false }: NewNoteSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    // Sheetを閉じる（アニメーション開始）
    setIsOpen(false);
    // アニメーション完了後にルーティング
    setTimeout(() => {
      if (isIntercepted) {
        router.back();
      } else {
        router.push("/");
      }
      router.refresh();
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
        <SheetTitle className="sr-only">New Note</SheetTitle>
        <div className="p-6">
          <NewNoteForm onClose={handleClose} onSave={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
