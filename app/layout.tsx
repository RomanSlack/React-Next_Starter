import type { Metadata } from "next";

import "./globals.css";

import Favicon from "./components/Favicon";

export const metadata: Metadata = {
  title: "Add a title",
  description: "Hey add a description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Favicon />
      </head>
      <body className={inter.className}>

      </body>
    </html>
  );
}