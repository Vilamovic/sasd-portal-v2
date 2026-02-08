import type { Metadata } from "next";
import { VT323, Space_Mono } from 'next/font/google';
import "./globals.css";
import { Providers } from "@/src/contexts/Providers";

const vt323 = VT323({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-vt323' });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin', 'latin-ext'], variable: '--font-space-mono' });

export const metadata: Metadata = {
  title: "SASD MDT - San Andreas Sheriff's Department",
  description: "San Andreas Sheriff's Department - Mobile Data Terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sasd-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${vt323.variable} ${spaceMono.variable} font-mono antialiased`}>
        <Providers>
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
