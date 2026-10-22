"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/farmer/dashboard", label: "Dashboard" },
  { href: "/farmer/products", label: "My Products" },
  { href: "/farmer/orders", label: "Orders" },
  { href: "/farmer/earnings", label: "Earnings" },
];

export default function FarmerNav() {
  const pathname = usePathname();
  return (
    <header className="fnav">
      <div className="container fnav-top">
        <Link href="/" className="logo">Farm<span>Link</span></Link>
        <span className="role-tag">Farmer Portal</span>
        <Link href="/" className="home-btn" title="Go to Home Page">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Home</span>
        </Link>
      </div>
      <div className="container fnav-tabs">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={pathname?.startsWith(t.href) ? "active" : ""}>
            {t.label}
          </Link>
        ))}
      </div>

      <style jsx>{`
        .fnav { background: var(--soil); border-bottom: 1px solid rgba(232,163,61,0.18); }
        .fnav-top { display: flex; align-items: center; gap: 12px; height: 60px; }
        .logo { font-family: var(--font-display); font-weight: 900; font-size: 1.3rem; color: #efe8d8; }
        .logo span { color: var(--turmeric); }
        .role-tag { font-family: var(--font-mono); font-size: 0.72rem; color: var(--turmeric); background: rgba(232,163,61,0.14); padding: 3px 10px; border-radius: 999px; }
        .home-btn {
          margin-left: auto;
          display: flex; align-items: center; gap: 6px;
          color: #cfc8b4;
          font-size: 0.85rem;
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid rgba(232,163,61,0.25);
          transition: background 0.18s, color 0.18s;
        }
        .home-btn:hover {
          background: rgba(232,163,61,0.15);
          color: var(--turmeric);
        }
        .fnav-tabs { display: flex; gap: 4px; padding-bottom: 0; }
        .fnav-tabs a {
          color: #cfc8b4; font-size: 0.88rem; padding: 12px 16px;
          border-bottom: 2px solid transparent;
        }
        .fnav-tabs a.active { color: var(--turmeric); border-bottom-color: var(--turmeric); }
        .fnav-tabs a:hover { color: #efe8d8; }
      `}</style>
    </header>
  );
}
