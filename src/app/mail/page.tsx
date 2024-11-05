"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "./compose-button";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

const Mail = dynamic(() => import("./mail"), { ssr: false });

const MailDashboard = () => {
  const [isDesktop, setIsDesktop] = useState(true);
  const { data: accounts, isLoading } = api.account.getAccounts.useQuery();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (accounts?.length === 0) {
      router.push("/link");
    }
  }, [accounts]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-center">
        Please open this on a desktop
      </div>
    );
  }

  return (
    <>
      <Mail
        defaultLayout={[20, 32, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </>
  );
};

export default MailDashboard;
