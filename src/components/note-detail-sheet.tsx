"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { NoteEditor } from "@/components/note-editor";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { saveScrollPosition } from "@/lib/scroll-position";

type NoteDetailSheetProps = {
  noteId: string;
};

export function NoteDetailSheet({ noteId }: NoteDetailSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const beforeCloseCallbackRef = useRef<
    ((callback: () => void) => void) | null
  >(null);

  const handleClose = () => {
    saveScrollPosition();
    // Sheetを閉じる（アニメーション開始）
    setIsOpen(false);
    // アニメーション完了後にルーティング
    setTimeout(() => {
      router.push("/", { scroll: false });
      router.refresh();
    }, 300); // Sheetのアニメーション時間
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // beforeCloseCallbackがある場合は、それを実行
      if (beforeCloseCallbackRef.current) {
        beforeCloseCallbackRef.current(() => {
          handleClose();
        });
      } else {
        handleClose();
      }
    }
  };

  const handleInteractOutside = (event: Event) => {
    // beforeCloseCallbackがある場合は、デフォルト動作を防ぐ
    if (beforeCloseCallbackRef.current) {
      event.preventDefault();
      beforeCloseCallbackRef.current(() => {
        handleClose();
      });
    }
  };

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    // beforeCloseCallbackがある場合は、デフォルト動作を防ぐ
    if (beforeCloseCallbackRef.current) {
      event.preventDefault();
      beforeCloseCallbackRef.current(() => {
        handleClose();
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto p-0"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <SheetTitle className="sr-only">Edit</SheetTitle>
        <div className="p-6">
          <NoteEditor
            noteId={noteId}
            onClose={handleClose}
            onDelete={handleClose}
            onBeforeClose={(callback) => {
              beforeCloseCallbackRef.current = callback;
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
