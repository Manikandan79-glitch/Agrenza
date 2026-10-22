"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import { listMyOrders, listMyBulkRequests, BuyerOrder, BuyerBulkRequest } from "@/app/lib/api";

const ORDER_STAGES = [
  { key: "pending", label: "Order Placed", icon: "📝" },
  { key: "packing", label: "Packing & Quality Check", icon: "📦" },
  { key: "shipped", label: "Shipped & In Transit (Travel)", icon: "🚚" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

function getStageIndex(status: string): number {
  if (status === "pending") return 0;
  if (status === "packing" || status === "confirmed") return 1;
  if (status === "shipped") return 2;
  if (status === "out_for_delivery") return 3;
  if (status === "delivered") return 4;
  return 0;
}

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "⏳ Pending Verification", color: "#b45309", bg: "#fffbeb" },
  confirmed: { label: "📦 Confirmed & Packing", color: "#4338ca", bg: "#eef2ff" },
  packing: { label: "📦 Packing & Prep", color: "#4338ca", bg: "#eef2ff" },
  shipped: { label: "🚚 Shipped / In Transit", color: "#0284c7", bg: "#f0f9ff" },
  out_for_delivery: { label: "🛵 Out for Delivery", color: "#d97706", bg: "#fef3c7" },
  delivered: { label: "✅ Delivered", color: "#15803d", bg: "#f0fdf4" },
  cancelled: { label: "❌ Cancelled", color: "#b91c1c", bg: "#fef2f2" },
};

