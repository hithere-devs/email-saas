import React from "react";
import dynamic from "next/dynamic";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "./compose-button";

const Mail = dynamic(() => import("./mail"), { ssr: false });

const MailDashboard = () => {
  return (
    <>
      {/* <div className="absolute bottom-4 left-4"></div> */}
      <Mail
        defaultLayout={[20, 32, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </>
  );
};

export default MailDashboard;
