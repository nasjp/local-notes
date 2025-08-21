import { NoteGrid } from "@/components/note-grid";
import { PageHeader } from "@/components/page-header";

export default async function Home() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <NoteGrid />
    </div>
  );
}
