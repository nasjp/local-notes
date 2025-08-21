"use client";

import { useParams, useRouter } from "next/navigation";
import { PromptEditor } from "@/components/prompt-editor";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function InterceptedPromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const promptId = params.id as string;

  const handleClose = () => {
    router.back();
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetTitle className="sr-only">プロンプトの編集</SheetTitle>
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
  );
}
