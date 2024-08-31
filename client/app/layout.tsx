"use client";
import { MetadataComponent } from "./metadata";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProviderComponent } from "@/components/shared/QueryClientProviderComponent";
import { SocketProvider } from "@/context/SocketContext";
import { StateProvider } from "@/context/StateContext";
import reducer, { initialState } from "@/context/StateReducers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <MetadataComponent />
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClerkProvider>
            <QueryClientProviderComponent>
              <StateProvider initialState={initialState} reducer={reducer}>
                <SocketProvider>
                  <TooltipProvider>
                    <Toaster richColors />
                    <SignedOut>
                      <div className="w-full h-full flex justify-center items-center">
                        <SignIn routing="hash" />
                      </div>
                    </SignedOut>
                    <SignedIn>{children}</SignedIn>
                  </TooltipProvider>
                </SocketProvider>
              </StateProvider>
            </QueryClientProviderComponent>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
