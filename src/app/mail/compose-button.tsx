"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import EmailEditor from "./email-editor";
import { cn } from "@/lib/utils";
import useThreads from "@/hooks/use-threads";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const ComposeButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >([]);

  const [subject, setSubject] = React.useState("");

  const { account } = useThreads();

  const sendEmail = api.account.sendEmail.useMutation();

  const handleSend = async (value: string) => {
    if (!account) return;
    const accountId = parseInt(account.id.toString());
    sendEmail.mutate(
      {
        accountId,
        threadId: undefined,
        body: value,
        subject,
        from: {
          name: account.name || "Me",
          address: account.emailAddress || "me@example.com",
        },
        to: toValues.map((to) => ({ address: to.value, name: to.value || "" })),
        cc: ccValues.map((cc) => ({ address: cc.value, name: cc.value || "" })),
        replyTo: {
          name: account.name || "Me",
          address: account.emailAddress || "me@example.com",
        },
        inReplyTo: undefined,
      },
      {
        onSuccess: () => {
          toast.success("Email Sent!");
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to send the email");
        },
      },
    );
  };

  return (
    <Drawer>
      <DrawerTrigger>
        <Button size={isCollapsed ? "icon" : "default"}>
          <Pencil className={cn({ isCollapsed: "mr-1" }, "size-4")} />
          {!isCollapsed && "Compose"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Compose Email</DrawerTitle>
          <EmailEditor
            toValues={toValues}
            setToValues={setToValues}
            ccValues={ccValues}
            setCcValues={setCcValues}
            subject={subject}
            setSubject={setSubject}
            handleSend={handleSend}
            isSending={sendEmail.isPending}
            to={toValues.map((v) => v.value)}
            defaultToolbarExpanded={true}
          />
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default ComposeButton;
