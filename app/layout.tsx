import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/contexts/Providers";

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
      <body>
        <Providers>
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
