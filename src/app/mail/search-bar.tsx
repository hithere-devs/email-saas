import { Input } from "@/components/ui/input";
import useThreads from "@/hooks/use-threads";
import { atom, useAtom } from "jotai";
import { Loader2, Search, X } from "lucide-react";
import React from "react";

export const searchValueAtom = atom("");
export const isSearchingAtom = atom(false);

const SearchBar = () => {
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);

  const { isFetching } = useThreads();

  const handleBlur = () => {
    if (searchValue !== "") return;
    setIsSearching(false);
  };

  return (
    <div className="relative m-4">
      <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-8"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsSearching(true)}
        onBlur={() => handleBlur()}
      />
      <div className="absolute right-2 top-2.5 flex items-center gap-2">
        {isFetching && (
          <Loader2 className="size-4 animate-spin text-gray-400" />
        )}
        <button
          className="rounded-sm hover:bg-gray-400/20"
          onClick={() => {
            setSearchValue("");
            setIsSearching(false);
          }}
        >
          <X className="size-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
