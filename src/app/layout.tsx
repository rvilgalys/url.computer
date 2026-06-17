import type { Metadata } from "next";
import { Roboto, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "url.computer — Visual URL Parser & cURL Command Builder",
    template: "%s | url.computer",
  },
  description:
    "A privacy-first, client-side developer utility for parsing URLs, editing query parameters, and building cURL commands.",
  keywords: [
    "url parser",
    "url editor",
    "curl builder",
    "curl generator",
    "url query editor",
    "remove tracking parameters",
    "utm stripper",
    "online curl builder",
    "developer tools",
    "privacy first",
    "client side url parser",
    "query string analyzer",
    "url decoder",
    "url encoder",
  ],
  metadataBase: new URL("https://url.computer"),
  alternates: {
    canonical: "https://url.computer",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "url.computer — Visual URL Parser & cURL Command Builder",
    description:
      "Parse URLs and build cURL commands in real-time. Runs entirely client-side for privacy.",
    url: "https://url.computer",
    siteName: "url.computer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "url.computer — Visual URL Parser & cURL Command Builder",
    description:
      "Parse URLs and build cURL commands in real-time. Runs entirely client-side for privacy.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "url.computer",
    url: "https://url.computer",
    description:
      "A privacy-first client-side web utility for parsing URLs and generating cURL commands.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    browserRequirements: "Requires HTML5 support",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Person",
      name: "Rim Vilgalys",
      url: "https://rim.computer",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${roboto.variable} ${jetbrainsMono.variable} bg-elf-dark-blue text-elf-light-blue antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
