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
  metadataBase: new URL("https://www.lankacare.me"),
  title: {
    default: "HealthNexus | Connected healthcare for Sri Lanka",
    template: "%s | HealthNexus",
  },
  description: "Discover healthcare institutions and manage a more connected digital healthcare journey with HealthNexus.",
  openGraph: {
    title: "HealthNexus | Connected healthcare for Sri Lanka",
    description: "Discover healthcare institutions and manage a more connected digital healthcare journey.",
    url: "https://www.lankacare.me",
    siteName: "HealthNexus",
    locale: "en_LK",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
