"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { Provider } from "react-redux";
import "./globals.css";
import { myStore } from "@/redux/store";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import { SessionProvider } from "next-auth/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// material ui themeOptions
const theme = createTheme({
  typography: {
    button: {
      textTransform: "none", // Disables default uppercase transformation
    },
  },
});
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
        {/* material-ui theme provider */}
        <ThemeProvider theme={theme}>
          {/* next-auth-provider */}
          <SessionProvider>
            {/* redux provider */}
            <Provider store={myStore}>
              <ToastContainer />
              {/* <Navbar /> */}
              {children}
            </Provider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
