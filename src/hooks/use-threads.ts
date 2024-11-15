import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";

import { api } from "@/trpc/react";

// defining atom for threadId
export const threadIdAtom = atom<string | null>(null);

/**
 * Custom hook for managing email threads and account data
 *
 * @remarks
 * This hook combines several pieces of state and data fetching:
 * - Account information from API
 * - Local storage for account ID, sidebar tab selection, and completion status
 * - Thread ID from global state
 * - Thread data fetching with auto-refresh
 *
 * @returns {Object} An object containing:
 *  - threads: The fetched thread data
 *  - isFetching: Boolean indicating if threads are being fetched
 *  - refetch: Function to manually refetch threads
 *  - accountId: Current selected account ID from storage
 *  - account: The full account object for the selected ID
 *  - threadId: Currently selected thread ID
 *  - setThreadId: Function to update the selected thread ID
 */
const useThreads = () => {
  const { data: accounts } = api.account.getAccounts.useQuery();

  const [accountId] = useLocalStorage("accountId", "");

  const [tab] = useLocalStorage<"inbox" | "draft" | "sent" | "settings">(
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
