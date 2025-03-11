import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

import { Fragment_Mono } from "next/font/google";
import { Courier_Prime } from "next/font/google";

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mohamed",
  description: "Wanted: Goated Engineer",
};

const pulpo = localFont({
  src: [
    {
      path: "../../public/fonts/Pulpo-Light.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pulpo-Medium.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pulpo-Black.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-pulpo",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const classNames = `${geistSans.variable} ${geistMono.variable} ${fragmentMono.variable} ${courierPrime.variable} antialiased ${pulpo.variable}`;

  return (
    <html lang="en">
      <body className={classNames}>{children}</body>
    </html>
  );
}
