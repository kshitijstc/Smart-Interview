import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Smart Interview Scheduler",
  description: "Interview Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Inject Jitsi external script */}
        {/* <script src="https://meet.jit.si/external_api.js" /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
