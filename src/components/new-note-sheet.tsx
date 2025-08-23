"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { NewNoteForm } from "./new-note-form";

interface NewNoteSheetProps {
  isIntercepted?: boolean;
}

export function NewNoteSheet({ isIntercepted = false }: NewNoteSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const beforeCloseCallbackRef = useRef<
    ((callback: () => void) => void) | null
  >(null);

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
        <SheetTitle className="sr-only">New Note</SheetTitle>
        <div className="p-6">
          <NewNoteForm
            onBeforeClose={(callback) => {
              beforeCloseCallbackRef.current = callback;
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
