"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/app/components/AdminNav";
import { getMe, adminStats, ApiError } from "@/app/lib/api";

type Stats = Awaited<ReturnType<typeof adminStats>>;

// Quick preset options
const PRESETS = [
  { label: "Today",    days: 0 },
  { label: "Last 4d",  days: 4 },
  { label: "Last 5d",  days: 5 },
  { label: "Last 10d", days: 10 },
  { label: "Last 20d", days: 20 },
  { label: "Last 30d", days: 30 },
  { label: "Last 60d", days: 60 },
  { label: "Last 90d", days: 90 },
  { label: "All Time", days: -1 },
];

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDisplay(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  // Filter state
  const today = toYMD(new Date());
  const [activePreset, setActivePreset] = useState<number>(-1); // -1 = All Time
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]   = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchStats = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const s = await adminStats(from, to);
      setStats(s);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (!me.user || me.user.role !== "admin") {
          router.replace("/auth/admin-login");
          return;
        }
        setChecking(false);
        await fetchStats(); // default: all time
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load dashboard.");
        setChecking(false);
      }
    })();
  }, [router, fetchStats]);

  function applyPreset(days: number) {
    setActivePreset(days);
    setShowCalendar(false);
    if (days === -1) {
      setFromDate("");
      setToDate("");
      fetchStats();
    } else if (days === 0) {
      fetchStats(today, today);
      setFromDate(today);
      setToDate(today);
    } else {
      const from = new Date();
      from.setDate(from.getDate() - days);
      const f = toYMD(from);
      setFromDate(f);
      setToDate(today);
      fetchStats(f, today);
    }
  }

  function applyCustomRange() {
    if (!fromDate || !toDate) return;
    setActivePreset(-99); // custom
    fetchStats(fromDate, toDate);
    setShowCalendar(false);
  }

  function clearFilter() {
    setActivePreset(-1);
    setFromDate("");
    setToDate("");
    setShowCalendar(false);
    fetchStats();
  }

  const isFiltered = activePreset !== -1;
  const filterLabel = isFiltered
    ? (activePreset === -99
        ? `${formatDisplay(fromDate)} — ${formatDisplay(toDate)}`
        : (activePreset === 0 ? "Today" : `Last ${activePreset} days`))
    : "All Time";

  if (checking) return null;

  return (
    <>
      <AdminNav />
      <div className="container dash-wrap">
        <div className="header-row">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subhead">Overview of revenue, farmer verifications, and product approvals</p>
          </div>
          <Link href="/admin/orders" className="btn-income-action">
            💰 View Orders &amp; Income →
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        {/* ── DATE FILTER SECTION ───────────────────────────────── */}
        <div className="filter-section">
          <div className="filter-header">
            <span className="filter-title">📅 Filter by Date</span>
            <span className={`filter-badge ${isFiltered ? "active" : ""}`}>
              {filterLabel}
              {loading && <span className="spin-dot"> ⟳</span>}
            </span>
          </div>

          {/* Quick presets */}
          <div className="preset-row">
            {PRESETS.map(p => (
              <button
                key={p.days}
                className={`preset-btn ${activePreset === p.days ? "selected" : ""}`}
                onClick={() => applyPreset(p.days)}
                disabled={loading}
              >
                {p.label}
              </button>
            ))}
            <button
              className={`preset-btn calendar-btn ${activePreset === -99 ? "selected" : ""}`}
              onClick={() => setShowCalendar(!showCalendar)}
              disabled={loading}
            >
              📆 Custom Range
            </button>
            {isFiltered && (
              <button className="clear-btn" onClick={clearFilter}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Custom date range picker */}
          {showCalendar && (
            <div className="calendar-panel">
              <div className="cal-row">
                <div className="cal-field">
                  <label>From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || today}
                    onChange={e => setFromDate(e.target.value)}
                  />
                </div>
                <div className="cal-arrow">→</div>
                <div className="cal-field">
                  <label>To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    max={today}
                    onChange={e => setToDate(e.target.value)}
                  />
                </div>
                <button
                  className="apply-btn"
                  onClick={applyCustomRange}
                  disabled={!fromDate || !toDate || loading}
                >
                  Apply →
                </button>
              </div>
              {fromDate && toDate && (
                <p className="cal-preview">
                  Showing data from <strong>{formatDisplay(fromDate)}</strong> to <strong>{formatDisplay(toDate)}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {stats && (
          <>
            {/* Financial Overview */}
            <h2 className="section-title">Financial &amp; Income Overview</h2>
            <div className="income-grid">
              <div className="income-card primary">
                <span className="label">Total Platform Sales (Income)</span>
                <strong className="amount">
                  ₹{(stats.total_income || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
                <span className="desc">
                  {isFiltered ? `Sales in selected period` : "Gross volume from buyer orders"}
                </span>
              </div>
              <div className="income-card commission">
                <span className="label">Platform Earnings (5% fee)</span>
                <strong className="amount">
                  ₹{(stats.platform_earnings || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
                <span className="desc">
                  {isFiltered ? `Earnings in selected period` : "Estimated revenue on completed sales"}
                </span>
              </div>
              <div className="income-card today">
                <span className="label">Today&apos;s Income</span>
                <strong className="amount">
                  ₹{(stats.today_income || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
                <span className="desc">Total sales recorded today</span>
              </div>
              <div className="income-card orders">
                <span className="label">
                  {isFiltered ? "Orders in Period" : "Total Orders"}
                </span>
                <strong className="amount">{stats.total_orders || 0}</strong>
                <span className="desc">{stats.completed_orders || 0} completed / delivered</span>
              </div>
            </div>

            {/* Pending Approvals */}
            <h2 className="section-title">Pending Approvals</h2>
            <div className="stats">
              <Link href="/admin/farmers" className="stat rust">
                <span>Farmers awaiting approval</span>
                <strong>{stats.pending_farmers}</strong>
                <span className="action-hint">Review &amp; Approve Farmers →</span>
              </Link>
              <Link href="/admin/products" className="stat gold">
                <span>Products awaiting approval</span>
                <strong>{stats.pending_products}</strong>
                <span className="action-hint">Review &amp; Approve Products →</span>
              </Link>
              <Link href="/admin/bulk-requests" className="stat green">
                <span>Bulk requests pending</span>
                <strong>{stats.pending_bulk}</strong>
                <span className="action-hint">Review Buyer Bulk Requests →</span>
              </Link>
            </div>

            {/* Platform Totals */}
            <h2 className="section-title">Platform Stats</h2>
            <div className="stats totals">
              <div className="stat mini">
                <span>Total Registered Farmers</span>
                <strong>{stats.total_farmers}</strong>
              </div>
              <div className="stat mini">
                <span>Total Registered Buyers</span>
                <strong>{stats.total_buyers}</strong>
              </div>
              <Link href="/admin/shared-emails" className="stat mini clickable">
                <span>Same Gmail / Mobile (Farmer &amp; Buyer)</span>
                <strong>{stats.shared_gmail_count || 0}</strong>
                <span className="live-note">View Dual-Role Accounts →</span>
              </Link>
              <div className="stat mini">
                <span>Total Products Listed</span>
                <strong>{stats.total_products}</strong>
                <span className="live-note">{stats.approved_products || 0} live on website</span>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .dash-wrap { padding: 40px 24px 90px; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.8rem; margin: 0 0 6px; }
        .subhead { color: #6b6555; font-size: 0.9rem; margin: 0; }
        .btn-income-action {
          background: var(--soil); color: #efe8d8; padding: 10px 18px; border-radius: 999px;
          text-decoration: none; font-size: 0.88rem; font-weight: 600;
          transition: background 0.15s ease;
        }
        .btn-income-action:hover { background: #3d3b32; color: #fff; }

        /* ── Filter Section ── */
        .filter-section {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 8px;
        }
        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .filter-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: #16241a;
        }
        .filter-badge {
          font-size: 0.8rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #64748b;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
        }
        .filter-badge.active {
          background: #f0fdf4;
          color: #166534;
          border-color: #86efac;
        }
        .spin-dot { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .preset-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .preset-btn {
          padding: 7px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          border: 1.5px solid #d1d5db;
          border-radius: 999px;
          background: #fff;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .preset-btn:hover:not(:disabled) {
          border-color: #2e7d32;
          color: #2e7d32;
          background: #f0fdf4;
        }
        .preset-btn.selected {
          background: #2e7d32;
          color: #fff;
          border-color: #2e7d32;
        }
        .preset-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .calendar-btn { border-style: dashed; }
        .clear-btn {
          padding: 7px 14px;
          font-size: 0.82rem;
          font-weight: 700;
          border: 1.5px solid #fca5a5;
          border-radius: 999px;
          background: #fff;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.15s;
        }
        .clear-btn:hover { background: #fef2f2; border-color: #dc2626; }

        /* Calendar panel */
        .calendar-panel {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }
        .cal-row {
          display: flex;
          align-items: flex-end;
          gap: 14px;
          flex-wrap: wrap;
        }
        .cal-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .cal-field label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #374151;
        }
        .cal-field input[type="date"] {
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.88rem;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.15s;
          cursor: pointer;
          min-width: 160px;
        }
        .cal-field input[type="date"]:focus {
          border-color: #2e7d32;
          box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
        }
        .cal-arrow {
          font-size: 1.2rem;
          color: #9ca3af;
          padding-bottom: 8px;
        }
        .apply-btn {
          background: #2e7d32;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .apply-btn:hover:not(:disabled) { background: #1b5e20; }
        .apply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cal-preview {
          margin-top: 10px;
          font-size: 0.82rem;
          color: #6b7280;
        }

        .section-title {
          font-family: var(--font-display); font-size: 1.15rem; font-weight: 700;
          margin: 32px 0 14px; color: var(--soil);
        }

        .income-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px; margin-bottom: 12px;
        }
        .income-card {
          border-radius: 14px; padding: 22px 24px; display: flex; flex-direction: column; gap: 6px;
          border: 1px solid rgba(26,26,21,0.08); background: #fff;
        }
        .income-card.primary {
          background: linear-gradient(135deg, #2b4c2b 0%, #1c361c 100%);
          color: #fff; border: none;
        }
        .income-card.primary .label { color: #d4ebd4; }
        .income-card.primary .amount { color: #a3e635; }
        .income-card.primary .desc { color: #c0dac0; }
        .income-card.commission {
          background: linear-gradient(135deg, #f7f3e8 0%, #efe7d3 100%);
          border-color: rgba(232,163,61,0.35);
        }
        .income-card.commission .amount { color: var(--rust); }
        .income-card.today { background: #faf8f5; }
        .income-card.today .amount { color: var(--soil); }
        .income-card.orders { background: #faf8f5; }
        .income-card.orders .amount { color: #2563eb; }
        .income-card .label { font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #6b6555; }
        .income-card .amount { font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; }
        .income-card .desc { font-size: 0.76rem; color: #888273; }

        .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        .stat { border-radius: 14px; padding: 20px 22px; color: #fff; display: flex; flex-direction: column; gap: 6px; text-decoration: none; transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
        .stat span { font-size: 0.82rem; opacity: 0.9; }
        .stat strong { font-family: var(--font-display); font-size: 2rem; }
        .stat .action-hint { font-size: 0.74rem; opacity: 0.85; margin-top: 6px; font-weight: 600; }
        .stat.green { background: var(--leaf); }
        .stat.gold { background: var(--turmeric); color: #1a1a15; }
        .stat.rust { background: var(--rust); }
        .stats.totals { margin-top: 8px; }
        .stat.mini { background: #fff; border: 1px solid rgba(26,26,21,0.08); color: var(--ink); }
        .stat.mini:hover { transform: none; box-shadow: none; }
        .stat.mini strong { color: var(--soil); font-size: 1.6rem; }
        .live-note { font-size: 0.74rem; color: var(--leaf); font-weight: 600; margin-top: 4px; }
        @media (max-width: 768px) {
          .stats { grid-template-columns: 1fr; }
          .income-grid { grid-template-columns: 1fr; }
          .cal-row { flex-direction: column; align-items: stretch; }
          .cal-arrow { display: none; }
          .preset-row { gap: 6px; }
        }
      `}</style>
    </>
  );
}
