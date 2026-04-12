import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Desa Keuangan - Transparansi Keuangan Desa",
  description: "Sistem manajemen keuangan desa untuk masjid dan dusun dengan transparansi penuh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
