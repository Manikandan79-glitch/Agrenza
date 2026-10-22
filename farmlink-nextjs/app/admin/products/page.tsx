"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { getMe, adminListProducts, adminProductAction, ApiError, AdminProduct, FarmerStatus } from "@/app/lib/api";

const TABS: { key: FarmerStatus; label: string }[] = [
  { key: "pending", label: "Pending Approval" },
  { key: "approved", label: "Live on Website" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All Products" },
];

export default function AdminProductsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<FarmerStatus>("pending");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [remarkFor, setRemarkFor] = useState<number | null>(null);
  const [remark, setRemark] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    (async () => {
      const me = await getMe().catch(() => ({ user: null }));
      if (!me.user || me.user.role !== "admin") {
        router.replace("/auth/admin-login");
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  useEffect(() => {
    if (checking) return;
    load();
  }, [tab, checking]);

  async function load() {
    setError("");
    try {
      const res = await adminListProducts(tab);
      setProducts(res.products);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load products.");
    }
  }

  async function act(id: number, action: "approve" | "reject", withRemark?: string) {
    setBusyId(id);
    setError("");
    try {
      await adminProductAction(id, action, withRemark);
      setRemarkFor(null);
      setRemark("");
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct({
          ...selectedProduct,
          approval_status: action === "approve" ? "approved" : "rejected",
          remark: withRemark || selectedProduct.remark,
        });
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (checking) return null;

  return (
    <>
      <AdminNav />
      <div className="container wrap">
        <div className="page-header">
          <div>
            <h1>Farmer Product Approvals</h1>
            <p className="subhead">Approve or reject farmer products before they appear in the public online shop.</p>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Product Name</th>
                <th>Farmer Contact</th>
                <th>Category</th>
                <th>Farmer Base</th>
                <th>Fee &amp; GST</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Website Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={10} className="empty">No products in this category.</td>
                </tr>
              )}
              {products.map((p) => {
                const base = p.base_price ?? p.price;
                const gst = p.gst_amount ?? (base * ((p.gst_percent ?? 5) / 100));
                const comm = p.commission_amount ?? (base * ((p.commission_percent ?? 5) / 100));
                const fees = gst + comm;

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
                    <div className="product-title-cell">
                      <strong>{p.name}</strong>
                      <span className="product-id">ID: #{p.id}</span>
                    </div>
                  </td>
                  <td>
                    <div>🧑‍🌾 {p.farmer_name}</div>
                    <div className="sub">{p.farmer_mobile}</div>
                  </td>
                  <td><span className="cat-badge">{p.category}</span></td>
                  <td>₹{base.toFixed(2)}</td>
                  <td>
                    <span style={{ fontSize: "0.76rem", color: "#888" }}>+₹{fees.toFixed(2)}</span>
                  </td>
                  <td><strong style={{ color: "var(--leaf)" }}>₹{p.price.toFixed(2)}</strong></td>
                  <td>{p.stock} kg</td>
                  <td>
                    {p.approval_status === "approved" && (
                      <span className="badge approved">✓ Live on Website</span>
                    )}
                    {p.approval_status === "pending" && (
                      <span className="badge pending">⏳ Pending Review</span>
                    )}
                    {p.approval_status === "rejected" && (
                      <span className="badge rejected">✕ Hidden / Rejected</span>
                    )}
                  </td>
                  <td className="row-actions">
                    <button className="btn-detail" onClick={() => setSelectedProduct(p)}>
                      View
                    </button>

                    {/* Pending Approval: Approve or Reject */}
                    {p.approval_status === "pending" && (
                      <>
                        <button className="ok" disabled={busyId === p.id} onClick={() => act(p.id, "approve")}>
                          ✓ Approve for Website
                        </button>
                        {remarkFor === p.id ? (
                          <span className="remark-inline">
                            <input
                              placeholder="Reason (optional)"
                              value={remark}
                              onChange={(e) => setRemark(e.target.value)}
                            />
                            <button className="danger" disabled={busyId === p.id} onClick={() => act(p.id, "reject", remark)}>
                              Confirm
                            </button>
                          </span>
                        ) : (
                          <button className="danger" disabled={busyId === p.id} onClick={() => setRemarkFor(p.id)}>
                            ✕ Reject
                          </button>
                        )}
                      </>
                    )}

                    {/* Already Approved: Option to Take Down / Reject */}
                    {p.approval_status === "approved" && (
                      <>
                        {remarkFor === p.id ? (
                          <span className="remark-inline">
                            <input
                              placeholder="Reason (optional)"
                              value={remark}
                              onChange={(e) => setRemark(e.target.value)}
                            />
                            <button className="danger" disabled={busyId === p.id} onClick={() => act(p.id, "reject", remark)}>
                              Confirm Take Down
                            </button>
                          </span>
                        ) : (
                          <button className="danger-outline" disabled={busyId === p.id} onClick={() => setRemarkFor(p.id)}>
                            Take Down
                          </button>
                        )}
                      </>
                    )}

                    {/* Already Rejected: Option to Re-Approve */}
                    {p.approval_status === "rejected" && (
                      <button className="ok-outline" disabled={busyId === p.id} onClick={() => act(p.id, "approve")}>
                        Publish to Website
                      </button>
                    )}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Product Details — {selectedProduct.name}</h2>
                <button className="close-btn" onClick={() => setSelectedProduct(null)}>✕</button>
              </div>

              <div className="modal-body">
                {selectedProduct.image && (
                  <div className="modal-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-img" />
                  </div>
                )}

                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Product Name</label>
                    <div>{selectedProduct.name}</div>
                  </div>
                  <div className="detail-item">
                    <label>Category</label>
                    <div>{selectedProduct.category}</div>
                  </div>
                  <div className="detail-item full-width" style={{ background: "rgba(46,125,50,0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(46,125,50,0.15)" }}>
                    <label style={{ fontWeight: 600, color: "var(--leaf)" }}>Price Breakdown (per kg)</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginTop: "6px" }}>
                      <div>
                        <span style={{ fontSize: "0.78rem", color: "#666" }}>Farmer Base Price:</span>
                        <div style={{ fontWeight: 600 }}>₹{(selectedProduct.base_price ?? selectedProduct.price).toFixed(2)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.78rem", color: "#666" }}>Platform Commission ({selectedProduct.commission_percent ?? 5}%):</span>
                        <div style={{ fontWeight: 600, color: "#e65100" }}>+₹{(selectedProduct.commission_amount ?? ((selectedProduct.base_price ?? selectedProduct.price) * ((selectedProduct.commission_percent ?? 5) / 100))).toFixed(2)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.78rem", color: "#666" }}>GST ({selectedProduct.gst_percent ?? 5}%):</span>
                        <div style={{ fontWeight: 600, color: "#1565c0" }}>+₹{(selectedProduct.gst_amount ?? ((selectedProduct.base_price ?? selectedProduct.price) * ((selectedProduct.gst_percent ?? 5) / 100))).toFixed(2)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.78rem", color: "#666" }}>Website Selling Price:</span>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--leaf)" }}>₹{selectedProduct.price.toFixed(2)} / kg</div>
                      </div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Current Stock</label>
                    <div>{selectedProduct.stock} kg available</div>
                  </div>
                  <div className="detail-item">
                    <label>Farmer Name</label>
                    <div>{selectedProduct.farmer_name}</div>
                  </div>
                  <div className="detail-item">
                    <label>Farmer Contact</label>
                    <div><a href={`tel:${selectedProduct.farmer_mobile}`}>📞 {selectedProduct.farmer_mobile}</a></div>
                  </div>
                  <div className="detail-item full-width">
                    <label>Description</label>
                    <div className="desc-box">{selectedProduct.description || "No description provided."}</div>
                  </div>
                  <div className="detail-item">
                    <label>Website Visibility</label>
                    <div>
                      <span className={`badge ${selectedProduct.approval_status}`}>
                        {selectedProduct.approval_status === "approved" ? "Live in Shop" : selectedProduct.approval_status}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Added On</label>
                    <div>{new Date(selectedProduct.created_at).toLocaleString("en-IN")}</div>
                  </div>
                  {selectedProduct.remark && (
                    <div className="detail-item full-width">
                      <label>Admin Note / Rejection Reason</label>
                      <div className="remark-box">{selectedProduct.remark}</div>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  {selectedProduct.approval_status !== "approved" && (
                    <button className="ok-large" disabled={busyId === selectedProduct.id} onClick={() => act(selectedProduct.id, "approve")}>
                      ✓ Approve & Publish to Shop
                    </button>
                  )}
                  {selectedProduct.approval_status !== "rejected" && (
                    <button className="danger-large" disabled={busyId === selectedProduct.id} onClick={() => act(selectedProduct.id, "reject", remark)}>
                      ✕ Reject / Hide from Shop
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .wrap { padding: 40px 24px 90px; }
        .page-header { margin-bottom: 22px; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; margin: 0 0 4px; }
        .subhead { color: #6b6555; font-size: 0.88rem; margin: 0; }
        .tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
        .tabs button { border: 1px solid rgba(26,26,21,0.12); background: #fff; padding: 7px 16px; border-radius: 999px; font-size: 0.82rem; cursor: pointer; }
        .tabs button.active { background: var(--soil); color: #efe8d8; border-color: var(--soil); }
        .table-card { background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 14px; overflow: hidden; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
        th { text-align: left; padding: 12px 16px; background: #faf7ee; font-size: 0.74rem; text-transform: uppercase; color: #6b6555; white-space: nowrap; }
        td { padding: 12px 16px; border-top: 1px solid rgba(26,26,21,0.06); vertical-align: middle; white-space: nowrap; }
        .product-title-cell { display: flex; flex-direction: column; }
        .product-id { font-size: 0.74rem; color: #888273; }
        .thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
        .thumb.placeholder { background: linear-gradient(160deg,#f7f2e6,#ede4cd); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .cat-badge { background: #faf7ee; border: 1px solid rgba(26,26,21,0.08); padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; }
        .sub { font-size: 0.76rem; color: #6b6555; }
        .badge { font-size: 0.72rem; padding: 3px 10px; border-radius: 999px; text-transform: capitalize; font-weight: 600; }
        .badge.pending { background: rgba(232,163,61,0.18); color: var(--rust); }
        .badge.approved { background: rgba(76,122,61,0.15); color: var(--leaf); }
        .badge.rejected { background: rgba(200,60,40,0.12); color: #b8391f; }
        .row-actions { display: flex; gap: 8px; align-items: center; white-space: normal; }
        .row-actions button { border: none; padding: 6px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
        .btn-detail { background: #f4f1ea; color: var(--soil); border: 1px solid rgba(26,26,21,0.1) !important; }
        .btn-detail:hover { background: #e8e2d4; }
        .row-actions button.ok { background: var(--leaf); color: #fff; }
        .row-actions button.ok-outline { background: transparent; border: 1px solid var(--leaf) !important; color: var(--leaf); }
        .row-actions button.danger { background: #f4dcd6; color: #b8391f; }
        .row-actions button.danger-outline { background: transparent; border: 1px solid #b8391f !important; color: #b8391f; }
        .row-actions button:disabled { opacity: 0.6; cursor: default; }
        .remark-inline { display: flex; gap: 6px; align-items: center; }
        .remark-inline input { border: 1px solid rgba(26,26,21,0.15); border-radius: 8px; padding: 5px 8px; font-size: 0.78rem; width: 140px; }
        .empty { text-align: center; color: #6b6555; padding: 40px; }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .modal-content {
          background: #fff; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow-y: auto;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 24px; border-bottom: 1px solid rgba(26,26,21,0.08); background: #faf7ee;
        }
        .modal-header h2 { font-family: var(--font-display); font-size: 1.2rem; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b6555; }
        .modal-body { padding: 24px; }
        .modal-img-wrap { margin-bottom: 20px; text-align: center; background: #faf7ee; border-radius: 12px; padding: 12px; }
        .modal-img { max-height: 220px; max-width: 100%; object-fit: contain; border-radius: 8px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-item.full-width { grid-column: span 2; }
        .detail-item label { font-size: 0.75rem; text-transform: uppercase; color: #888273; font-weight: 600; }
        .detail-item div { font-size: 0.95rem; color: var(--soil); }
        .detail-item a { color: var(--leaf); text-decoration: none; font-weight: 600; }
        .desc-box { background: #faf8f5; padding: 10px 14px; border-radius: 8px; font-size: 0.88rem !important; line-height: 1.5; color: #444 !important; }
        .remark-box { background: #faf7ee; padding: 10px 14px; border-radius: 8px; font-style: italic; border-left: 3px solid var(--rust); }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .ok-large { background: var(--leaf); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .danger-large { background: #f4dcd6; color: #b8391f; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
      `}</style>
    </>
  );
}
