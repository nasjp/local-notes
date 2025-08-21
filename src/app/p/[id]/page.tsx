import { PageHeader } from "@/components/page-header";
import { PromptDetailSheet } from "@/components/prompt-detail-sheet";
import { PromptGrid } from "@/components/prompt-grid";

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
        <PromptGrid />
      </div>

      {/* その上にSheetで詳細を表示 */}
      <PromptDetailSheet promptId={id} />
    </>
  );
}
