import { PageHeader } from "@/components/page-header";
import { PromptGrid } from "@/components/prompt-grid";

export default async function Home() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <PromptGrid />
    </div>
  );
}
