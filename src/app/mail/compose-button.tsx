"use client";

import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import EmailEditor from "./email-editor";
import { cn } from "@/lib/utils";

const ComposeButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >([]);

  const [subject, setSubject] = React.useState("");

  const handleSend = () => {
    console.log("Send email");
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
          {/* <DrawerDescription></DrawerDescription> */}
          <EmailEditor
            toValues={toValues}
            setToValues={setToValues}
            ccValues={ccValues}
            setCcValues={setCcValues}
            subject={subject}
            setSubject={setSubject}
            handleSend={handleSend}
            isSending={false}
            to={toValues.map((v) => v.value)}
            defaultToolbarExpanded={true}
          />
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default ComposeButton;
