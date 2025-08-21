import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Prompt Storage",
  description: "LLM用プロンプトをローカルで管理する軽量Webアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold text-center">Prompt Storage</h1>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
