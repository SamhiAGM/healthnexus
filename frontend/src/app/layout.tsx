import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lankacare.me"),
  title: {
    default: "HealthNexus | Connected Care. Better Healthcare. For Sri Lanka.",
    template: "%s | HealthNexus LankaCare.me",
  },
  description: "A smarter digital healthcare experience connecting patients, hospitals, and healthcare professionals across Sri Lanka.",
  keywords: [
    "Sri Lanka healthcare",
    "HealthNexus",
    "LankaCare",
    "hospital directory",
    "doctor consultation",
    "clinic appointments",
    "digital queue ticket",
    "Base Hospital Kinniya",
    "Ministry of Health Sri Lanka",
  ],
  authors: [{ name: "HealthNexus LK Team" }],
  openGraph: {
    title: "HealthNexus | Connected Care. Better Healthcare. For Sri Lanka.",
    description: "A smarter digital healthcare experience connecting patients, hospitals, and healthcare professionals across Sri Lanka.",
    url: "https://www.lankacare.me",
    siteName: "HealthNexus",
    locale: "en_LK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#EDF2F4] text-[#3C5262]">{children}</body>
    </html>
  );
}
