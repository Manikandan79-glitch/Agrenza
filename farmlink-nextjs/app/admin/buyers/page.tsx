"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { getMe, adminListBuyers, ApiError, AdminBuyer } from "@/app/lib/api";

export default function AdminBuyersPage() {
  const router = useRouter();
  const [buyers, setBuyers] = useState<AdminBuyer[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (!me.user || me.user.role !== "admin") {
          router.replace("/auth/admin-login");
          return;
        }
        setChecking(false);
        const res = await adminListBuyers();
        setBuyers(res.buyers || []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load buyers.");
        setChecking(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const filtered = buyers.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.mobile.includes(q) ||
      (b.email && b.email.toLowerCase().includes(q))
    );
  });

  if (checking) return null;

  return (
    <div className="buyers-wrap">
      <AdminNav />
      <main className="container" style={{ padding: "32px 16px 80px" }}>
        <div className="head">
          <div>
            <h1>Registered Buyers</h1>
            <p className="subtitle">All active customer accounts in the database ({buyers.length} total)</p>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="err-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-state">Loading buyers list...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No buyers match your search.</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="buyers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Buyer Name</th>
                  <th>Phone Number</th>
                  <th>Email Address</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="id-cell">#{b.id}</td>
                    <td className="name-cell">
                      <div className="name-bold">{b.name}</div>
                    </td>
                    <td>
                      <a href={`tel:${b.mobile}`} className="tel-link">
                        📞 {b.mobile}
                      </a>
                    </td>
                    <td className="email-cell">{b.email || "—"}</td>
                    <td>
                      <span className="order-pill">{b.total_orders} orders</span>
                    </td>
                    <td className="spent-cell">
                      ₹{b.total_spent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="date-cell">
                      {new Date(b.joined).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <span className="badge-active">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style jsx>{`
        .buyers-wrap {
          min-height: 100vh;
          background: #fbfbf9;
        }
        .head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        h1 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          color: #1b4332;
          margin: 0;
        }
        .subtitle {
          color: #666;
          margin: 4px 0 0;
          font-size: 0.95rem;
        }
        .search-input {
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 0.92rem;
          min-width: 260px;
          outline: none;
        }
        .search-input:focus {
          border-color: #2d6a4f;
        }
        .err-box {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
        }
        .loading-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .table-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .buyers-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.92rem;
        }
        .buyers-table th {
          background: #f8fafc;
          padding: 14px 18px;
          color: #475569;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .buyers-table td {
          padding: 16px 18px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .buyers-table tr:last-child td {
          border-bottom: none;
        }
        .buyers-table tr:hover td {
          background: #fcfdfd;
        }
        .id-cell {
          font-family: var(--font-mono);
          color: #64748b;
          font-size: 0.82rem;
        }
        .name-bold {
          font-weight: 700;
          color: #0f172a;
          text-transform: capitalize;
        }
        .tel-link {
          color: #1b4332;
          text-decoration: none;
          font-weight: 500;
        }
        .tel-link:hover {
          text-decoration: underline;
        }
        .email-cell {
          color: #475569;
          font-size: 0.88rem;
        }
        .order-pill {
          background: #ecfdf5;
          color: #065f46;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .spent-cell {
          font-weight: 700;
          color: #166534;
        }
        .date-cell {
          color: #64748b;
          font-size: 0.85rem;
          white-space: nowrap;
        }
        .badge-active {
          background: #dcfce7;
          color: #15803d;
          font-size: 0.78rem;
          padding: 3px 10px;
          border-radius: 999px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
