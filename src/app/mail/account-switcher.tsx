"use client";

import React from "react";

// utils
import { cn } from "@/lib/utils";

// api
import { api } from "@/trpc/react";

// hooks
import { useRouter } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";

// components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// icons
import { PlusIcon } from "@radix-ui/react-icons";

type Props = {
  isCollapsed: boolean;
};

const AccountSwitcher = ({ isCollapsed }: Props) => {
  const { data } = api.account.getAccounts.useQuery();
  const router = useRouter();

  const [accountId, setAccountId] = useLocalStorage("accountId", "");

  if (!data) return null;
  // when no accounts connected redirect to account linking page
  if (data.length <= 0) {
    router.push("/link");
  }

  return (
    <div>
      <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger
          className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
              "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden",
          )}
          aria-label="Select Account"
        >
          <SelectValue placeholder={"Select an account"}>
            <span className={cn({ hidden: !isCollapsed })}>
              {
                data.find((account) => account.id.toString() === accountId)
                  ?.emailAddress[0]
              }
            </span>
            <span className={cn({ hidden: isCollapsed, "ml-2": true })}>
              {
                data.find(
                  (account) => Number(account.id) === parseInt(accountId),
                )?.emailAddress
              }
            </span>
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {data.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              {account.emailAddress}
            </SelectItem>
          ))}
          <div
            onClick={async () => {
              router.push("/link");
            }}
            className="focus:bg-accen relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            <PlusIcon className="mr-1 size-4" />
            Add Account
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountSwitcher;
