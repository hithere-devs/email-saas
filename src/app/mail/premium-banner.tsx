"use client";

import { FREE_CREDITS_PER_DAY } from "@/constants";
import React from "react";
import StripeButton from "./stripe-button";

const PremiumBanner = () => {
  const isSubscribed = false;
  const remainingCredits = 5;

  if (!isSubscribed) {
    return (
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-lg border bg-gray-900 p-4 md:flex-row">
        <img
          src="/bot.png"
          className="h-[120px] w-auto md:absolute md:-bottom-6 md:-right-10"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-md font-bold text-white">Basic Plan</h1>
            <p className="text-sm text-gray-400 md:max-w-full">
              {remainingCredits} / {FREE_CREDITS_PER_DAY} credits remaining
            </p>
          </div>
          <div className="h-4"></div>
          <p className="text-sm text-gray-400 md:max-w-[calc(100%-80px)]">
            Upgrade to ask as many questions as you want!
          </p>
          <div className="h-4"></div>
          <StripeButton />
        </div>
      </div>
    );
  }

  return <div>PremiumBanner</div>;
};

export default PremiumBanner;
