"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";
import { getMe, adminListBulkRequests, adminBulkRequestAction, ApiError, AdminBulkRequest, FarmerStatus } from "@/app/lib/api";

const TABS: { key: FarmerStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default function AdminBulkRequestsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<FarmerStatus>("pending");
  const [requests, setRequests] = useState<AdminBulkRequest[]>([]);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [remarkFor, setRemarkFor] = useState<number | null>(null);
  const [remark, setRemark] = useState("");

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
      const res = await adminListBulkRequests(tab);
      setRequests(res.requests);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load bulk requests.");
    }
  }

  async function act(id: number, action: "approve" | "reject", withRemark?: string) {
    setBusyId(id);
    setError("");
    try {
      await adminBulkRequestAction(id, action, withRemark);
      setRemarkFor(null);
      setRemark("");
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
        <h1>Bulk order requests</h1>
        {error && <div className="form-error">{error}</div>}

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="cards">
          {requests.length === 0 && <div className="empty-card">No bulk requests in this list.</div>}
          {requests.map((r) => (
            <div className="request-card" key={r.id}>
              <div className="head">
                <div>
                  <strong>{r.product_name}</strong> — {r.qty} kg
                </div>
                <span className={`badge ${r.status}`}>{r.status}</span>
              </div>
              <p className="reason">“{r.reason}”</p>
              <div className="meta">
                <span>{r.buyer_name}</span>
                <span>{r.buyer_email || r.buyer_mobile}</span>
                <span>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
              </div>

              {r.status === "pending" && (
                <div className="actions">
                  <button className="ok" disabled={busyId === r.id} onClick={() => act(r.id, "approve")}>
                    Approve
                  </button>
                  {remarkFor === r.id ? (
                    <span className="remark-inline">
                      <input
                        placeholder="Reason (optional)"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                      />
                      <button className="danger" disabled={busyId === r.id} onClick={() => act(r.id, "reject", remark)}>
                        Confirm reject
                      </button>
                    </span>
                  ) : (
                    <button className="danger" disabled={busyId === r.id} onClick={() => setRemarkFor(r.id)}>
                      Reject
                    </button>
                  )}
                </div>
              )}
              {r.status !== "pending" && r.remark && <p className="remark">Admin note: “{r.remark}”</p>}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .wrap { padding: 40px 24px 90px; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; margin: 0 0 18px; }
        .tabs { display: flex; gap: 8px; margin-bottom: 18px; }
        .tabs button { border: 1px solid rgba(26,26,21,0.12); background: #fff; padding: 7px 16px; border-radius: 999px; font-size: 0.82rem; cursor: pointer; }
        .tabs button.active { background: var(--soil); color: #efe8d8; border-color: var(--soil); }
        .cards { display: flex; flex-direction: column; gap: 14px; }
        .empty-card { background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 14px; padding: 40px; text-align: center; color: #6b6555; }
        .request-card { background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 14px; padding: 18px 20px; }
        .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .badge { font-size: 0.72rem; padding: 3px 10px; border-radius: 999px; text-transform: capitalize; }
        .badge.pending { background: rgba(232,163,61,0.18); color: var(--rust); }
        .badge.approved { background: rgba(76,122,61,0.15); color: var(--leaf); }
        .badge.rejected { background: rgba(200,60,40,0.12); color: #b8391f; }
        .reason { color: #4a4638; font-style: italic; margin: 6px 0; }
        .meta { display: flex; gap: 16px; font-size: 0.78rem; color: #6b6555; margin-bottom: 10px; }
        .actions { display: flex; gap: 8px; align-items: center; }
        .actions button { border: none; padding: 6px 14px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        .actions button.ok { background: var(--leaf); color: #fff; }
        .actions button.danger { background: #f4dcd6; color: #b8391f; }
        .actions button:disabled { opacity: 0.6; cursor: default; }
        .remark-inline { display: flex; gap: 6px; align-items: center; }
        .remark-inline input { border: 1px solid rgba(26,26,21,0.15); border-radius: 8px; padding: 5px 8px; font-size: 0.78rem; width: 160px; }
        .remark { color: #6b6555; font-size: 0.8rem; margin: 4px 0 0; }
      `}</style>
    </>
  );
}
