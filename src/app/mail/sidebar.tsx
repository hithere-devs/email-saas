"use client";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { Nav } from "./nav";
import { File, InboxIcon, Send, Settings } from "lucide-react";
import { api } from "@/trpc/react";

type Props = {
  isCollapsed: boolean;
};

const Sidebar = ({ isCollapsed }: Props) => {
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage<"inbox" | "draft" | "sent" | "settings">(
    "sidebar-tab",
    "inbox",
  );

  const id = parseInt(accountId);
  const { data: inboxThreads } = api.account.getNumThreads.useQuery({
    accountId: id,
    tab: "inbox",
  });
  const { data: draftThreads } = api.account.getNumThreads.useQuery({
    accountId: id,
    tab: "draft",
  });
  const { data: sentThreads } = api.account.getNumThreads.useQuery({
    accountId: id,
    tab: "sent",
  });

  return (
    <Nav
      links={[
        {
          title: "Inbox",
          label: inboxThreads?.toString() ?? "0",
          icon: InboxIcon,
          variant: tab === "inbox" ? "default" : "ghost",
        },
        {
          title: "Draft",
          label: draftThreads?.toString() ?? "0",
          icon: File,
          variant: tab === "draft" ? "default" : "ghost",
        },
        {
          title: "Sent",
          icon: Send,
          label: sentThreads?.toString() ?? "0",
          variant: tab === "sent" ? "default" : "ghost",
        },
        {
          title: "Settings",
          icon: Settings,
          variant: tab === "settings" ? "default" : "ghost",
        },
      ]}
      isCollapsed={isCollapsed}
    />
  );
};

export default Sidebar;
