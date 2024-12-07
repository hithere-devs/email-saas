import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import KBar from "@/components/k-bar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Hithere Mail",
  description: "The modern email client with AI superpowers!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <head>
          <meta property="og:url" content="https://mail.hitheredevs.com" />
          <meta property="og:type" content="website" />
          <meta
            property="og:title"
            content="Hithere Mail - by hit here devs!"
          />
          <meta
            property="og:description"
            content="The modern email client with AI superpowers!"
          />
          <meta
            property="og:image"
            content="https://res.cloudinary.com/chintukepapa/image/upload/v1733589457/p5v2ygk4gmlcg03d850y.png"
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="mail.hitheredevs.com" />
          <meta property="twitter:url" content="https://mail.hitheredevs.com" />
          <meta
            name="twitter:title"
            content="Hithere Mail - by hit here devs!"
          />
          <meta
            name="twitter:description"
            content="The modern email client with AI superpowers!"
          />
          <meta
            name="twitter:image"
            content="https://res.cloudinary.com/chintukepapa/image/upload/v1733589457/p5v2ygk4gmlcg03d850y.png"
          />
        </head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* <TRPCReactProvider>
              <KBar>{children}</KBar>
              <Toaster />
            </TRPCReactProvider> */}
            <div className="flex h-screen w-screen items-center justify-center text-center">
              "App is down for Maintainence, Please have some patience! <br />{" "}
              will be back up in a few hours"
              <br /> - HITHERE TEAM
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
