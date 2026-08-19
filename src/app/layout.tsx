import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

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
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Civic Action Hub",
      alternateName: "Civic Action Hub",
      url: "https://civicactionhub.org",
      description:
        "An Australian civic technology platform that aggregates petitions, events, and legal/civic actions into one searchable, filterable location.",
      areaServed: {
        "@type": "Country",
        name: "Australia",
      },
      sameAs: [
        "https://www.instagram.com/civicactionhub",
      ],
    }),
  }}
/>
<Header />
   {children}
   <Footer />
   <Analytics />
   </body>
    </html>
  );
}