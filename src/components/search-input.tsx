"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useSearchContext } from "@/contexts/search-context";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useSearchContext();
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);

  // Debounce search input (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchInput);
    }, 200);

    return () => clearTimeout(timer);
  }, [localSearchInput, setSearchQuery]);

  return (
    <Input
      type="text"
      placeholder="Search..."
      value={localSearchInput}
      onChange={(e) => setLocalSearchInput(e.target.value)}
      className="w-full rounded-full px-6 shadow-sm"
    />
  );
}
