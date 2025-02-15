import type { Metadata } from "next";
import localFont from "next/font/local";
import { Provider } from "@repo/ui/provider";
import We3Provider from "./we3Provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Riddle Dapp",
  description: "Riddle Dapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <We3Provider>
          <Provider>{children}</Provider>
        </We3Provider>
      </body>
    </html>
  );
}
