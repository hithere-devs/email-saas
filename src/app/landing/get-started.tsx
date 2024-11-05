"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  size?: "default" | "lg" | "sm" | "icon" | null | undefined;
  user?: any;
};

const GetStartedButton = (props: Props) => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/mail");
  };

  return (
    <Button onClick={handleRedirect} size={props.size || "default"}>
      {props.user ? "Dashboard" : "Get Started"}
    </Button>
  );
};

export default GetStartedButton;
