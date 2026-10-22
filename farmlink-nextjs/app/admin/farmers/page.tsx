"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { getMe, adminListFarmers, adminFarmerAction, ApiError, AdminFarmer, FarmerStatus } from "@/app/lib/api";

const TABS: { key: FarmerStatus; label: string }[] = [
  { key: "pending", label: "Pending Approval" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All Farmers" },
];

export default function AdminFarmersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<FarmerStatus>("pending");
  const [farmers, setFarmers] = useState<AdminFarmer[]>([]);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [remarkFor, setRemarkFor] = useState<number | null>(null);
  const [remark, setRemark] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<AdminFarmer | null>(null);

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
      const res = await adminListFarmers(tab);
      setFarmers(res.farmers);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load farmers.");
    }
  }

  async function act(id: number, action: "approve" | "reject", withRemark?: string) {
    setBusyId(id);
    setError("");
    try {
      await adminFarmerAction(id, action, withRemark);
      setRemarkFor(null);
      setRemark("");
      if (selectedFarmer && selectedFarmer.id === id) {
        setSelectedFarmer({
          ...selectedFarmer,
          status: action === "approve" ? "approved" : "rejected",
          remark: withRemark || selectedFarmer.remark,
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
            <h1>Farmer Management & Verification</h1>
            <p className="subhead">Review farmer registrations, Aadhaar details, and approve or reject accounts.</p>
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
                <th>Farmer</th>
                <th>Contact</th>
                <th>Aadhaar</th>
                <th>Products</th>
                <th>Total Sales</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {farmers.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">No farmers found in this tab.</td>
                </tr>
              )}
              {farmers.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="farmer-name-cell">
                      <strong>{f.name}</strong>
                      <span className="farmer-id">ID: #{f.id}</span>
                    </div>
                  </td>
                  <td>
                    <div>📱 {f.mobile}</div>
                    {f.email && <div className="sub">✉️ {f.email}</div>}
                  </td>
                  <td>
                    {f.aadhaar ? <span className="aadhaar-badge">🆔 {f.aadhaar}</span> : <span className="sub">—</span>}
                  </td>
                  <td>
                    <span className="count-badge">{f.total_products ?? 0} items</span>
                  </td>
                  <td>
                    <strong>₹{(f.total_sales ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                  </td>
                  <td>
                    <span className={`badge ${f.status}`}>{f.status}</span>
                  </td>
                  <td>{new Date(f.joined).toLocaleDateString("en-IN")}</td>
                  <td className="row-actions">
                    <button className="btn-detail" onClick={() => setSelectedFarmer(f)}>
                      Details
                    </button>

                    {/* Pending Approval: Approve or Reject */}
                    {f.status === "pending" && (
                      <>
                        <button className="ok" disabled={busyId === f.id} onClick={() => act(f.id, "approve")}>
                          Approve
                        </button>
                        {remarkFor === f.id ? (
                          <span className="remark-inline">
                            <input
                              placeholder="Reason (optional)"
                              value={remark}
                              onChange={(e) => setRemark(e.target.value)}
                            />
                            <button className="danger" disabled={busyId === f.id} onClick={() => act(f.id, "reject", remark)}>
                              Confirm
                            </button>
                          </span>
                        ) : (
                          <button className="danger" disabled={busyId === f.id} onClick={() => setRemarkFor(f.id)}>
                            Reject
                          </button>
                        )}
                      </>
                    )}

                    {/* Already Approved: Option to Reject/Suspend */}
                    {f.status === "approved" && (
                      <>
                        {remarkFor === f.id ? (
                          <span className="remark-inline">
                            <input
                              placeholder="Reason (optional)"
                              value={remark}
                              onChange={(e) => setRemark(e.target.value)}
                            />
                            <button className="danger" disabled={busyId === f.id} onClick={() => act(f.id, "reject", remark)}>
                              Confirm Suspend
                            </button>
                          </span>
                        ) : (
                          <button className="danger-outline" disabled={busyId === f.id} onClick={() => setRemarkFor(f.id)}>
                            Reject
                          </button>
                        )}
                      </>
                    )}

                    {/* Already Rejected: Option to Re-approve */}
                    {f.status === "rejected" && (
                      <button className="ok-outline" disabled={busyId === f.id} onClick={() => act(f.id, "approve")}>
                        Re-Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Farmer Details Modal */}
        {selectedFarmer && (
          <div className="modal-backdrop" onClick={() => setSelectedFarmer(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Farmer Details — {selectedFarmer.name}</h2>
                <button className="close-btn" onClick={() => setSelectedFarmer(null)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <div>{selectedFarmer.name}</div>
                  </div>
                  <div className="detail-item">
                    <label>Mobile Number</label>
                    <div><a href={`tel:${selectedFarmer.mobile}`}>📞 {selectedFarmer.mobile}</a></div>
                  </div>
                  <div className="detail-item">
                    <label>Email Address</label>
                    <div>{selectedFarmer.email ? <a href={`mailto:${selectedFarmer.email}`}>✉️ {selectedFarmer.email}</a> : "—"}</div>
                  </div>
                  <div className="detail-item">
                    <label>Aadhaar Card</label>
                    <div>{selectedFarmer.aadhaar || "Not provided"}</div>
                  </div>
                  <div className="detail-item">
                    <label>Current Status</label>
                    <div><span className={`badge ${selectedFarmer.status}`}>{selectedFarmer.status}</span></div>
                  </div>
                  <div className="detail-item">
                    <label>Registration Date</label>
                    <div>{new Date(selectedFarmer.joined).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="detail-item">
                    <label>Listed Products</label>
                    <div>{selectedFarmer.total_products ?? 0} items</div>
                  </div>
                  <div className="detail-item">
                    <label>Total Sales Volume</label>
                    <div>₹{(selectedFarmer.total_sales ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                  </div>
                  {selectedFarmer.remark && (
                    <div className="detail-item full-width">
                      <label>Admin Note / Remark</label>
                      <div className="remark-box">{selectedFarmer.remark}</div>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  {selectedFarmer.status !== "approved" && (
                    <button className="ok-large" disabled={busyId === selectedFarmer.id} onClick={() => act(selectedFarmer.id, "approve")}>
                      ✓ Approve Farmer
                    </button>
                  )}
                  {selectedFarmer.status !== "rejected" && (
                    <button className="danger-large" disabled={busyId === selectedFarmer.id} onClick={() => act(selectedFarmer.id, "reject", remark)}>
                      ✕ Reject Farmer
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
        .farmer-name-cell { display: flex; flex-direction: column; }
        .farmer-id { font-size: 0.74rem; color: #888273; }
        .aadhaar-badge { font-family: var(--font-mono); font-size: 0.8rem; background: #f4f1ea; padding: 3px 8px; border-radius: 6px; }
        .count-badge { background: #f2f7ef; color: var(--leaf); padding: 3px 8px; border-radius: 6px; font-weight: 600; font-size: 0.8rem; }
        .sub { font-size: 0.78rem; color: #6b6555; }
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
          background: #fff; border-radius: 16px; width: 100%; max-width: 580px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow: hidden;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 24px; border-bottom: 1px solid rgba(26,26,21,0.08); background: #faf7ee;
        }
        .modal-header h2 { font-family: var(--font-display); font-size: 1.2rem; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b6555; }
        .modal-body { padding: 24px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-item.full-width { grid-column: span 2; }
        .detail-item label { font-size: 0.75rem; text-transform: uppercase; color: #888273; font-weight: 600; }
        .detail-item div { font-size: 0.95rem; color: var(--soil); }
        .detail-item a { color: var(--leaf); text-decoration: none; font-weight: 600; }
        .remark-box { background: #faf7ee; padding: 10px 14px; border-radius: 8px; font-style: italic; border-left: 3px solid var(--rust); }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .ok-large { background: var(--leaf); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .danger-large { background: #f4dcd6; color: #b8391f; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
      `}</style>
    </>
  );
}
