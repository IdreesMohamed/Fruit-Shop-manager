import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fruit-Shop-manager",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Mohamed Idrees S" }],
  openGraph: {
    title: "Fruit-Shop-manager",
    description: "A simple and interactive application to manage a fruit shop’s inventory, expenses, and sales. Built using Python, HTML, and CSS, with options to track fruit stock, calculate expenses, and manage finances in a clean, responsive UI.",
    url: "https://fruit-shop-manager.vercel.app/",
    siteName: "Fruit-Shop-manager",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fruit-Shop-manager",
    description: "A simple and interactive application to manage a fruit shop’s inventory",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
