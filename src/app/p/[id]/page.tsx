"use client";

import { useParams, useRouter } from "next/navigation";
import { PromptEditor } from "@/components/prompt-editor";
import { PromptList } from "@/components/prompt-list";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const promptId = params.id as string;

  const handleClose = () => {
    router.push("/");
  };

  return (
    <>
      {/* 背景に一覧画面を表示 */}
      <PromptList />

      {/* その上にSheetで詳細を表示 */}
      <Sheet open={true} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          <SheetTitle className="sr-only">Edit</SheetTitle>
          <div className="p-6">
            <PromptEditor
              promptId={promptId}
              onClose={handleClose}
              onSave={handleClose}
              onDelete={handleClose}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
