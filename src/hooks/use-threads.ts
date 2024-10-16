import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";

export const threadIdAtom = atom<string | null>(null);

const useThreads = () => {
  const { data: accounts } = api.account.getAccounts.useQuery();

  const [accountId] = useLocalStorage("accountId", "");

  const [tab] = useLocalStorage<"inbox" | "draft" | "sent">(
    "sidebar-tab",
    "inbox",
  );

  const [done] = useLocalStorage<boolean>("topbar-done", false);

  const [threadId, setThreadId] = useAtom(threadIdAtom);

  const {
    data: threads,
    isFetching,
    refetch,
  } = api.account.getThread.useQuery(
    {
      accountId: parseInt(accountId),
      tab,
      done,
    },
    {
      enabled: !!accountId && !!tab,
      placeholderData: (e) => e,
      refetchInterval: 5000,
    },
  );
  return {
    threads,
    isFetching,
    refetch,
    accountId,
    account: accounts?.find((acc) => acc.id === BigInt(accountId)),
    threadId,
    setThreadId,
  };
};

export default useThreads;
