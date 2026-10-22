"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

const ALL_OFFERS = [
  {
    code: "FRESHFARM10",
    title: "10% Harvest Season Discount",
    desc: "Get 10% instant discount on all fresh vegetables and fruits directly from verified local farms.",
    minOrder: "₹299",
    tag: "MOST POPULAR",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    expiry: "Active All Season",
  },
  {
    code: "ORGANIC20",
    title: "20% OFF Organic Greens & Herbs",
    desc: "Special discount on all certified chemical-free leafy vegetables, spinach, coriander, and mint.",
    minOrder: "₹199",
    tag: "VEGGIE SPECIAL",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
    expiry: "Valid this week",
  },
  {
    code: "FREESHIP",
    title: "100% Free Doorstep Delivery",
    desc: "Enjoy zero delivery fee on all direct farm produce orders delivered fresh within 24-48 hours.",
    minOrder: "₹499",
    tag: "ZERO SHIPPING",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    expiry: "No Expiry",
  },
  {
    code: "FIRSTHARVEST",
    title: "Flat ₹50 Welcome Discount",
    desc: "Exclusive welcome gift for your first harvest order on the Agrenza marketplace.",
    minOrder: "₹250",
    tag: "NEW BUYER",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    expiry: "First Order Only",
  },
  {
    code: "BULKSAVER15",
    title: "15% Direct Wholesale Discount",
    desc: "Save 15% when purchasing 5kg or more for restaurants, hotels, hostels, or large families.",
    minOrder: "5 kg",
    tag: "WHOLESALE",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    expiry: "Ongoing",
  },
  {
    code: "FARMDIRECT5",
    title: "5% Extra Cashback on Online UPI",
    desc: "Pay seamlessly with Google Pay, PhonePe, or Paytm UPI and enjoy an instant 5% cashback discount.",
    minOrder: "₹150",
    tag: "UPI OFFER",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    expiry: "Valid on all online payments",
  },
];

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <>
      <Nav />
      <div className="offers-hero">
        <div className="container">
          <span className="eyebrow">🏷️ Special Promotions &amp; Coupons</span>
          <h1>Buyer Discounts &amp; Farm Offers</h1>
          <p className="lead">
            Save more on 100% organic harvest directly from local Tamil Nadu farmers with our verified coupon codes!
          </p>
        </div>
      </div>

      <div className="container offers-body">
        <div className="how-it-works-banner">
          <div className="step-item">
            <span className="step-num">1</span>
            <div>
              <strong>Pick a Coupon</strong>
              <p>Choose any active discount code below and click &ldquo;Copy Code&rdquo;.</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-num">2</span>
            <div>
              <strong>Add Produce to Cart</strong>
              <p>Explore tomatoes, carrots, greens, and fruits in the Farm Shop.</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-num">3</span>
            <div>
              <strong>Apply at Checkout</strong>
              <p>Paste the coupon code during checkout to claim your instant savings!</p>
            </div>
          </div>
        </div>

        <div className="offers-grid">
          {ALL_OFFERS.map((offer) => (
            <div
              className="offer-card"
              key={offer.code}
              style={{ background: offer.bg, borderColor: offer.border }}
            >
              <div className="offer-header">
                <span className="offer-tag" style={{ background: offer.color }}>
                  {offer.tag}
                </span>
                <span className="min-order">Min Order: {offer.minOrder}</span>
              </div>

              <h3 className="offer-title">{offer.title}</h3>
              <p className="offer-desc">{offer.desc}</p>
              <div className="offer-expiry">⏳ {offer.expiry}</div>

              <div className="offer-bottom">
                <div className="coupon-code-pill">
                  <span className="code-text">{offer.code}</span>
                  <button
                    type="button"
                    className="btn-copy-code"
                    onClick={() => handleCopy(offer.code)}
                  >
                    {copiedCode === offer.code ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>

                <Link href="/shop" className="btn-shop-link">
                  Shop Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .offers-hero { background: #16241a; color: #ffffff; padding: 60px 0 50px; text-align: center; }
        .eyebrow { font-size: 0.82rem; font-weight: 800; color: #4ade80; text-transform: uppercase; letter-spacing: 0.08em; display: inline-block; margin-bottom: 8px; }
        .offers-hero h1 { font-family: var(--font-display); font-size: 2.3rem; margin: 0 0 10px; color: #ffffff; }
        .lead { color: #cbd5e1; font-size: 1.05rem; max-width: 680px; margin: 0 auto; }

        .offers-body { padding: 40px 24px 80px; }

        .how-it-works-banner { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 36px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        @media (max-width: 768px) {
          .how-it-works-banner { grid-template-columns: 1fr; }
        }

        .step-item { display: flex; align-items: flex-start; gap: 14px; }
        .step-num { width: 32px; height: 32px; border-radius: 50%; background: #16a34a; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.88rem; flex-shrink: 0; }
        .step-item strong { display: block; font-size: 0.95rem; color: #0f172a; margin-bottom: 2px; }
        .step-item p { margin: 0; font-size: 0.82rem; color: #64748b; line-height: 1.4; }

        .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 22px; }
        .offer-card { border-radius: 14px; border: 1.5px solid; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; }
        .offer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .offer-tag { color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.04em; }
        .min-order { font-size: 0.78rem; color: #64748b; font-weight: 600; }
        .offer-title { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
        .offer-desc { font-size: 0.86rem; color: #475569; line-height: 1.5; margin: 0 0 12px; flex: 1; }
        .offer-expiry { font-size: 0.76rem; color: #64748b; margin-bottom: 16px; font-weight: 600; }

        .offer-bottom { display: flex; justify-content: space-between; align-items: center; gap: 10px; border-top: 1px dashed rgba(0,0,0,0.14); padding-top: 16px; flex-wrap: wrap; }
        .coupon-code-pill { display: inline-flex; align-items: center; background: #ffffff; border: 1.5px dashed #94a3b8; border-radius: 6px; padding: 5px 12px; gap: 10px; }
        .code-text { font-family: var(--font-mono); font-weight: 800; color: #0f172a; font-size: 0.95rem; letter-spacing: 0.05em; }
        .btn-copy-code { background: none; border: none; font-size: 0.78rem; font-weight: 700; color: #16a34a; cursor: pointer; padding: 2px 4px; }
        .btn-shop-link { font-size: 0.86rem; font-weight: 700; color: #16a34a; text-decoration: none; }
        .btn-shop-link:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}
