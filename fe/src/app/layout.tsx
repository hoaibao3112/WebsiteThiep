import type { Metadata } from "next";
import { Playfair_Display, Inter, Outfit, Quicksand } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  variable: "--font-quicksand",
  display: "swap",
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
        <AuthProvider>
          <LanguageProvider>
            {children}
            <AuthModal />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
