import { NoteGrid } from "@/components/note-grid";
import { PageHeader } from "@/components/page-header";

export default async function Home() {
  return (
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
  );
}
