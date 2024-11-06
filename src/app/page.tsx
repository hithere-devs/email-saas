"use client";

import { useTheme } from "next-themes";
import { UserButton, useUser } from "@clerk/nextjs";

import { Features } from "./landing/features";
import { CTA } from "./landing/cta";
import GetStartedButton from "./landing/get-started";

import { ModeToggle } from "@/components/dark-mode-toggle";
import Footer from "./footer";

export default function Home() {
  const { theme } = useTheme();
  const { user } = useUser();

  return (
    <div className="flex min-h-[100vh] max-w-[100vw] flex-col px-0 dark:bg-black sm:px-8">
      {/* Header */}

      <div className="fixed z-50 flex h-[10vh] w-[100vw] items-center justify-between bg-white dark:bg-black sm:pr-14">
        <div className="px-10">
          {theme === "light" ? (
            <img src="/logo-64.png" className="h-10 w-10" alt="Logo" />
          ) : (
            <img src="/logo-64-white.png" className="h-10 w-10" alt="Logo" />
          )}
        </div>
        <div className="flex items-center gap-6 px-10">
          <ModeToggle />
          <GetStartedButton user={user} />
          <UserButton />
        </div>
      </div>

      <div className="mt-[5.5rem] border-none bg-gray-200 dark:bg-black">
        {/* Main Hero Content */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative flex w-full items-center justify-center bg-white bg-grid-black/[0.2] dark:bg-black dark:bg-grid-white/[0.2]">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)] dark:bg-black"></div>
            <div className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8">
              <h1 className="text-[1.5rem] font-semibold leading-tight sm:text-[3.5rem]">
                Let's Reimagine the Way <br /> You Manage Your Inbox
              </h1>
              <p className="m-auto w-[20rem] py-4 text-[0.8rem] text-gray-500 sm:w-[45rem]">
                Stay on top of your emails effortlessly with smart automation,
                personalized AI features, and all the tools you need in one
                sleek, intuitive platform. Make your inbox work for you.
              </p>
              <div className="py-4">
                <GetStartedButton size={"lg"} user={user} />
              </div>
              <div className="py-3">
                <img src="/hero.png" alt="Hero Image" />
              </div>
            </div>
          </div>
        </div>
        {/* Features */}
        <Features
          products={[
            {
              title: "AI Smart Compose",
              link: "/src/app/mail/ai-conpose-button.tsx",
              thumbnail:
                "https://cdn.dribbble.com/userupload/5780885/file/original-1518acd8ecf3dd912cdbcf6b574c75ac.png?resize=2048x1536",
            },
            {
              title: "Email Editor",
              link: "https://cdn.dribbble.com/userupload/3626098/file/original-4a8d64174956a41f1ade39076bb96b07.png?resize=1504x1128",
              thumbnail:
                "https://cdn.dribbble.com/users/182336/screenshots/17411058/media/7e83030186c76a1b04b0c1e50800ebfb.png?resize=1600x1200&vertical=center",
            },
            {
              title: "Thread Display",
              link: "/src/app/mail/thread-display.tsx",
              thumbnail: "/hero.png",
            },
            {
              title: "Search Bar",
              link: "/src/app/mail/search-bar.tsx",
              thumbnail:
                "https://cdn.dribbble.com/userupload/15307421/file/original-2c40d8a440ee7db7d53fb614fa8afb70.png?resize=1504x1071&vertical=center",
            },
            {
              title: "AI Smart Compose",
              link: "/src/app/mail/ai-conpose-button.tsx",
              thumbnail:
                "https://cdn.dribbble.com/userupload/5780885/file/original-1518acd8ecf3dd912cdbcf6b574c75ac.png?resize=2048x1536",
            },
            {
              title: "Email Editor",
              link: "https://cdn.dribbble.com/userupload/3626098/file/original-4a8d64174956a41f1ade39076bb96b07.png?resize=1504x1128",
              thumbnail:
                "https://cdn.dribbble.com/users/182336/screenshots/17411058/media/7e83030186c76a1b04b0c1e50800ebfb.png?resize=1600x1200&vertical=center",
            },
            {
              title: "Thread Display",
              link: "/src/app/mail/thread-display.tsx",
              thumbnail: "/hero.png",
            },
            {
              title: "Search Bar",
              link: "/src/app/mail/search-bar.tsx",
              thumbnail:
                "https://cdn.dribbble.com/userupload/15307421/file/original-2c40d8a440ee7db7d53fb614fa8afb70.png?resize=1504x1071&vertical=center",
            },
            {
              title: "AI Smart Compose",
              link: "/src/app/mail/ai-conpose-button.tsx",
              thumbnail:
                "https://cdn.dribbble.com/userupload/5780885/file/original-1518acd8ecf3dd912cdbcf6b574c75ac.png?resize=2048x1536",
            },
            {
              title: "Email Editor",
              link: "https://cdn.dribbble.com/userupload/3626098/file/original-4a8d64174956a41f1ade39076bb96b07.png?resize=1504x1128",
              thumbnail:
                "https://cdn.dribbble.com/users/182336/screenshots/17411058/media/7e83030186c76a1b04b0c1e50800ebfb.png?resize=1600x1200&vertical=center",
            },
            {
              title: "Thread Display",
              link: "/src/app/mail/thread-display.tsx",
              thumbnail: "/hero.png",
            },
          ]}
        />
        {/* Pricing */}
        {/* <div className="">Pricing</div> */}
        {/* Testimonials */}
        {/* <div classNme="">Testimonials</div> */}
        {/* CTA */}
        <CTA user={user} />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
