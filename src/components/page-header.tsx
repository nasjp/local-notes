import { SearchBar } from "./search-bar";

export function PageHeader() {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8">Prompt Storage</h1>
      <SearchBar />
    </>
  );
}
