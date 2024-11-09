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
  description: "A modern email client with AI superpowers",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <KBar>{children}</KBar>
              <Toaster />
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
