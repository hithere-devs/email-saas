"use client";

import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { Button } from "./ui/button";

const LinkGoogleAccountButton = () => {
  return (
    <Button
      onClick={async () => {
        const googleAuthUrl = await getAurinkoAuthUrl("Google");
        const officeAuthUrm = await getAurinkoAuthUrl("Office365");

        window.location.href = googleAuthUrl;
      }}
    >
      Link Gmail Account
    </Button>
  );
};

export default LinkGoogleAccountButton;
