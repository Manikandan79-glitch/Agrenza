"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/app/lib/api";

const TABS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/farmers", label: "Farmers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/bulk-requests", label: "Bulk Requests" },
  { href: "/admin/orders", label: "Orders & Income" },
  { href: "/admin/shared-emails", label: "Shared Accounts (Farmer & Buyer)" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      router.push("/auth/admin-login");
    }
  }

  return (
    <header className="anav">
      <div className="container anav-top">
        <Link href="/" className="logo">
          <img src="/agrenza-logo-small.jpg" alt="Agrenza Logo" width={34} height={34} className="logo-img" style={{ width: "34px", height: "34px" }} />
          <span>Agren<span>za</span></span>
        </Link>
        <span className="role-tag">Admin Panel</span>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
      <div className="container anav-tabs">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={pathname?.startsWith(t.href) ? "active" : ""}>
            {t.label}
          </Link>
        ))}
      </div>

      <style jsx>{`
        .anav { background: var(--soil); border-bottom: 1px solid rgba(232,163,61,0.18); }
        .anav-top { display: flex; align-items: center; gap: 12px; height: 60px; }
        .logo { font-family: var(--font-display); font-weight: 900; font-size: 1.3rem; color: #efe8d8; display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .logo-img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--turmeric); }
        .logo span { color: var(--turmeric); }
        .role-tag { font-family: var(--font-mono); font-size: 0.72rem; color: var(--turmeric); background: rgba(232,163,61,0.14); padding: 3px 10px; border-radius: 999px; }
        .logout { margin-left: auto; background: none; border: 1px solid rgba(232,163,61,0.4); color: #efe8d8; font-size: 0.8rem; padding: 6px 14px; border-radius: 999px; cursor: pointer; }
        .logout:hover { background: rgba(232,163,61,0.14); }
        .anav-tabs { display: flex; gap: 4px; padding-bottom: 0; }
        .anav-tabs a {
          color: #cfc8b4; font-size: 0.88rem; padding: 12px 16px;
          border-bottom: 2px solid transparent;
        }
        .anav-tabs a.active { color: var(--turmeric); border-bottom-color: var(--turmeric); }
        .anav-tabs a:hover { color: #efe8d8; }
      `}</style>
    </header>
  );
}
