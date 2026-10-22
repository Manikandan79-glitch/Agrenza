"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { getMe, adminListOrders, adminUpdateOrderStatus, ApiError, AdminOrder } from "@/app/lib/api";

function round(val: number, decimals: number) {
  return Number(Math.round(Number(val + "e" + decimals)) + "e-" + decimals);
}

const STATUS_STAGES = [
  { value: "pending", label: "⏳ Pending (Order Placed)", color: "#b45309", bg: "#fffbeb" },
  { value: "packing", label: "📦 Packing & Prep", color: "#4338ca", bg: "#eef2ff" },
  { value: "shipped", label: "🚚 Shipped / Travel (In Transit)", color: "#0284c7", bg: "#f0f9ff" },
  { value: "out_for_delivery", label: "🛵 Out for Delivery", color: "#d97706", bg: "#fef3c7" },
  { value: "delivered", label: "✅ Delivered", color: "#15803d", bg: "#f0fdf4" },
  { value: "cancelled", label: "❌ Cancelled", color: "#b91c1c", bg: "#fef2f2" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [checking, setChecking] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [modalTrackingNote, setModalTrackingNote] = useState("");
  const [modalStatus, setModalStatus] = useState("pending");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const me = await getMe().catch(() => ({ user: null }));
      if (!me.user || me.user.role !== "admin") {
        router.replace("/auth/admin-login");
        return;
      }
      setChecking(false);
      load();
    })();
  }, [router]);

  async function load() {
    setError("");
    try {
      const res = await adminListOrders();
      setOrders(res.orders);
      setTotalRevenue(res.total_revenue);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load orders.");
    }
  }

  async function handleStatusChange(orderId: number, newStatus: string, note?: string) {
    setUpdatingId(orderId);
    setError("");
    try {
      const res = await adminUpdateOrderStatus(orderId, newStatus, note);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, tracking_note: note ?? o.tracking_note } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus, tracking_note: note ?? prev.tracking_note } : null);
      }
      setSuccessMsg(`✅ ${res.message || `Order #${orderId} updated to ${newStatus}`}`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  function openOrderModal(o: AdminOrder) {
    setSelectedOrder(o);
    setModalStatus(o.status);
    setModalTrackingNote(o.tracking_note || "");
  }

  if (checking) return null;

  const commission = round(totalRevenue * 0.05, 2);

  return (
    <>
      <AdminNav />
      <div className="container wrap">
        <div className="page-header">
          <div>
            <h1>Admin Logistics &amp; Order Status Control</h1>
            <p className="subhead">
              Master control panel for shipping, packing, transit/travel, and delivery status updates.
            </p>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        {/* Income Metrics Banner */}
        <div className="income-banner">
          <div className="metric">
            <span className="label">Total Platform Revenue</span>
            <strong className="val green">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
            <span className="hint">Gross transaction volume</span>
          </div>
          <div className="metric">
            <span className="label">Platform Commission (5%)</span>
            <strong className="val gold">₹{commission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
            <span className="hint">Net fee earnings</span>
          </div>
          <div className="metric">
            <span className="label">Total Orders Placed</span>
            <strong className="val">{orders.length}</strong>
            <span className="hint">Buyer purchase count</span>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Contact</th>
                <th>Ordered Items &amp; Farm Stock</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Logistics Stage (Admin Only)</th>
                <th>Delivery Address</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="empty">No customer orders placed yet.</td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="order-id-badge">#{o.id}</span>
                  </td>
                  <td><strong>{o.buyer_name}</strong></td>
                  <td>
                    <div>📱 {o.buyer_mobile}</div>
                    {o.buyer_email && <div className="sub">✉️ {o.buyer_email}</div>}
                  </td>
                  <td>
                    <div className="items-summary-col">
                      <span className="items-badge">{o.item_count} produce item(s)</span>
                      {o.items && o.items.length > 0 && (
                        <div className="item-chips">
                          {o.items.map((it) => (
                            <span key={it.id} className="item-chip">
                              • <strong>{it.product_name}</strong>: {it.qty} kg (Farm Stock Left: {it.current_stock} kg)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong className="order-amount">₹{o.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                  </td>
                  <td>
                    <span className="pay-mode">{o.payment_mode.toUpperCase()}</span>
                  </td>
                  <td>
                    <div className="status-cell">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`status-select ${o.status}`}
                      >
                        {STATUS_STAGES.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                      {o.tracking_note && (
                        <span className="tracking-hint" title={o.tracking_note}>
                          📝 {o.tracking_note}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="address-cell" title={o.address}>
                    {o.address}
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td>
                    <button type="button" className="btn-details" onClick={() => openOrderModal(o)}>
                      View &amp; Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Items & Logistics Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📦 Order #{selectedOrder.id} Details &amp; Logistics Control</h3>
              <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="buyer-summary">
                <div><strong>Buyer:</strong> {selectedOrder.buyer_name} ({selectedOrder.buyer_mobile})</div>
                <div><strong>Delivery Address:</strong> {selectedOrder.address}</div>
                <div><strong>Total Amount:</strong> ₹{selectedOrder.total_amount.toFixed(2)} ({selectedOrder.payment_mode.toUpperCase()})</div>
                <div><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString("en-IN")}</div>
              </div>

              {/* Status Update Form in Modal */}
              <div className="status-update-box">
                <label className="section-label">Update Logistics Stage:</label>
                <div className="modal-select-grid">
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="modal-status-select"
                  >
                    {STATUS_STAGES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="section-label" style={{ marginTop: "10px" }}>
                  Tracking Note / Logistics Note (Visible to Buyer):
                </label>
                <input
                  type="text"
                  value={modalTrackingNote}
                  onChange={(e) => setModalTrackingNote(e.target.value)}
                  placeholder="e.g. Packed at warehouse, dispatched via vehicle TN-38-1234"
                  className="modal-note-input"
                />

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder.id, modalStatus, modalTrackingNote)}
                  className="btn-modal-update"
                  disabled={updatingId === selectedOrder.id}
                >
                  {updatingId === selectedOrder.id ? "Updating…" : "💾 Save Logistics Status & Note"}
                </button>
              </div>

              <h4 style={{ margin: "16px 0 8px", fontSize: "0.95rem", color: "#1b3821" }}>
                Ordered Produce Items &amp; Farm Inventory:
              </h4>
              <div className="item-table-wrap">
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Farmer</th>
                      <th>Ordered Qty</th>
                      <th>Remaining Farm Stock</th>
                      <th>Rate</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((it) => (
                      <tr key={it.id}>
                        <td><strong>{it.product_name}</strong></td>
                        <td>{it.farmer_name}<br /><span style={{ fontSize: "0.74rem", color: "#666" }}>{it.farmer_mobile}</span></td>
                        <td><span style={{ color: "#16a34a", fontWeight: "700" }}>📦 {it.qty} kg</span></td>
                        <td>
                          {it.current_stock <= 0 ? (
                            <span style={{ color: "#dc2626", fontWeight: "700" }}>🔴 0 kg (Out of Stock)</span>
                          ) : it.current_stock <= 15 ? (
                            <span style={{ color: "#b45309", fontWeight: "700" }}>⚠️ {it.current_stock} kg (Low)</span>
                          ) : (
                            <span style={{ color: "#166534", fontWeight: "700" }}>🟢 {it.current_stock} kg left</span>
                          )}
                        </td>
                        <td>₹{it.price_per_kg.toFixed(2)}/kg</td>
                        <td><strong>₹{it.subtotal.toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-close-modal" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .wrap { padding: 40px 24px 90px; }
        .page-header { margin-bottom: 22px; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; margin: 0 0 4px; color: #1b3821; }
        .subhead { color: #6b6555; font-size: 0.88rem; margin: 0; }

        .form-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.88rem; }
        .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.88rem; font-weight: 600; }

        .income-banner {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px; margin-bottom: 24px;
        }
        .metric {
          background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 14px;
          padding: 20px 22px; display: flex; flex-direction: column; gap: 4px;
        }
        .metric .label { font-size: 0.78rem; text-transform: uppercase; color: #888273; font-weight: 600; letter-spacing: 0.03em; }
        .metric .val { font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: #1b3821; }
        .metric .val.green { color: #16a34a; }
        .metric .val.gold { color: #b45309; }
        .metric .hint { font-size: 0.75rem; color: #6b6555; }

        .table-card { background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 14px; overflow: hidden; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; min-width: 1050px; }
        th { text-align: left; padding: 12px 16px; background: #faf7ee; font-size: 0.74rem; text-transform: uppercase; color: #6b6555; white-space: nowrap; }
        td { padding: 12px 16px; border-top: 1px solid rgba(26,26,21,0.06); vertical-align: middle; }
        .order-id-badge { font-family: monospace; font-weight: 700; color: #1b3821; background: #faf7ee; padding: 3px 8px; border-radius: 6px; }
        .order-amount { color: #16a34a; font-size: 0.95rem; }
        
        .items-summary-col { display: flex; flex-direction: column; gap: 4px; }
        .items-badge { background: #f0fdf4; color: #166534; padding: 2px 7px; border-radius: 4px; font-weight: 600; font-size: 0.76rem; border: 1px solid #bbf7d0; width: fit-content; }
        .item-chips { display: flex; flex-direction: column; gap: 2px; }
        .item-chip { font-size: 0.72rem; color: #4b5563; }

        .pay-mode { font-family: monospace; font-size: 0.75rem; padding: 3px 8px; background: #faf7ee; border-radius: 4px; font-weight: 600; }
        .sub { font-size: 0.76rem; color: #6b6555; }
        .address-cell { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Logistics Status Select */
        .status-cell { display: flex; flex-direction: column; gap: 4px; }
        .status-select { padding: 6px 10px; border-radius: 8px; border: 1.5px solid #d1d5db; font-size: 0.8rem; font-weight: 700; cursor: pointer; outline: none; }
        .status-select.pending { background: #fffbeb; color: #92400e; border-color: #fde68a; }
        .status-select.packing { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }
        .status-select.shipped { background: #f0f9ff; color: #0369a1; border-color: #bae6fd; }
        .status-select.out_for_delivery { background: #fef3c7; color: #b45309; border-color: #fcd34d; }
        .status-select.delivered { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
        .status-select.cancelled { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
        .tracking-hint { font-size: 0.72rem; color: #6b7280; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .btn-details { background: #f0fdf4; border: 1px solid #16a34a; color: #15803d; padding: 5px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .btn-details:hover { background: #16a34a; color: #fff; }
        .empty { text-align: center; color: #6b6555; padding: 40px; }

        /* Modal */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(2px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal-card { background: #fff; border-radius: 16px; max-width: 680px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.25); overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 22px; background: #1b3821; color: #fff; }
        .modal-header h3 { margin: 0; font-size: 1.1rem; color: #fff; }
        .btn-close { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }
        .modal-body { padding: 20px 22px; overflow-y: auto; }
        .buyer-summary { background: #faf7ee; border: 1px solid rgba(26,26,21,0.08); padding: 12px 14px; border-radius: 8px; font-size: 0.84rem; display: flex; flex-direction: column; gap: 4px; }
        
        .status-update-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-top: 14px; }
        .section-label { display: block; font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 6px; }
        .modal-status-select { width: 100%; padding: 8px 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }
        .modal-note-input { width: 100%; padding: 8px 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.86rem; margin-top: 4px; }
        .btn-modal-update { margin-top: 10px; width: 100%; padding: 10px; background: #16a34a; color: #fff; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 700; cursor: pointer; }
        .btn-modal-update:hover { background: #15803d; }
        .btn-modal-update:disabled { opacity: 0.6; }

        .item-table-wrap { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-top: 8px; }
        .modal-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .modal-table th { background: #f9fafb; padding: 10px 12px; font-size: 0.74rem; text-transform: uppercase; color: #6b7280; text-align: left; }
        .modal-table td { padding: 10px 12px; border-top: 1px solid #e5e7eb; vertical-align: middle; }
        .modal-footer { display: flex; justify-content: flex-end; padding: 14px 22px; background: #fafafa; border-top: 1px solid #e5e7eb; }
        .btn-close-modal { padding: 8px 18px; border: 1px solid #d1d5db; background: #fff; border-radius: 999px; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
      `}</style>
    </>
  );
}
