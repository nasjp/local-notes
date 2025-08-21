import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./search-input";

export function SearchBar() {
  return (
    <div className="flex gap-4 justify-center">
      <div className="w-full md:w-1/3">
        <SearchInput />
      </div>
      <Link href="/new">
        <Button className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </Link>
    </div>
  );
}
