import type { Metadata } from "next";
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
  title: "KaratTech | Digital Ecosystem for Jewellers",
  description: "Advanced SaaS platform for Jewellery businesses. Manage inventory, digital billing, walk-in POS, customer offers, and online sales seamlessly with KaratTech.",
  keywords: "KaratTech, Jewellery software, POS system for jewellers, digital billing, jewellery inventory management, SaaS, jewelry billing software",
  openGraph: {
    title: "KaratTech | Digital Ecosystem for Jewellers",
    description: "The ultimate billing and inventory software for your jewellery boutique.",
    url: "https://karattech.in",
    siteName: "KaratTech",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
