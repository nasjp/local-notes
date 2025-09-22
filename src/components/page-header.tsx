import { SearchBar } from "./search-bar";

export function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl font-medium text-center mb-8">Local Notes</h1>
      <SearchBar />
    </div>
  );
}
