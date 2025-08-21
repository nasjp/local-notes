import { NoteDetailSheet } from "@/components/note-detail-sheet";
import { NoteGrid } from "@/components/note-grid";
import { PageHeader } from "@/components/page-header";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      {/* 背景に一覧画面を表示 */}
      <div className="space-y-6">
        <PageHeader />
        <NoteGrid />
      </div>

      {/* その上にSheetで詳細を表示 */}
      <NoteDetailSheet noteId={id} />
    </>
  );
}
