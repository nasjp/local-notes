import { NewNoteSheet } from "@/components/new-note-sheet";
import { NoteGrid } from "@/components/note-grid";
import { PageHeader } from "@/components/page-header";

export default function NewNotePage() {
  return (
    <>
      {/* 背景に一覧画面を表示 */}
      <div>
        <div className="flex items-center justify-center md:h-[50vh] h-auto md:py-0 py-12">
          <div className="w-full">
            <PageHeader />
          </div>
        </div>
        <div className="pb-12">
          <NoteGrid />
        </div>
      </div>

      {/* その上にSheetで新規作成を表示 */}
      <NewNoteSheet />
    </>
  );
}
