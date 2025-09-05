import type { Metadata } from "next";
import Image from "next/image";
import "@/lib/migrate";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Bingo - Gestión",
  description: "Sistema de gestión financiera para eventos de bingo locales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="container py-8">
          {children}
        </div>
        <div className="fixed bottom-6 right-6 pointer-events-none select-none opacity-95">
          <Image src="/logo.png" alt="Bingo" width={140} height={140} priority />
        </div>
      </body>
    </html>
  );
}
