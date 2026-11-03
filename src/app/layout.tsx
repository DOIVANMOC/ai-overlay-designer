import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Overlay Designer – Phần Mềm Tạo Khung Overlay Tự Động (Ocean Studio)",
  description: "Thiết kế và tái tạo khung overlay streaming tự động từ hình ảnh AI trên nền giao diện Đại Dương, tách nền trong suốt RGBA và giữ nguyên phong cách gốc.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col ocean-ambient-bg text-cyan-50 font-sans selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
