"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        {/* Brand Column */}
        <div>
          <p className="logo">
            <img src="/agrenza-logo-small.jpg" alt="Agrenza Logo" width={32} height={32} className="footer-logo-img" style={{ width: "32px", height: "32px" }} />
            <span>Agren<span>za</span></span>
          </p>
          <p className="tag">Connecting farmers directly with buyers.<br />Fresh produce, fair prices, no middlemen.</p>
          <p className="tagline">🌱 Farm to Doorstep — Since 2026</p>
        </div>

        {/* Quick Links */}
        <div>
          <p className="head">Quick Links</p>
          <Link href="/shop">Shop Products</Link>
          <Link href="/offers">Offers & Discounts</Link>
          <Link href="/about">About Agrenza</Link>
          <Link href="/auth/farmer-register">Become a Farmer Partner</Link>
          <Link href="/auth/buyer-register">Create Buyer Account</Link>
        </div>

        {/* Support */}
        <div>
          <p className="head">Support</p>
          <Link href="/contact">Contact Us</Link>
          <a href="mailto:support@agrenza.com">support@agrenza.com</a>
          <a href="tel:1800000000">1800-000-000 (Toll Free)</a>
          <p className="hours">Mon–Sat · 9 AM to 6 PM IST</p>
        </div>

        {/* Legal */}
        <div>
          <p className="head">Legal</p>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>

      <div className="footer-bottom container">
        <p className="rights">© 2026 Agrenza. All rights reserved.</p>
        <p className="rights-sub">A farm-to-doorstep marketplace · Made in India 🇮🇳</p>
      </div>

      <style jsx>{`
        .footer {
          background: var(--soil);
          color: #d9d2bd;
          padding: 60px 0 24px;
          margin-top: 40px;
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 32px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(232, 163, 61, 0.15);
        }
        .logo {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.3rem;
          color: #efe8d8;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-logo-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--turmeric);
        }
        .logo span { color: var(--turmeric); }
        .tag {
          font-size: 0.88rem;
          line-height: 1.6;
          color: #b7b09a;
          max-width: 260px;
        }
        .tagline {
          font-size: 0.8rem;
          color: #7a7364;
          margin-top: 8px;
        }
        .head {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--turmeric);
          margin: 0 0 14px;
        }
        .footer-inner a {
          display: block;
          font-size: 0.88rem;
          margin-bottom: 9px;
          color: #d9d2bd;
          text-decoration: none;
        }
        .footer-inner a:hover { color: var(--turmeric); }
        .hours {
          font-size: 0.78rem;
          color: #7a7364;
          margin-top: 6px;
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          padding-top: 20px;
        }
        .rights {
          font-size: 0.78rem;
          color: #8a836f;
          margin: 0;
        }
        .rights-sub {
          font-size: 0.75rem;
          color: #7a7364;
          margin: 0;
        }
        @media (max-width: 860px) {
          .footer-inner { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .footer-inner { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>
    </footer>
  );
}
