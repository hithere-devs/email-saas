"use client";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
export function CTA() {
  const words = [
    {
      text: "Elevate",
    },
    {
      text: "your",
    },
    {
      text: "email",
    },
    {
      text: "experience",
    },
    {
      text: "with",
    },
    {
      text: "Hithere.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex h-[25rem] flex-col items-center justify-center">
      <p className="text-xs text-neutral-600 dark:text-neutral-200 sm:text-base">
        AI-powered tools for seamless management, smarter composition, and
        effortless organization.
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col space-x-0 space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <button className="h-10 w-40 rounded-xl border border-transparent bg-black text-sm text-white dark:border-white">
          Join Now
        </button>
        {/* <button className="h-10 w-40 rounded-xl border border-black bg-white text-sm text-black">
          Sign Up
        </button> */}
      </div>
    </div>
  );
}
