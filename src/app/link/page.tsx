"use client";
import LinkAccountButton from "@/components/link-account-button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  const { user } = useUser();

  // check if user has any accounts connected
  const { data } = api.account.getAccounts.useQuery();

  if (!user || !data) {
    return (
      <div className="my-44 flex flex-col items-center justify-center gap-10">
        <Spinner size={"large"} />
      </div>
    );
  }

  return (
    <div className="my-44 flex flex-col items-center justify-center gap-10">
      <div className="text-3xl">Hey, {user?.fullName}! 🙈</div>
      <p>Please connect your Mailbox!</p>
      <div className="flex gap-5">
        <LinkAccountButton type="Google" />
        <LinkAccountButton type="Office365" />
      </div>
      {/* Check if user has already an account connected, if yes then just allow him to forward to the dashboard otherwise disable this */}
      {data && data.length > 0 ? (
        <p>
          Already Connected? <Link href={"/mail"}>Move to dashboard</Link>
        </p>
      ) : (
        <></>
      )}
    </div>
  );
}
