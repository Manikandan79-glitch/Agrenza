"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FarmerNav from "@/app/components/FarmerNav";
import { listFarmerOrderItems, FarmerOrderItem, refillProduct } from "@/app/lib/api";

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "⏳ Pending", color: "#b45309", bg: "#fffbeb" },
  confirmed: { label: "📦 Confirmed & Packing", color: "#4338ca", bg: "#eef2ff" },
  packing: { label: "📦 Packing & Prep", color: "#4338ca", bg: "#eef2ff" },
  shipped: { label: "🚚 Shipped / In Transit", color: "#0284c7", bg: "#f0f9ff" },
  out_for_delivery: { label: "🛵 Out for Delivery", color: "#d97706", bg: "#fef3c7" },
  delivered: { label: "✅ Delivered", color: "#15803d", bg: "#f0fdf4" },
  cancelled: { label: "❌ Cancelled", color: "#b91c1c", bg: "#fef2f2" },
};

export default function FarmerOrdersPage() {
  const [items, setItems] = useState<FarmerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Quick Refill Modal
  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [refillTarget, setRefillTarget] = useState<{ id: number; name: string; stock: number } | null>(null);
  const [refillKg, setRefillKg] = useState<number | string>(50);
  const [refillLoading, setRefillLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await listFarmerOrderItems();
      setItems(res.items || []);
    } catch {
      setError("Could not load received orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openRefill(prodId: number, prodName: string, stock: number) {
    setRefillTarget({ id: prodId, name: prodName, stock });
    setRefillKg(50);
    setRefillModalOpen(true);
  }

  async function handleRefillSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refillTarget) return;
    const amount = Number(refillKg);
    if (isNaN(amount) || amount <= 0) return;

    setRefillLoading(true);
    try {
      const res = await refillProduct(refillTarget.id, amount, "add");
      setItems((prev) =>
        prev.map((i) => (i.product_id === refillTarget.id ? { ...i, current_stock: res.new_stock } : i))
      );
      setMsg(`✅ Refilled ${refillTarget.name}! New stock is ${res.new_stock} kg.`);
      setTimeout(() => setMsg(""), 4000);
      setRefillModalOpen(false);
      setRefillTarget(null);
    } catch (err: any) {
      alert(err?.message || "Failed to refill stock.");
    } finally {
      setRefillLoading(false);
    }
  }

  return (
    <>
      <FarmerNav />
      <div className="container orders-wrap">
        <div className="head">
          <div>
            <h1>Orders Received &amp; Stock Tracking</h1>
            <p className="subhead">
              Track customer orders and live stock. Order logistics (packing, travel, delivery) are managed directly by Admin.
            </p>
          </div>
          <div className="head-actions">
            <button type="button" onClick={load} className="btn-refresh">
              🔄 Refresh Orders
            </button>
            <Link href="/farmer/products" className="btn-manage-products">
              📦 My Products &amp; Stock
            </Link>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {msg && <div className="alert-success">{msg}</div>}

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Date &amp; Order ID</th>
                <th>Produce Item</th>
                <th>Ordered Qty</th>
                <th>Remaining Farm Stock</th>
                <th>Buyer Contact</th>
                <th>Earnings Subtotal</th>
                <th>Delivery Stage (Admin Controlled)</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="empty">Loading received orders…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="empty">No customer orders received yet.</td></tr>
              )}
              {items.map((item) => {
                const isOutOfStock = item.current_stock <= 0;
                const isLowStock = item.current_stock > 0 && item.current_stock <= 15;
                const badge = STATUS_BADGES[item.status] || STATUS_BADGES.pending;

                return (
                  <tr key={item.item_id}>
                    <td>
                      <div className="date-box">
                        <strong className="order-id">#{item.order_id}</strong>
                        <span>{new Date(item.order_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </td>
                    <td>
                      <div className="prod-cell">
                        {item.product_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product_image} alt={item.product_name} className="prod-thumb" />
                        ) : (
                          <div className="prod-thumb placeholder">🌾</div>
                        )}
                        <div>
                          <strong>{item.product_name}</strong>
                          <div className="rate-hint">₹{item.price_per_kg.toFixed(2)} / kg</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ordered-qty-box">
                        <strong className="qty-number">📦 {item.qty} kg</strong>
                        <span className="qty-sub">deducted from stock</span>
                      </div>
                    </td>
                    <td>
                      <div className="stock-col">
                        {isOutOfStock ? (
                          <span className="badge-stock out">🔴 0 kg Left (Out of Stock)</span>
                        ) : isLowStock ? (
                          <span className="badge-stock low">⚠️ {item.current_stock} kg Left (Low)</span>
                        ) : (
                          <span className="badge-stock good">🟢 {item.current_stock} kg Remaining</span>
                        )}
                        <button
                          type="button"
                          className="btn-quick-refill"
                          onClick={() => openRefill(item.product_id, item.product_name, item.current_stock)}
                        >
                          ➕ Refill
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="buyer-info">
                        <strong>👤 {item.buyer_name}</strong>
                        <span className="muted">📞 {item.buyer_mobile}</span>
                        <span className="address-text">📍 {item.address}</span>
                      </div>
                    </td>
                    <td>
                      <strong className="subtotal-val">₹{item.subtotal.toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: badge.color, background: badge.bg }}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Refill Modal */}
      {refillModalOpen && refillTarget && (
        <div className="modal-backdrop" onClick={() => setRefillModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🌱 Quick Refill Stock: {refillTarget.name}</h3>
              <button type="button" className="btn-close" onClick={() => setRefillModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleRefillSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: "0.88rem", color: "#4b5563", marginBottom: "14px" }}>
                  Current remaining stock: <strong>{refillTarget.stock} kg</strong>
                </p>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "6px" }}>
                  Quantity to Add (kg):
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={refillKg}
                    onChange={(e) => setRefillKg(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "1rem" }}
                  />
                  <span style={{ fontWeight: "600", color: "#6b7280" }}>kg</span>
                </div>
                <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                  {[10, 25, 50, 100, 200].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRefillKg(v)}
                      style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "0.78rem" }}
                    >
                      +{v}kg
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setRefillModalOpen(false)} className="btn-cancel">Cancel</button>
                <button type="submit" disabled={refillLoading} className="btn-confirm">
                  {refillLoading ? "Refilling…" : "Confirm Refill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .orders-wrap { padding: 40px 24px 90px; }
        .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; margin: 0 0 4px; color: #1b3821; }
        .subhead { color: #6b6555; font-size: 0.88rem; margin: 0; }
        
        .head-actions { display: flex; gap: 10px; align-items: center; }
        .btn-refresh { background: #fff; border: 1px solid #d1d5db; color: #374151; padding: 8px 16px; border-radius: 999px; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
        .btn-refresh:hover { background: #f3f4f6; }
        .btn-manage-products { background: #f0fdf4; border: 1px solid #16a34a; color: #15803d; padding: 8px 16px; border-radius: 999px; font-size: 0.82rem; font-weight: 600; text-decoration: none; }
        .btn-manage-products:hover { background: #16a34a; color: #fff; }

        .form-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.88rem; }
        .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.88rem; font-weight: 600; }

        .table-card { background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 14px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; min-width: 900px; }
        th { text-align: left; padding: 14px 16px; background: #faf7ee; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.04em; color: #6b6555; white-space: nowrap; }
        td { padding: 14px 16px; border-top: 1px solid rgba(26,26,21,0.06); vertical-align: middle; }
        
        .date-box { display: flex; flex-direction: column; gap: 2px; }
        .order-id { font-family: monospace; font-size: 0.9rem; color: #1b3821; }
        .date-box span { font-size: 0.76rem; color: #888273; }

        .prod-cell { display: flex; align-items: center; gap: 10px; }
        .prod-thumb { width: 42px; height: 42px; border-radius: 8px; object-fit: cover; }
        .prod-thumb.placeholder { background: #ede4cd; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .rate-hint { font-size: 0.74rem; color: #888273; }

        .ordered-qty-box { display: flex; flex-direction: column; gap: 2px; }
        .qty-number { font-size: 0.95rem; color: #1b3821; }
        .qty-sub { font-size: 0.72rem; color: #888273; }

        .stock-col { display: flex; flex-direction: column; gap: 4px; }
        .badge-stock { font-size: 0.74rem; padding: 3px 8px; border-radius: 6px; font-weight: 600; white-space: nowrap; width: fit-content; }
        .badge-stock.good { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .badge-stock.low { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
        .badge-stock.out { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        
        .btn-quick-refill { background: #f0fdf4; border: 1px solid #16a34a; color: #15803d; padding: 2px 7px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; cursor: pointer; width: fit-content; }
        .btn-quick-refill:hover { background: #16a34a; color: #fff; }

        .buyer-info { display: flex; flex-direction: column; gap: 2px; font-size: 0.82rem; }
        .muted { color: #6b6555; font-size: 0.76rem; }
        .address-text { color: #888273; font-size: 0.74rem; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .subtotal-val { color: #16a34a; font-size: 0.95rem; }

        .status-badge { font-size: 0.78rem; font-weight: 700; padding: 5px 12px; border-radius: 999px; display: inline-block; white-space: nowrap; }
        .empty { text-align: center; color: #6b6555; padding: 40px; }

        /* Modal */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal-card { background: #fff; border-radius: 14px; max-width: 420px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.15); overflow: hidden; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #1b3821; color: #fff; }
        .modal-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #fff; }
        .btn-close { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }
        .modal-body { padding: 18px 20px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; background: #fafafa; border-top: 1px solid #e5e7eb; }
        .btn-cancel { padding: 7px 14px; border: 1px solid #d1d5db; background: #fff; border-radius: 999px; font-size: 0.8rem; cursor: pointer; }
        .btn-confirm { padding: 7px 16px; border: none; background: #16a34a; color: #fff; border-radius: 999px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
        .btn-confirm:hover { background: #15803d; }
      `}</style>
    </>
  );
}
