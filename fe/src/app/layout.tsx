import type { Metadata } from "next";
import { Playfair_Display, Inter, Outfit, Quicksand } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Digital Card Platform | Nền Tảng Thiệp Điện Tử Đa Danh Mục",
  description:
    "Tạo thiệp cưới, sinh nhật, thôi nôi online sang trọng, hiệu ứng phong bì 3D, đa ngôn ngữ Việt - Anh - Trung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${playfair.variable} ${inter.variable} ${outfit.variable} ${quicksand.variable} antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
