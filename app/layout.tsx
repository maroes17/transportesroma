import type { Metadata } from "next";
import { Noto_Sans_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/auth-provider";

const noto = Noto_Sans_Display({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Noto_Sans_Display({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transportes Romanesco",
  description: "Gestión de transportes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${noto.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
