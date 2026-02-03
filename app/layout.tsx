import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SASD Portal",
  description: "System szkoleniowy SASD - Portal egzaminacyjny i materiałów szkoleniowych",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
