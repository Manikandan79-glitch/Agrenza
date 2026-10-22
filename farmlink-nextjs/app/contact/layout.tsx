import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Agrenza",
  description:
    "Get in touch with Agrenza support. Email support@agrenza.com, call 1800-000-000 (Mon–Sat 9 AM to 6 PM IST), or send us a message for order issues, farmer support, or partnerships.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
