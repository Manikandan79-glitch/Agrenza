"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FarmerNav from "@/app/components/FarmerNav";
import { getMe, farmerDashboardStats, AuthUser } from "@/app/lib/api";

export default function FarmerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<{
    product_count: number;
    total_earnings: number;
    pending_orders: number;
    low_stock: { name: string; stock: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (!me?.user || me.user.role !== "farmer") {
          router.replace("/auth/login");
          return;
        }
        setUser(me.user);

        try {
          const s = await farmerDashboardStats();
          setStats(s);
        } catch {
          // Stats failed but user is logged in — show zeros
          setStats({ product_count: 0, total_earnings: 0, pending_orders: 0, low_stock: [] });
        }
      } catch {
        setError("Session expired. Please log in again.");
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <>
        <FarmerNav />
        <div className="container dash-wrap">
          <p style={{ color: "#64748b", marginTop: 40 }}>⏳ Loading your dashboard…</p>
        </div>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <FarmerNav />
        <div className="container dash-wrap">
          <p style={{ color: "#dc2626" }}>⚠️ {error || "Unable to load dashboard."}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <FarmerNav />
      <div className="container dash-wrap">
        <h1>Welcome, {user.name} 👋</h1>

        <div className="stats">
          <div className="stat green">
            <span>Total Products</span>
            <strong>{stats?.product_count ?? 0}</strong>
          </div>
          <div className="stat gold">
            <span>Total Earnings</span>
            <strong>₹{(stats?.total_earnings ?? 0).toFixed(2)}</strong>
          </div>
          <div className="stat rust">
            <span>Pending Orders</span>
            <strong>{stats?.pending_orders ?? 0}</strong>
          </div>
        </div>

        {(stats?.low_stock ?? []).length > 0 && (
          <div className="low-stock-card">
            <h3>⚠️ Low stock alert</h3>
            <ul>
              {stats!.low_stock.map((p, i) => (
                <li key={i}>
                  <span>{p.name}</span>
                  <span className="qty">{p.stock} kg left</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="actions-card">
          <h3>Quick actions</h3>
          <div className="actions">
            <Link href="/farmer/products/new" className="btn-solid">+ Add new product</Link>
            <Link href="/farmer/orders" className="btn-outline">View orders</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dash-wrap { padding: 40px 24px 90px; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.7rem; margin: 0 0 26px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 26px; }
        .stat {
          border-radius: 14px; padding: 20px 22px; color: #fff;
          display: flex; flex-direction: column; gap: 8px;
        }
        .stat span { font-size: 0.82rem; opacity: 0.85; }
        .stat strong { font-family: var(--font-display); font-size: 1.6rem; }
        .stat.green { background: var(--leaf); }
        .stat.gold { background: var(--turmeric); color: #1a1a15; }
        .stat.rust { background: var(--rust); }
        .low-stock-card, .actions-card {
          background: #fff; border: 1px solid rgba(26,26,21,0.08);
          border-radius: 14px; padding: 22px; margin-bottom: 20px;
        }
        .low-stock-card h3, .actions-card h3 { font-family: var(--font-display); font-size: 1.05rem; margin: 0 0 14px; }
        .low-stock-card ul { list-style: none; margin: 0; padding: 0; }
        .low-stock-card li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(26,26,21,0.06); font-size: 0.9rem; }
        .low-stock-card li:last-child { border-bottom: none; }
        .qty { color: var(--chili); font-weight: 600; }
        .actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-solid { background: var(--soil); color: var(--paper); padding: 11px 20px; border-radius: 999px; font-size: 0.88rem; font-weight: 600; }
        .btn-outline { border: 1px solid rgba(26,26,21,0.18); padding: 11px 20px; border-radius: 999px; font-size: 0.88rem; }
        @media (max-width: 640px) { .stats { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
