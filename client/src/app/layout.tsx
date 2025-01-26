"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Magic 8ball</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]`}
      >
        {children}
      </body>
    </html>
  );
}
