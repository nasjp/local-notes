"use client";

import { useRouter } from "next/navigation";
import { PromptEditor } from "@/components/prompt-editor";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface PromptDetailSheetProps {
  promptId: string;
}

export function PromptDetailSheet({ promptId }: PromptDetailSheetProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  return (
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
  );
}
