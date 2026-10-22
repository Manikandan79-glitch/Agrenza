import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fresh Farm Offers & Discount Coupons",
  description:
    "Exclusive discounts and coupon codes on fresh farm produce. Save on vegetables, fruits and organic food at Agrenza. New deals added daily from verified farmers.",
  keywords: [
    "farm produce offers",
    "vegetable discount coupons India",
    "fresh food deals",
    "organic food discount",
    "FRESHFARM10 coupon",
    "free delivery vegetables",
  ],
  openGraph: {
    title: "Fresh Farm Offers & Discounts — Agrenza",
    description:
      "Exclusive discounts on fresh farm produce. Save on vegetables, fruits and organic food. New deals added daily.",
    url: "https://agrenza.com/offers",
    type: "website",
  },
};

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
