"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "./compose-button";
import { useEffect, useState } from "react";

const Mail = dynamic(() => import("./mail"), { ssr: false });

const MailDashboard = () => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-center">
        Please open this on a desktop
      </div>
    );
  }

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
