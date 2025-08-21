import { NoteDetailSheet } from "@/components/note-detail-sheet";
import { NoteGrid } from "@/components/note-grid";
import { PageHeader } from "@/components/page-header";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

      {/* その上にSheetで詳細を表示 */}
      <NoteDetailSheet noteId={id} />
    </>
  );
}
