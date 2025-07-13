import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import Favicon from "./components/Favicon";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
  title: "Skema - Your Ultimate Productivity Companion",
  description: "Organize tasks, manage schedules, and unlock your potential with AI-powered assistance. Features Kanban boards, calendar, journal, and intelligent command bar.",
  keywords: ["productivity", "task management", "kanban", "calendar", "journal", "AI assistant"],
  authors: [{ name: "Skema Team" }],
  creator: "Skema",
  publisher: "Skema",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Skema",
    title: "Skema - Your Ultimate Productivity Companion",
    description: "Organize tasks, manage schedules, and unlock your potential with AI-powered assistance.",
    url: "https://skema.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skema - Your Ultimate Productivity Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skema - Your Ultimate Productivity Companion",
    description: "Organize tasks, manage schedules, and unlock your potential with AI-powered assistance.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Favicon />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}