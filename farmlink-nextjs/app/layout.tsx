import type { Metadata } from "next";
import { Fraunces, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import { CartProvider } from "./lib/cart-context";
import PageLoader from "./components/PageLoader";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-worksans",
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plexmono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://agrenza.com'),
  title: {
    template: '%s | Agrenza',
    default: 'Agrenza — Farm to Doorstep',
  },
  description: 'Buy fresh vegetables, fruits, and farm produce directly from verified Indian farmers at transparent GST-inclusive prices. No middlemen — Agrenza.',
  keywords: ['fresh vegetables online India', 'buy from farmers', 'farm to home delivery', 'organic produce online', 'no middlemen marketplace', 'fresh fruits home delivery'],
  authors: [{ name: 'Agrenza Team' }],
  creator: 'Agrenza',
  publisher: 'Agrenza',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://agrenza.com',
    siteName: 'Agrenza',
    title: 'Agrenza — Farm to Doorstep',
    description: 'Buy fresh vegetables, fruits, and farm produce directly from verified Indian farmers. No middlemen — fair prices, fast delivery.',
    images: [{ url: '/agrenza-logo-small.jpg', width: 96, height: 96, alt: 'Agrenza Logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'Agrenza — Farm to Doorstep',
    description: 'Fresh farm produce delivered directly to your door. No middlemen, fair prices.',
    images: ['/agrenza-logo-small.jpg'],
  },
  icons: {
    icon: '/agrenza-logo-small.jpg',
    apple: '/agrenza-logo-small.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable}`}>
        <PageLoader />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
