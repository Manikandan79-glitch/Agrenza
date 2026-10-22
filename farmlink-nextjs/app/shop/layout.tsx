import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fresh Farm Produce — Buy Directly from Farmers",
  description:
    "Shop fresh vegetables, fruits, grains and more online. Verified local Indian farmers. Fair prices with GST included. Fast home delivery. Browse 100+ fresh products listed daily.",
  keywords: [
    "buy vegetables online India",
    "fresh fruits online",
    "farm produce delivery",
    "organic vegetables online",
    "fresh grains pulses online",
    "buy direct from farmer India",
  ],
  openGraph: {
    title: "Fresh Farm Produce — Agrenza Shop",
    description:
      "Shop fresh vegetables, fruits, grains directly from verified local Indian farmers. GST included, no middlemen.",
    url: "https://agrenza.com/shop",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Fresh Farm Produce — Agrenza Shop",
    description:
      "Shop fresh vegetables, fruits, grains directly from verified local Indian farmers.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
