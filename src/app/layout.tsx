"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { Provider } from "react-redux";
import "./globals.css";
import { myStore } from "@/redux/store";
import Navbar from "@/components/Navbar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <Provider store={myStore}>
          <Navbar />
          {children}
        </Provider>
      </body>
    </html>
  );
}
