import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const oswald = Oswald({
     variable: "--font-display",
     subsets: ["latin"],
     weight: ["600", "700"],
   });

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Civic Action Hub",
  description: "Find and track civic actions across Australia",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
     <Header />
     {children}
   </body>
    </html>
  );
}