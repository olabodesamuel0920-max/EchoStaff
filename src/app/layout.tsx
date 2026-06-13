import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StateProvider } from "@/context/state-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EchoStaff AI | Train your brand's first AI employee",
  description: "EchoStaff AI is an all-in-one SaaS platform where businesses can train AI employees that learn their voice, support clients, book appointments, and handle leads.",
  keywords: ["AI employees", "AI agents", "customer support automation", "AI booking", "brand voice training", "SaaS platform"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col selection:bg-purple-600 selection:text-white overflow-x-hidden">
        <StateProvider>
          {children}
        </StateProvider>
      </body>
    </html>
  );
}
