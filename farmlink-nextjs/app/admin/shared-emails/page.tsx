"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/app/components/AdminNav";
import { getMe, adminSharedEmails, SharedEmailAccount, ApiError } from "@/app/lib/api";

export default function SharedEmailsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SharedEmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (!me.user || me.user.role !== "admin") {
          router.replace("/auth/admin-login");
          return;
        }

        const res = await adminSharedEmails();
        setAccounts(res.shared_accounts || []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load shared accounts.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter((a) => {
      return (
        a.email.toLowerCase().includes(q) ||
        (a.mobile && a.mobile.includes(q)) ||
        a.farmer.name.toLowerCase().includes(q) ||
        a.farmer.mobile.includes(q) ||
        (a.farmer.email && a.farmer.email.toLowerCase().includes(q)) ||
        a.buyer.name.toLowerCase().includes(q) ||
        a.buyer.mobile.includes(q) ||
        (a.buyer.email && a.buyer.email.toLowerCase().includes(q))
      );
    });
  }, [accounts, search]);

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="container page-wrap">
          <p className="loading-text">Loading shared accounts list…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="container page-wrap">
        <div className="header-row">
          <div>
            <h1>Shared Accounts (Farmer &amp; Buyer)</h1>
            <p className="subhead">
              Users who share the same Gmail ID or Mobile number for both their Farmer and Buyer accounts on Agrenza.
            </p>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        {/* STATS OVERVIEW */}
        <div className="stats-row">
          <div className="stat-card primary">
            <span className="stat-label">Total Shared Accounts</span>
            <strong className="stat-val">{accounts.length}</strong>
            <span className="stat-desc">Same email or mobile in 2 roles</span>
          </div>
          <div className="stat-card farmer">
            <span className="stat-label">Linked Farmer Accounts</span>
            <strong className="stat-val">{accounts.length}</strong>
            <span className="stat-desc">Producers with dual registrations</span>
          </div>
          <div className="stat-card buyer">
            <span className="stat-label">Linked Buyer Accounts</span>
            <strong className="stat-val">{accounts.length}</strong>
            <span className="stat-desc">Consumers with dual registrations</span>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search by Gmail address, mobile number, or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="count-badge">{filtered.length} Accounts Found</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-box">
            <span className="empty-icon">✉️</span>
            <h3>No Dual-Role Accounts Found</h3>
            <p>
              {search
                ? `No accounts matched "${search}". Try another search term.`
                : "There are currently no users registered with the same Gmail ID or Mobile Number as both a Farmer and a Buyer."}
            </p>
          </div>
        ) : (
          <div className="accounts-grid">
            {filtered.map((item, idx) => (
              <div key={item.email + "_" + item.mobile + "_" + idx} className="shared-card">
                <div className="card-header">
                  <div className="email-badge">
                    <span className="gmail-icon">📧</span>
                    <strong className="email-text">{item.email}</strong>
                    {item.mobile && (
                      <span className="mobile-pill">📱 {item.mobile}</span>
                    )}
                  </div>
                  <span className="dual-pill">
                    {item.shared_by === "both"
                      ? "Same Gmail + Mobile"
                      : item.shared_by === "mobile"
                      ? "Same Mobile Number"
                      : "Same Gmail Address"}
                  </span>
                </div>

                <div className="card-body">
                  {/* FARMER PROFILE */}
                  <div className="profile-col farmer-col">
                    <div className="role-title">
                      <span>🌾 Farmer Profile</span>
                      <span className={`status-badge ${item.farmer.status}`}>
                        {item.farmer.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="info-list">
                      <div className="info-item">
                        <span className="label">Name:</span>
                        <strong>{item.farmer.name}</strong>
                      </div>
                      <div className="info-item">
                        <span className="label">Email:</span>
                        <span>{item.farmer.email || "—"}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Mobile:</span>
                        <span>{item.farmer.mobile}</span>
                      </div>
                      {item.farmer.aadhaar && (
                        <div className="info-item">
                          <span className="label">Aadhaar:</span>
                          <span className="mono">•••• •••• {item.farmer.aadhaar.slice(-4)}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="label">Products:</span>
                        <span>{item.farmer.total_products} items listed</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Sales:</span>
                        <strong className="green-text">
                          ₹{item.farmer.total_sales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="info-item">
                        <span className="label">Registered:</span>
                        <span className="muted-date">
                          {new Date(item.farmer.joined).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div className="col-divider"></div>

                  {/* BUYER PROFILE */}
                  <div className="profile-col buyer-col">
                    <div className="role-title">
                      <span>🛒 Buyer Profile</span>
                      <span className="status-badge approved">ACTIVE</span>
                    </div>

                    <div className="info-list">
                      <div className="info-item">
                        <span className="label">Name:</span>
                        <strong>{item.buyer.name}</strong>
                      </div>
                      <div className="info-item">
                        <span className="label">Email:</span>
                        <span>{item.buyer.email || "—"}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Mobile:</span>
                        <span>{item.buyer.mobile}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Orders:</span>
                        <span>{item.buyer.total_orders} orders placed</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Spent:</span>
                        <strong className="blue-text">
                          ₹{item.buyer.total_spent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="info-item">
                        <span className="label">Registered:</span>
                        <span className="muted-date">
                          {new Date(item.buyer.joined).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="note">
                    💡 This user can access both roles — sell harvest on the Farmer Portal and purchase food on the Buyer Portal.
                  </span>
                  <Link href="/admin/farmers" className="btn-manage">
                    Manage Farmers →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-wrap { padding: 40px 24px 90px; }
        .header-row { margin-bottom: 24px; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.8rem; margin: 0 0 6px; }
        .subhead { color: #6b6555; font-size: 0.9rem; margin: 0; }
        .loading-text { font-size: 1rem; color: #6b6555; text-align: center; padding: 60px 0; }
        .form-error { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; }

        /* Stats overview */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          border-radius: 14px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1px solid rgba(26,26,21,0.08);
          background: #fff;
        }
        .stat-card.primary {
          background: linear-gradient(135deg, #2b4c2b 0%, #1c361c 100%);
          color: #fff;
          border: none;
        }
        .stat-card.primary .stat-label { color: #d4ebd4; }
        .stat-card.primary .stat-val { color: #a3e635; }
        .stat-card.primary .stat-desc { color: #c0dac0; }

        .stat-card.farmer {
          background: linear-gradient(135deg, #fefce8 0%, #fef08a 100%);
          border-color: #fde047;
        }
        .stat-card.farmer .stat-label { color: #854d0e; }
        .stat-card.farmer .stat-val { color: #a16207; }
        .stat-card.farmer .stat-desc { color: #713f12; }

        .stat-card.buyer {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-color: #bfdbfe;
        }
        .stat-card.buyer .stat-label { color: #1e40af; }
        .stat-card.buyer .stat-val { color: #2563eb; }
        .stat-card.buyer .stat-desc { color: #1e3a8a; }

        .stat-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .stat-val { font-family: var(--font-display); font-size: 2rem; font-weight: 800; }
        .stat-desc { font-size: 0.74rem; }

        /* Filter bar */
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .search-input {
          flex: 1;
          min-width: 280px;
          max-width: 500px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1.5px solid #cbd5e1;
          background: #fff;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .search-input:focus { border-color: var(--leaf, #2e7d32); }
        .count-badge {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
        }

        /* Empty box */
        .empty-box {
          background: #fff;
          border: 1.5px dashed #cbd5e1;
          border-radius: 16px;
          padding: 60px 24px;
          text-align: center;
          max-width: 540px;
          margin: 40px auto;
        }
        .empty-icon { font-size: 2.8rem; display: block; margin-bottom: 12px; }
        .empty-box h3 { font-size: 1.2rem; margin: 0 0 8px; color: #1e293b; }
        .empty-box p { color: #64748b; font-size: 0.9rem; line-height: 1.5; margin: 0; }

        /* Shared cards */
        .accounts-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .shared-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(0,0,0,0.04);
        }
        .card-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 14px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .email-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .gmail-icon { font-size: 1.2rem; }
        .email-text { font-size: 1.05rem; color: #0f172a; word-break: break-all; }
        .mobile-pill {
          background: #e2e8f0;
          color: #334155;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .dual-pill {
          background: #dcfce7;
          color: #15803d;
          font-size: 0.76rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid #86efac;
          letter-spacing: 0.02em;
        }

        .card-body {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          padding: 24px;
          gap: 20px;
        }
        .profile-col { display: flex; flex-direction: column; gap: 14px; }
        .col-divider {
          width: 1px;
          background: #e2e8f0;
        }
        .role-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 1rem;
          font-weight: 800;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;
        }
        .status-badge {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .status-badge.approved { background: #dcfce7; color: #166534; }
        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .status-badge.rejected { background: #fee2e2; color: #991b1b; }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
          padding: 4px 0;
        }
        .info-item .label { color: #64748b; font-weight: 500; }
        .info-item strong { color: #0f172a; }
        .green-text { color: var(--leaf, #2e7d32); }
        .blue-text { color: #2563eb; }
        .mono { font-family: monospace; font-size: 0.85rem; color: #475569; }
        .muted-date { color: #94a3b8; font-size: 0.82rem; }

        .card-footer {
          background: #fafaf9;
          border-top: 1px solid #e2e8f0;
          padding: 12px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .note { font-size: 0.8rem; color: #64748b; flex: 1; min-width: 250px; }
        .btn-manage {
          background: var(--soil, #1e293b);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-manage:hover { background: #334155; }

        @media (max-width: 768px) {
          .card-body {
            grid-template-columns: 1fr;
          }
          .col-divider {
            height: 1px;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
