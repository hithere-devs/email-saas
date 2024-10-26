import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { searchValueAtom } from "./search-bar";
import { api } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";
import { useDebounceValue } from "usehooks-ts";
import DOMPurify from "dompurify";

const SearchDisplay = () => {
  const [searchValue] = useAtom(searchValueAtom);
  const search = api.account.searchEmails.useMutation();
  const { accountId } = useThreads();

  const [debouncedSearchValue] = useDebounceValue(searchValue, 500);

  useEffect(() => {
    if (!accountId) return;
    const accId = parseInt(accountId);
    search.mutate({
      accountId: accId,
      query: debouncedSearchValue,
    });
  }, [debouncedSearchValue, accountId]);

  return (
    <div className="max-h-[calc(100vh-50px)] overflow-y-scroll p-4">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm text-gray-600 dark:text-gray-400">
          Your search for &quot;{searchValue}&quot; come back with...
        </h2>
      </div>
      {search.data?.hits.length === 0 ? (
        <p>No results found</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {search.data?.hits.map((h) => (
            <li
              key={h.id}
              className="cursor-pointer rounded-sm border p-4 transition-all hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <h3 className="text-base font-medium">{h.document.subject}</h3>
              <p className="text-sm text-gray-500">
                From: &lt;{h.document.from}
                &gt;
              </p>
              <p className="text-sm text-gray-500">
                To: {h.document.to.join(", ")}
              </p>
              <p
                className="mt-2 text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(h.document.rawBody, {
                    USE_PROFILES: { html: true },
                  }),
                }}
              ></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchDisplay;
