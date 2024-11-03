"use client";

import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { Button } from "./ui/button";

type Props = {
  type: "Google" | "Office365";
};

const LinkAccountButton = ({ type }: Props) => {
  return (
    <Button
      onClick={async () => {
        const googleAuthUrl = await getAurinkoAuthUrl(type);

        window.location.href = googleAuthUrl;
      }}
    >
      Link {type === "Google" ? "Gmail" : "Microsoft"} Account
    </Button>
  );
};

export default LinkAccountButton;
