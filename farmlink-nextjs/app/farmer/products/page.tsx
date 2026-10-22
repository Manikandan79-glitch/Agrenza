"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FarmerNav from "@/app/components/FarmerNav";
import { listProducts, deleteProduct, refillProduct, Product } from "@/app/lib/api";

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Refill Modal state
  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refillAmount, setRefillAmount] = useState<number | string>(50);
  const [refillMode, setRefillMode] = useState<"add" | "set">("add");
  const [refillLoading, setRefillLoading] = useState(false);
  const [refillError, setRefillError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await listProducts({ farmer_mine: "1" });
      setProducts(res.products || []);
    } catch {
      setError("Could not load your products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccessMsg("Product deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch {
      alert("Failed to delete product.");
    }
  }

  function openRefillModal(p: Product) {
    setSelectedProduct(p);
    setRefillAmount(50);
    setRefillMode("add");
    setRefillError("");
    setRefillModalOpen(true);
  }

  function closeRefillModal() {
    setRefillModalOpen(false);
    setSelectedProduct(null);
    setRefillError("");
  }

  async function handleRefillSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    const amount = Number(refillAmount);
    if (isNaN(amount) || amount <= 0) {
      setRefillError("Please enter a valid refill quantity greater than 0.");
      return;
    }

    setRefillLoading(true);
    setRefillError("");

    try {
      const res = await refillProduct(selectedProduct.id, amount, refillMode);
      
      // Update local state immediately
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, stock: res.new_stock, status: res.status as "active" | "inactive" }
            : p
        )
      );

      setSuccessMsg(`✅ ${res.message || `Successfully refilled ${selectedProduct.name}!`}`);
      setTimeout(() => setSuccessMsg(""), 5000);
      closeRefillModal();
    } catch (err: any) {
      setRefillError(err?.message || "Failed to refill stock. Please try again.");
    } finally {
      setRefillLoading(false);
    }
  }

  return (
    <>
      <FarmerNav />
      <div className="container products-wrap">
        <div className="head">
          <div>
            <h1>My Products &amp; Pricing</h1>
            <p className="subhead">Manage produce listings, base earnings, GST, website prices, and instant stock refills.</p>
          </div>
          <Link href="/farmer/products/new" className="btn-solid">+ Add Product</Link>
        </div>

        {error && <div className="form-error">{error}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Name</th>
                <th>Category</th>
                <th>Farmer Base (Your Earning)</th>
                <th>Platform Fee &amp; GST</th>
                <th>Website Selling Price</th>
                <th>Stock &amp; Refill</th>
                <th>Website Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="empty">Loading your products…</td></tr>
              )}
              {!loading && products.length === 0 && (
                <tr><td colSpan={9} className="empty">No products added yet. Click &ldquo;+ Add Product&rdquo; to list one!</td></tr>
              )}
              {products.map((p) => {
                const base = p.base_price ?? p.price;
                const gst = p.gst_amount ?? (base * ((p.gst_percent ?? 5) / 100));
                const comm = p.commission_amount ?? (base * ((p.commission_percent ?? 5) / 100));
                const selling = p.price;
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= 15;

                return (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="thumb" />
                      ) : (
                        <div className="thumb placeholder">🌾</div>
                      )}
                    </td>
                    <td>
                      <div className="p-title">
                        <strong>{p.name}</strong>
                        <span className="p-id">ID: #{p.id}</span>
                      </div>
                    </td>
                    <td><span className="cat-tag">{p.category}</span></td>
                    <td>
                      <strong className="base-rate">₹{base.toFixed(2)} / kg</strong>
                    </td>
                    <td>
                      <div className="fee-info">
                        <span>Fee ({p.commission_percent ?? 5}%): ₹{comm.toFixed(2)}</span>
                        <span>GST ({p.gst_percent ?? 5}%): ₹{gst.toFixed(2)}</span>
                      </div>
                    </td>
                    <td>
                      <strong className="selling-rate">₹{selling.toFixed(2)} / kg</strong>
                    </td>
                    <td>
                      <div className="stock-cell">
                        <div className="stock-info">
                          {isOutOfStock ? (
                            <span className="stock-badge out">🔴 Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="stock-badge low">⚠️ {p.stock} kg (Low)</span>
                          ) : (
                            <span className="stock-badge good">🟢 {p.stock} kg</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => openRefillModal(p)}
                          className="btn-refill"
                          title="Refill stock for this product"
                        >
                          ➕ Refill
                        </button>
                      </div>
                    </td>
                    <td>
                      {p.approval_status === "approved" && (
                        <span className="badge approved">✓ Live on Website</span>
                      )}
                      {p.approval_status === "pending" && (
                        <span className="badge pending">⏳ Awaiting Admin</span>
                      )}
                      {p.approval_status === "rejected" && (
                        <div>
                          <span className="badge rejected">✕ Rejected</span>
                          {p.admin_remark && <div className="remark-text">{p.admin_remark}</div>}
                        </div>
                      )}
                    </td>
                    <td className="row-actions">
                      <button
                        type="button"
                        onClick={() => openRefillModal(p)}
                        className="btn-action-refill"
                      >
                        Refill
                      </button>
                      <Link href={`/farmer/products/${p.id}/edit`} className="btn-edit">Edit</Link>
                      <button onClick={() => handleDelete(p.id)} className="btn-del">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refill Modal */}
      {refillModalOpen && selectedProduct && (
        <div className="modal-backdrop" onClick={closeRefillModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon">🌱</span>
                <div>
                  <h3>Refill Product Stock</h3>
                  <p className="modal-sub">Quickly restock fresh harvest for your produce</p>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={closeRefillModal}>✕</button>
            </div>

            <form onSubmit={handleRefillSubmit}>
              <div className="modal-body">
                {/* Product Summary Card */}
                <div className="p-summary-box">
                  {selectedProduct.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="summary-thumb" />
                  ) : (
                    <div className="summary-thumb placeholder">🌾</div>
                  )}
                  <div className="summary-text">
                    <strong className="summary-name">{selectedProduct.name}</strong>
                    <span className="summary-cat">{selectedProduct.category} • Selling at ₹{selectedProduct.price.toFixed(2)}/kg</span>
                    <div className="summary-current-stock">
                      Current Stock: <strong>{selectedProduct.stock} kg</strong>
                      {selectedProduct.stock <= 0 && <span className="tag-out">Out of Stock</span>}
                    </div>
                  </div>
                </div>

                {refillError && <div className="modal-error">{refillError}</div>}

                {/* Mode Selector */}
                <div className="mode-selector">
                  <button
                    type="button"
                    className={`mode-btn ${refillMode === "add" ? "active" : ""}`}
                    onClick={() => setRefillMode("add")}
                  >
                    ➕ Add More Stock
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${refillMode === "set" ? "active" : ""}`}
                    onClick={() => setRefillMode("set")}
                  >
                    ✏️ Set Total Stock
                  </button>
                </div>

                {/* Quick Add Preset Chips */}
                {refillMode === "add" && (
                  <div className="preset-wrap">
                    <label className="input-label">Quick Refill Options:</label>
                    <div className="chips-grid">
                      {[10, 25, 50, 100, 200, 500].map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`chip ${Number(refillAmount) === val ? "selected" : ""}`}
                          onClick={() => setRefillAmount(val)}
                        >
                          +{val} kg
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Quantity Input */}
                <div className="input-group">
                  <label className="input-label">
                    {refillMode === "add" ? "Quantity to Add (kg):" : "New Total Stock Quantity (kg):"}
                  </label>
                  <div className="number-input-wrap">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      required
                      value={refillAmount}
                      onChange={(e) => setRefillAmount(e.target.value)}
                      className="stock-input"
                      placeholder="Enter kg..."
                      autoFocus
                    />
                    <span className="input-unit">kg</span>
                  </div>
                </div>

                {/* Live Stock Calculation Box */}
                <div className="calc-preview-box">
                  <div className="calc-line">
                    <span>Current Stock:</span>
                    <strong>{selectedProduct.stock} kg</strong>
                  </div>
                  <div className="calc-line">
                    <span>{refillMode === "add" ? "Refill Added:" : "New Setting:"}</span>
                    <strong className="calc-add">
                      {refillMode === "add" ? `+${Number(refillAmount) || 0} kg` : `${Number(refillAmount) || 0} kg`}
                    </strong>
                  </div>
                  <div className="calc-divider" />
                  <div className="calc-line total">
                    <span>New Total Live Stock:</span>
                    <strong className="calc-total">
                      {refillMode === "add"
                        ? `${(selectedProduct.stock + (Number(refillAmount) || 0)).toFixed(1)} kg`
                        : `${(Number(refillAmount) || 0).toFixed(1)} kg`}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeRefillModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-refill" disabled={refillLoading}>
                  {refillLoading ? "Refilling Stock…" : "✅ Confirm Stock Refill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .products-wrap { padding: 40px 24px 90px; }
        .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; margin: 0 0 4px; color: #1b3821; }
        .subhead { color: #6b6555; font-size: 0.88rem; margin: 0; }
        .btn-solid { background: #16a34a; color: #ffffff; padding: 10px 18px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: background 0.2s; }
        .btn-solid:hover { background: #15803d; }

        .form-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.88rem; }
        .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.88rem; font-weight: 600; }

        .table-card { background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 14px; overflow: hidden; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
        th { text-align: left; padding: 14px 16px; background: #faf7ee; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.03em; color: #6b6555; white-space: nowrap; }
        td { padding: 12px 16px; border-top: 1px solid rgba(26,26,21,0.06); vertical-align: middle; white-space: nowrap; }
        
        .thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
        .thumb.placeholder { background: linear-gradient(160deg,#f7f2e6,#ede4cd); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .p-title { display: flex; flex-direction: column; }
        .p-id { font-size: 0.74rem; color: #888273; }
        .cat-tag { background: #faf7ee; border: 1px solid rgba(26,26,21,0.08); padding: 3px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 500; }
        
        .base-rate { color: #1b3821; font-size: 0.95rem; }
        .fee-info { display: flex; flex-direction: column; font-size: 0.75rem; color: #6b6555; }
        .selling-rate { color: #16a34a; font-size: 1.05rem; }

        /* Stock & Refill Cell */
        .stock-cell { display: flex; align-items: center; gap: 8px; }
        .stock-badge { font-size: 0.76rem; padding: 4px 8px; border-radius: 6px; font-weight: 600; white-space: nowrap; }
        .stock-badge.good { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .stock-badge.low { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
        .stock-badge.out { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        
        .btn-refill { background: #f0fdf4; border: 1px solid #16a34a; color: #15803d; padding: 4px 9px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .btn-refill:hover { background: #16a34a; color: #ffffff; }

        .badge { font-size: 0.72rem; padding: 3px 10px; border-radius: 999px; text-transform: capitalize; font-weight: 600; }
        .badge.approved { background: rgba(76,122,61,0.15); color: #16a34a; }
        .badge.pending { background: rgba(232,163,61,0.18); color: #b45309; }
        .badge.rejected { background: rgba(200,60,40,0.12); color: #b8391f; }
        .remark-text { font-size: 0.74rem; color: #b8391f; margin-top: 4px; font-style: italic; }

        .row-actions { display: flex; gap: 10px; align-items: center; }
        .btn-action-refill { border: 1px solid #16a34a; background: #ffffff; color: #16a34a; font-weight: 700; border-radius: 6px; padding: 3px 9px; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
        .btn-action-refill:hover { background: #16a34a; color: #fff; }
        .btn-edit { color: #b45309; font-weight: 600; text-decoration: none; font-size: 0.82rem; }
        .btn-del { border: none; background: none; color: #b8391f; font-weight: 600; cursor: pointer; font-size: 0.82rem; }
        .empty { text-align: center; color: #6b6555; padding: 40px; }

        /* Modal Styles */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal-card { background: #ffffff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; animation: popIn 0.2s ease-out; }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; background: #1b3821; color: #ffffff; }
        .modal-title-wrap { display: flex; align-items: center; gap: 12px; }
        .modal-icon { font-size: 1.6rem; }
        .modal-header h3 { margin: 0; font-size: 1.15rem; font-weight: 700; color: #ffffff; }
        .modal-sub { margin: 2px 0 0; font-size: 0.78rem; color: #a7f3d0; }
        .btn-close { background: none; border: none; color: #ffffff; font-size: 1.2rem; cursor: pointer; padding: 4px; opacity: 0.8; }
        .btn-close:hover { opacity: 1; }

        .modal-body { padding: 20px 22px; }
        .modal-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 0.84rem; }

        /* Product Summary Box */
        .p-summary-box { display: flex; align-items: center; gap: 14px; padding: 12px 14px; background: #faf7ee; border: 1px solid rgba(26,26,21,0.08); border-radius: 10px; margin-bottom: 18px; }
        .summary-thumb { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; }
        .summary-thumb.placeholder { background: #ede4cd; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
        .summary-text { display: flex; flex-direction: column; gap: 2px; }
        .summary-name { font-size: 0.95rem; color: #1b3821; }
        .summary-cat { font-size: 0.78rem; color: #6b6555; }
        .summary-current-stock { font-size: 0.82rem; color: #1b3821; margin-top: 2px; display: flex; align-items: center; gap: 6px; }
        .tag-out { background: #fef2f2; color: #991b1b; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid #fecaca; }

        /* Mode Selector */
        .mode-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; background: #f3f4f6; padding: 4px; border-radius: 10px; }
        .mode-btn { padding: 8px 12px; border: none; background: transparent; font-size: 0.82rem; font-weight: 600; color: #4b5563; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .mode-btn.active { background: #ffffff; color: #16a34a; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }

        /* Presets */
        .preset-wrap { margin-bottom: 16px; }
        .chips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 6px; }
        .chip { padding: 8px; border: 1.5px solid #e5e7eb; background: #ffffff; border-radius: 8px; font-size: 0.82rem; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.15s; }
        .chip:hover { border-color: #16a34a; background: #f0fdf4; color: #15803d; }
        .chip.selected { border-color: #16a34a; background: #16a34a; color: #ffffff; }

        /* Input */
        .input-group { margin-bottom: 16px; }
        .input-label { display: block; font-size: 0.82rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .number-input-wrap { display: flex; align-items: center; border: 1.5px solid #d1d5db; border-radius: 10px; overflow: hidden; background: #fff; }
        .number-input-wrap:focus-within { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.15); }
        .stock-input { flex: 1; border: none; padding: 10px 14px; font-size: 1.05rem; font-weight: 700; color: #111827; outline: none; }
        .input-unit { padding: 0 14px; font-size: 0.9rem; font-weight: 600; color: #6b7280; background: #f9fafb; height: 100%; display: flex; align-items: center; border-left: 1px solid #e5e7eb; }

        /* Calculation Preview Box */
        .calc-preview-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 14px; }
        .calc-line { display: flex; justify-content: space-between; font-size: 0.82rem; color: #374151; margin-bottom: 4px; }
        .calc-add { color: #16a34a; }
        .calc-divider { height: 1px; background: #bbf7d0; margin: 6px 0; }
        .calc-line.total { font-size: 0.92rem; font-weight: 700; color: #166534; margin-bottom: 0; }
        .calc-total { font-size: 1.1rem; color: #15803d; }

        /* Modal Footer */
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 22px; background: #fafafa; border-top: 1px solid #e5e7eb; }
        .btn-cancel { padding: 9px 16px; border: 1px solid #d1d5db; background: #fff; color: #374151; border-radius: 999px; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
        .btn-cancel:hover { background: #f3f4f6; }
        .btn-submit-refill { padding: 9px 20px; border: none; background: #16a34a; color: #fff; border-radius: 999px; font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .btn-submit-refill:hover { background: #15803d; }
        .btn-submit-refill:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </>
  );
}