const BULK_STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "⏳ Pending Admin Review", color: "#b45309", bg: "#fffbeb" },
  approved: { label: "✅ Approved by Admin", color: "#15803d", bg: "#f0fdf4" },
  rejected: { label: "❌ Request Declined", color: "#b91c1c", bg: "#fef2f2" },
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [bulkRequests, setBulkRequests] = useState<BuyerBulkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [tab, setTab] = useState<"orders" | "bulk">("orders");

  async function load() {
    setLoading(true);
    try {
      const res = await listMyOrders();
      setOrders(res.orders || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
    loadBulk();
  }

  async function loadBulk() {
    setBulkLoading(true);
    try {
      const res = await listMyBulkRequests();
      setBulkRequests(res.requests || []);
    } catch {
      // Fallback
    } finally {
      setBulkLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Nav />
      <div className="container orders-wrap">
        <div className="header-box">
          <div>
            <h1>My Orders &amp; Live Tracking</h1>
            <p className="subhead">Track your fresh harvest orders, packing status, shipping travel, and delivery updates.</p>
          </div>
          <button type="button" onClick={load} className="btn-refresh">
            🔄 Refresh Status
          </button>
        </div>

        <div className="tabs">
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
            🛒 My Orders ({orders.length})
          </button>
          <button className={tab === "bulk" ? "active" : ""} onClick={() => { setTab("bulk"); loadBulk(); }}>
            🌾 My Bulk Requests ({bulkRequests.length})
          </button>
        </div>

        {tab === "orders" && (
          loading ? (
            <div className="empty-card">Loading your orders…</div>
          ) : orders.length === 0 ? (
            <div className="empty-card">
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>🛒</span>
              <strong>No orders placed yet.</strong>
              <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "#888" }}>
                Visit our fresh produce Shop to place your first farm order!
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = getStageIndex(order.status);
              const isCancelled = order.status === "cancelled";
              const badge = STATUS_BADGES[order.status] || STATUS_BADGES.pending;

              return (
                <div className="order-card" key={order.id}>
                  <div className="order-head">
                    <div>
                      <span className="order-id">Order #{order.id}</span>
                      <span className="order-date">
                        &bull; {new Date(order.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <span className="status-badge" style={{ color: badge.color, background: badge.bg }}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Live Order Tracking Stepper */}
                  {!isCancelled && (
                    <div className="stepper-wrap">
                      <div className="stepper">
                        {ORDER_STAGES.map((stage, idx) => {
                          const isDone = idx < currentStep;
                          const isCurrent = idx === currentStep;
                          return (
                            <div key={stage.key} className={`step-item ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                              <div className="step-icon-wrap">
                                <span className="step-icon">{stage.icon}</span>
                              </div>
                              <span className="step-label">{stage.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Stepper Progress Bar */}
                      <div className="stepper-line-bg">
                        <div
                          className="stepper-line-fill"
                          style={{ width: `${(currentStep / (ORDER_STAGES.length - 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tracking Note Alert */}
                  {order.tracking_note && (
                    <div className="tracking-note-banner">
                      <span className="note-icon">📢</span>
                      <div>
                        <strong>Latest Logistics Update from Admin:</strong>
                        <p>{order.tracking_note}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Line Items */}
                  <ul className="items-list">
                    {order.items?.map((item, i) => (
                      <li key={i} className="item-row">
                        <div className="item-name-box">
                          <span className="item-icon">🌾</span>
                          <div>
                            <strong>{item.name}</strong>
                            <span className="item-qty-tag">{item.qty} kg</span>
                          </div>
                        </div>
                        <span className="item-price">₹{item.subtotal.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="order-foot">
                    <div className="foot-left">
                      <span className="pay-mode">Payment: <strong>{order.payment_mode?.toUpperCase() || "COD"}</strong></span>
                      <span className="delivery-addr" title={order.address}>📍 Delivery to: {order.address}</span>
                    </div>
                    <div className="foot-right">
                      <span className="total-label">Total Amount:</span>
                      <strong className="total-amount">₹{order.total.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}

        {tab === "bulk" && (
          bulkLoading ? (
            <div className="empty-card">Loading your bulk requests…</div>
          ) : bulkRequests.length === 0 ? (
            <div className="empty-card">
              <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "8px" }}>🧺</span>
              <strong style={{ fontSize: "1.1rem", color: "#1b3821" }}>No bulk purchase requests submitted yet.</strong>
              <p style={{ margin: "8px 0 20px", fontSize: "0.88rem", color: "#6b6555", maxWidth: "440px", marginInline: "auto" }}>
                Need fresh farm produce above 10 kg for weddings, restaurants, catering, or wholesale resale? Submit a bulk inquiry!
              </p>
              <Link href="/buyer/bulk-request" className="btn-new-bulk">
                + Submit New Bulk Order Request
              </Link>
            </div>
          ) : (
            <div className="bulk-list">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.88rem", color: "#6b6555" }}>
                  Showing <strong>{bulkRequests.length}</strong> wholesale inquiry request(s)
                </span>
                <Link href="/buyer/bulk-request" className="btn-new-bulk-sm">
                  + Request More Produce
                </Link>
              </div>

              {bulkRequests.map((r) => {
                const badge = BULK_STATUS_BADGES[r.status] || BULK_STATUS_BADGES.pending;
                return (
                  <div className="bulk-card" key={r.id}>
                    <div className="bulk-head">
                      <div>
                        <span className="bulk-id">Inquiry #{r.id}</span>
                        <strong className="bulk-prod-name">{r.product_name}</strong>
                      </div>
                      <span className="bulk-badge" style={{ color: badge.color, background: badge.bg }}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="bulk-body">
                      <div className="bulk-metric">
                        <span className="metric-label">Requested Quantity</span>
                        <strong className="metric-val">{r.qty} kg</strong>
                      </div>
                      <div className="bulk-metric">
                        <span className="metric-label">Submitted On</span>
                        <span className="metric-text">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>

                    <div className="bulk-reason-box">
                      <span className="reason-label">Purpose / Reason:</span>
                      <p className="reason-text">“{r.reason}”</p>
                    </div>

                    {r.remark && (
                      <div className="bulk-remark-box">
                        <span className="remark-label">Admin Response / Note:</span>
                        <p className="remark-text">{r.remark}</p>
                      </div>
                    )}

                    {r.status === "approved" && (
                      <div className="bulk-approved-banner">
                        <div>
                          <strong>🎉 Approved by Admin &amp; Farmer!</strong>
                          <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#166534" }}>
                            Your bulk wholesale price and volume have been confirmed.
                          </p>
                        </div>
                        <Link href="/buyer/checkout" className="btn-buy-bulk">
                          Proceed to Order →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
      <Footer />

      <style jsx>{`
        .orders-wrap { padding: 44px 24px 90px; }
        .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; gap: 14px; flex-wrap: wrap; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.8rem; margin: 0 0 4px; color: #1b3821; }
        .subhead { color: #6b6555; font-size: 0.88rem; margin: 0; }
        .btn-refresh { background: #f0fdf4; border: 1px solid #16a34a; color: #15803d; padding: 8px 16px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .btn-refresh:hover { background: #16a34a; color: #fff; }

        .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .tabs button {
          border: 1px solid rgba(26,26,21,0.14); background: #fff;
          padding: 9px 20px; border-radius: 999px; font-size: 0.87rem; font-weight: 600; cursor: pointer;
        }
        .tabs button.active { background: #1b3821; color: #ffffff; border-color: #1b3821; }
        
        .empty-card {
          background: #fff; border: 1px solid rgba(26,26,21,0.08);
          border-radius: 14px; padding: 50px; text-align: center; color: #6b6555; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .order-card {
          background: #fff; border: 1px solid rgba(26,26,21,0.08);
          border-radius: 16px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .order-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 22px; border-bottom: 1px solid rgba(26,26,21,0.06);
          font-size: 0.88rem; background: #fafafa;
        }
        .order-id { font-family: monospace; font-weight: 700; color: #1b3821; font-size: 0.95rem; }
        .order-date { color: #888273; font-size: 0.82rem; }
        
        .status-badge { font-size: 0.78rem; font-weight: 700; padding: 5px 12px; border-radius: 999px; }

        /* Stepper */
        .stepper-wrap { position: relative; padding: 22px 24px 18px; background: #faf8f5; border-bottom: 1px solid rgba(26,26,21,0.06); }
        .stepper { display: flex; justify-content: space-between; position: relative; z-index: 2; }
        .step-item { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; opacity: 0.45; transition: all 0.2s; }
        .step-item.done, .step-item.current { opacity: 1; }
        .step-icon-wrap { width: 36px; height: 36px; border-radius: 50%; background: #ffffff; border: 2px solid #d1d5db; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }
        .step-item.done .step-icon-wrap { border-color: #16a34a; background: #f0fdf4; }
        .step-item.current .step-icon-wrap { border-color: #16a34a; background: #16a34a; transform: scale(1.15); }
        .step-label { font-size: 0.74rem; font-weight: 600; color: #4b5563; max-width: 90px; line-height: 1.25; }
        .step-item.current .step-label { color: #15803d; font-weight: 700; }

        .stepper-line-bg { position: absolute; top: 38px; left: 8%; right: 8%; height: 4px; background: #e5e7eb; z-index: 1; border-radius: 999px; }
        .stepper-line-fill { height: 100%; background: #16a34a; transition: width 0.3s ease; border-radius: 999px; }

        /* Tracking Note */
        .tracking-note-banner { display: flex; align-items: flex-start; gap: 10px; padding: 12px 20px; background: #eff6ff; border-bottom: 1px solid #dbeafe; font-size: 0.82rem; color: #1e40af; }
        .note-icon { font-size: 1.2rem; }
        .tracking-note-banner p { margin: 2px 0 0; color: #1d4ed8; }

        /* Items List */
        .items-list { list-style: none; margin: 0; padding: 8px 22px; }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 0.9rem; border-bottom: 1px solid rgba(26,26,21,0.05); }
        .item-row:last-child { border-bottom: none; }
        .item-name-box { display: flex; align-items: center; gap: 10px; }
        .item-icon { font-size: 1.3rem; }
        .item-qty-tag { display: inline-block; margin-left: 8px; font-size: 0.76rem; background: #f3f4f6; color: #4b5563; padding: 2px 7px; border-radius: 4px; font-weight: 600; }
        .item-price { font-weight: 700; color: #1b3821; font-size: 0.95rem; }

        .order-foot {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 22px; background: #faf7ee; font-size: 0.85rem; border-top: 1px solid rgba(26,26,21,0.06);
          flex-wrap: wrap; gap: 12px;
        }
        .foot-left { display: flex; flex-direction: column; gap: 2px; }
        .pay-mode { color: #6b6555; }
        .delivery-addr { font-size: 0.78rem; color: #888273; max-width: 320px; }
        .foot-right { display: flex; align-items: center; gap: 8px; }
        .total-label { color: #6b6555; }
        .total-amount { font-size: 1.2rem; color: #16a34a; font-weight: 800; }

        /* Bulk Requests Styles */
        .btn-new-bulk {
          display: inline-block; background: #16a34a; color: #fff; text-decoration: none;
          padding: 11px 22px; border-radius: 999px; font-weight: 700; font-size: 0.88rem; transition: background 0.15s;
        }
        .btn-new-bulk:hover { background: #15803d; }
        .btn-new-bulk-sm {
          display: inline-block; background: #f0fdf4; border: 1px solid #16a34a; color: #15803d;
          text-decoration: none; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 0.8rem;
        }
        .btn-new-bulk-sm:hover { background: #16a34a; color: #fff; }

        .bulk-card {
          background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 16px;
          margin-bottom: 20px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .bulk-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 22px; border-bottom: 1px solid rgba(26,26,21,0.06); background: #fafafa;
        }
        .bulk-id { font-family: monospace; font-size: 0.82rem; color: #6b7280; display: block; margin-bottom: 2px; }
        .bulk-prod-name { font-size: 1.15rem; color: #1b3821; font-weight: 700; }
        .bulk-badge { font-size: 0.8rem; font-weight: 700; padding: 5px 12px; border-radius: 999px; }

        .bulk-body {
          display: flex; gap: 32px; padding: 18px 22px 12px; background: #ffffff;
        }
        .bulk-metric { display: flex; flex-direction: column; gap: 2px; }
        .metric-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .metric-val { font-size: 1.25rem; color: #15803d; font-weight: 800; }
        .metric-text { font-size: 0.95rem; color: #374151; font-weight: 600; }

        .bulk-reason-box {
          padding: 0 22px 14px; background: #ffffff; font-size: 0.86rem; color: #4b5563;
        }
        .reason-label { font-size: 0.75rem; color: #6b7280; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px; }
        .reason-text { margin: 0; font-style: italic; color: #374151; }

        .bulk-remark-box {
          margin: 0 22px 16px; padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; font-size: 0.82rem; color: #991b1b;
        }
        .remark-label { font-weight: 700; display: block; margin-bottom: 2px; }
        .remark-text { margin: 0; }

        .bulk-approved-banner {
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
          padding: 14px 22px; background: #f0fdf4; border-top: 1px solid #dcfce7;
        }
        .btn-buy-bulk {
          background: #16a34a; color: #fff; text-decoration: none; padding: 8px 18px;
          border-radius: 999px; font-weight: 700; font-size: 0.84rem;
        }
        .btn-buy-bulk:hover { background: #15803d; }
      `}</style>
    </>
  );
}
