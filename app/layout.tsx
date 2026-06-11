import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@progress/kendo-theme-default/dist/all.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stuck Stack",
  description:
    "Networking based on pain, not profiles. Post a blocker, find your helper, get unstuck.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fffbef] text-[#111]">
        {children}
      </body>
    </html>
  );
}
