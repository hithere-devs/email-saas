"use client";
import LinkAccountButton from "@/components/link-account-button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { user } = useUser();

  if (!user)
    return (
      <div className="my-44 flex flex-col items-center justify-center gap-10">
        <Spinner size={"large"} />
      </div>
    );

  return (
    <div className="my-44 flex flex-col items-center justify-center gap-10">
      <div className="text-3xl">Hey, {user?.fullName}! 🙈</div>
      <p>Please connect your Mailbox!</p>
      <div className="flex gap-5">
        <LinkAccountButton type="Google" />
        <LinkAccountButton type="Office365" />
      </div>
    </div>
  );
}
