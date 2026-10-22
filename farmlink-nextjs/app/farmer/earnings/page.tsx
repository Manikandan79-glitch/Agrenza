"use client";

import { useEffect, useState, useCallback } from "react";
import FarmerNav from "@/app/components/FarmerNav";
import { farmerEarnings, EarningItem } from "@/app/lib/api";

type EarningsData = Awaited<ReturnType<typeof farmerEarnings>>;

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
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtMoney(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EarningsPage() {
  const today = toYMD(new Date());
  const [data, setData]   = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [activePreset, setActivePreset] = useState(-1); // -1 = All Time
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");
  const [showCal,  setShowCal]  = useState(false);

  const fetchData = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await farmerEarnings(from, to);
      setData(res);
    } catch {
      setError("Could not load earnings. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function applyPreset(days: number) {
    setActivePreset(days);
    setShowCal(false);
    if (days === -1) {
      setFromDate(""); setToDate("");
      fetchData();
    } else if (days === 0) {
      setFromDate(today); setToDate(today);
      fetchData(today, today);
    } else {
      const from = new Date();
      from.setDate(from.getDate() - days);
      const f = toYMD(from);
      setFromDate(f); setToDate(today);
      fetchData(f, today);
    }
  }

  function applyCustom() {
    if (!fromDate || !toDate) return;
    setActivePreset(-99);
    fetchData(fromDate, toDate);
    setShowCal(false);
  }

  function clearFilter() {
    setActivePreset(-1);
    setFromDate(""); setToDate("");
    setShowCal(false);
    fetchData();
  }

  const isFiltered = activePreset !== -1;
  const filterLabel = !isFiltered ? "All Time"
    : activePreset === -99 ? `${fmtDate(fromDate)} — ${fmtDate(toDate)}`
    : activePreset === 0   ? "Today"
    : `Last ${activePreset} days`;

  return (
    <>
      <FarmerNav />
      <div className="container earnings-wrap">
        <div className="page-header">
          <h1>My Earnings</h1>
          <span className={`filter-badge ${isFiltered ? "active" : ""}`}>
            📅 {filterLabel}
            {loading && <span className="spin"> ⟳</span>}
          </span>
        </div>

        {error && <div className="err-box">{error}</div>}

        {/* ── Date Filter ─────────────────────────────────────── */}
        <div className="filter-card">
          <div className="filter-label">Filter by Date</div>
          <div className="preset-row">
            {PRESETS.map(p => (
              <button
                key={p.days}
                className={`preset-btn ${activePreset === p.days ? "sel" : ""}`}
                onClick={() => applyPreset(p.days)}
                disabled={loading}
              >
                {p.label}
              </button>
            ))}
            <button
              className={`preset-btn cal-btn ${activePreset === -99 ? "sel" : ""}`}
              onClick={() => setShowCal(!showCal)}
              disabled={loading}
            >
              📆 Custom
            </button>
            {isFiltered && (
              <button className="clear-btn" onClick={clearFilter}>✕ Clear</button>
            )}
          </div>

          {showCal && (
            <div className="cal-panel">
              <div className="cal-row">
                <div className="cal-field">
                  <label>From</label>
                  <input type="date" value={fromDate} max={toDate || today} onChange={e => setFromDate(e.target.value)} />
                </div>
                <span className="cal-arrow">→</span>
                <div className="cal-field">
                  <label>To</label>
                  <input type="date" value={toDate} min={fromDate} max={today} onChange={e => setToDate(e.target.value)} />
                </div>
                <button
                  className="apply-btn"
                  onClick={applyCustom}
                  disabled={!fromDate || !toDate || loading}
                >
                  Apply →
                </button>
              </div>
              {fromDate && toDate && (
                <p className="cal-note">
                  Showing: <strong>{fmtDate(fromDate)}</strong> to <strong>{fmtDate(toDate)}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Stats Cards ─────────────────────────────────────── */}
        {data && (
          <>
            <div className="stats-grid">
              <div className="stat-card green">
                <span className="stat-label">
                  {isFiltered ? "Earnings (Period)" : "Total Earned"}
                </span>
                <strong className="stat-val">₹{fmtMoney(data.total_earned)}</strong>
                <span className="stat-sub">{data.order_count} delivered order{data.order_count !== 1 ? "s" : ""}</span>
              </div>
              <div className="stat-card gold">
                <span className="stat-label">Pending Amount</span>
                <strong className="stat-val">₹{fmtMoney(data.pending_amount)}</strong>
                <span className="stat-sub">In-progress orders</span>
              </div>
              <div className="stat-card blue">
                <span className="stat-label">Today's Earnings</span>
                <strong className="stat-val">₹{fmtMoney(data.today_earned)}</strong>
                <span className="stat-sub">Delivered today</span>
              </div>
            </div>

            {/* ── History Table ───────────────────────────────── */}
            <div className="table-card">
              <div className="table-head">
                <span>Earnings History</span>
                {data.history.length > 0 && (
                  <span className="row-count">{data.history.length} records</span>
                )}
              </div>
              {loading ? (
                <div className="loading-row">Loading...</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Qty (kg)</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.length === 0 && (
                      <tr>
                        <td colSpan={4} className="empty">
                          {isFiltered
                            ? `No delivered orders in ${filterLabel.toLowerCase()}.`
                            : "No delivered orders yet."}
                        </td>
                      </tr>
                    )}
                    {data.history.map((item, i) => (
                      <tr key={i}>
                        <td className="date-col">{fmtDate(item.date)}</td>
                        <td>{item.product_name}</td>
                        <td>{item.qty} kg</td>
                        <td className="amount">₹{fmtMoney(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {data.history.length > 0 && (
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="total-label">Total</td>
                        <td className="amount total-val">₹{fmtMoney(data.total_earned)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .earnings-wrap { padding: 40px 24px 90px; }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; margin: 0; }
        .filter-badge {
          font-size: 0.8rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #64748b;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
        }
        .filter-badge.active { background: #f0fdf4; color: #166534; border-color: #86efac; }
        .spin { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Filter card */
        .filter-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 22px;
        }
        .filter-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 12px;
        }
        .preset-row { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
        .preset-btn {
          padding: 6px 13px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1.5px solid #d1d5db;
          border-radius: 999px;
          background: #fff;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .preset-btn:hover:not(:disabled) { border-color: var(--leaf); color: var(--leaf); background: #f0fdf4; }
        .preset-btn.sel { background: var(--leaf); color: #fff; border-color: var(--leaf); }
        .preset-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .cal-btn { border-style: dashed; }
        .clear-btn {
          padding: 6px 13px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1.5px solid #fca5a5;
          border-radius: 999px;
          background: #fff;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.15s;
        }
        .clear-btn:hover { background: #fef2f2; }

        /* Calendar panel */
        .cal-panel { margin-top: 14px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
        .cal-row { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
        .cal-field { display: flex; flex-direction: column; gap: 4px; }
        .cal-field label { font-size: 0.76rem; font-weight: 600; color: #374151; }
        .cal-field input[type="date"] {
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          padding: 7px 11px;
          font-size: 0.86rem;
          color: #111827;
          background: #fff;
          outline: none;
          min-width: 148px;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .cal-field input[type="date"]:focus { border-color: var(--leaf); box-shadow: 0 0 0 3px rgba(74,163,32,0.1); }
        .cal-arrow { font-size: 1.1rem; color: #9ca3af; padding-bottom: 7px; }
        .apply-btn {
          background: var(--leaf);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .apply-btn:hover:not(:disabled) { background: #2d7a1e; }
        .apply-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cal-note { margin-top: 8px; font-size: 0.8rem; color: #6b7280; }

        /* Stats grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }
        .stat-card {
          border-radius: 14px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .stat-card.green { background: var(--leaf); color: #fff; }
        .stat-card.gold  { background: var(--turmeric); color: #1a1a15; }
        .stat-card.blue  { background: #1d4ed8; color: #fff; }
        .stat-label { font-size: 0.78rem; opacity: 0.9; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .stat-val { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; }
        .stat-sub { font-size: 0.74rem; opacity: 0.8; }

        /* Table */
        .table-card { background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 14px; overflow: hidden; }
        .table-head {
          padding: 14px 20px;
          font-weight: 700;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(26,26,21,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--soil);
        }
        .row-count { font-size: 0.76rem; color: #9ca3af; font-weight: 500; }
        .loading-row { padding: 40px; text-align: center; color: #9ca3af; font-size: 0.88rem; }
        table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        th { text-align: left; padding: 11px 20px; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.04em; color: #6b6555; background: #faf8f5; }
        td { padding: 11px 20px; border-top: 1px solid rgba(26,26,21,0.05); }
        .date-col { color: #6b7280; font-size: 0.84rem; white-space: nowrap; }
        .amount { color: var(--leaf); font-weight: 700; }
        .empty { text-align: center; color: #9ca3af; padding: 44px; font-size: 0.88rem; }
        tfoot td { border-top: 2px solid rgba(26,26,21,0.1); background: #faf8f5; font-weight: 700; }
        .total-label { text-align: right; color: var(--soil); font-size: 0.84rem; }
        .total-val { font-size: 1rem; }
        .err-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 12px 16px; color: #dc2626; font-size: 0.88rem; margin-bottom: 16px; }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
          .cal-row { flex-direction: column; align-items: stretch; }
          .cal-arrow { display: none; }
        }
      `}</style>
    </>
  );
}
