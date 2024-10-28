"use client";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/stripe-action";
import React from "react";

const StripeButton = () => {
  const isSubscribed = false;

  const handleClick = async () => {
    createCheckoutSession();
  };

  return (
    <Button variant={"outline"} size={"lg"} onClick={handleClick}>
      {isSubscribed ? "Manage Subscrption" : "Subscribe"}
    </Button>
  );
};

export default StripeButton;
