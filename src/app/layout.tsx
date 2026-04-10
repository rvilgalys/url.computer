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
  title: "url.computer",
  description: "A utility for parsing URLs and building cURL commands.",
  metadataBase: new URL("https://url.computer"),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "url.computer",
    description:
      "Parse URLs and build cURL commands. Runs entirely in your browser.",
    url: "https://url.computer",
    siteName: "url.computer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "url.computer",
    description:
      "Parse URLs and build cURL commands. Runs entirely in your browser.",
    images: ["/og-image.png"],
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
        className={`${roboto.variable} ${jetbrainsMono.variable} bg-elf-dark-blue text-elf-light-blue antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
