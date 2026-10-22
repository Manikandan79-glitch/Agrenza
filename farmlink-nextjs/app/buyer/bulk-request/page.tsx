"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import { listProducts, getProductDetail, submitBulkRequest, getMe, Product, AuthUser, ApiError } from "@/app/lib/api";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/app/lib/products-data";
import "@/app/components/forms.css";

export default function BulkRequestPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Loading...</div>}>
      <BulkRequestForm />
    </Suspense>
  );
}

function BulkRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProductId = Number(searchParams.get("product_id") || 0);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(urlProductId);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(15);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // 1. Check user login
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (me?.user) setUser(me.user);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  // 2. Fetch available products from live API with static fallback
  useEffect(() => {
    (async () => {
      setFetching(true);
      let list: Product[] = [];
      try {
        const res = await listProducts();
        if (res?.products && res.products.length > 0) {
          list = res.products;
        }
      } catch {
        // Fallback to static mock products mapped to their db_ids
        list = FALLBACK_PRODUCTS.map((p) => ({
          id: p.db_id ?? p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          image: null,
          description: p.description,
          icon: p.icon,
          farmer: p.farmer,
          location: p.location,
          status: "active" as const,
        }));
      }

      setProducts(list);

      // Determine initially selected product
      let matched: Product | null = null;
      if (urlProductId > 0) {
        matched = list.find((p) => p.id === urlProductId) || null;
        if (!matched) {
          // Try fetching detail by id if not in the list
          try {
            const detail = await getProductDetail(urlProductId);
            if (detail?.product) matched = detail.product;
          } catch {
            // Not found
          }
        }
      }

      // Default to first product if none matched
      if (!matched && list.length > 0) {
        matched = list[0];
      }

      if (matched) {
        setSelectedProductId(matched.id);
        setSelectedProduct(matched);
      }

      setFetching(false);
    })();
  }, [urlProductId]);

  // Handle product selection change
  function handleSelectProduct(id: number) {
    setSelectedProductId(id);
    const p = products.find((prod) => prod.id === id) || null;
    setSelectedProduct(p);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || user.role !== "buyer") {
      setError("Please log in as a Buyer to submit bulk requests.");
      return;
    }
    if (!selectedProduct || !selectedProductId) {
      setError("Please select a product for your bulk request.");
      return;
    }
    if (qty <= 10) {
      setError("Bulk requests require a minimum quantity of 11 kg.");
      return;
    }
    if (!reason.trim()) {
      setError("Please provide a business or event reason for this bulk request.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await submitBulkRequest(selectedProductId, qty, reason.trim());
      setSubmittedId(res?.request_id ?? null);
      setSubmitted(true);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to submit bulk request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="container bulk-wrap">
        <div className="card">
          <div className="card-top">
            <span className="icon">🧺</span>
            <div>
              <h1>Wholesale Bulk Produce Request</h1>
              <p className="subtitle">
                Request commercial volumes (above 10 kg) directly from verified local farmers with preferential wholesale pricing.
              </p>
            </div>
          </div>

          {/* Non-buyer warning banner */}
          {(!user || user.role !== "buyer") && (
            <div className="auth-alert">
              <span>🔒 <strong>Buyer Login Required:</strong> Only registered buyers can submit bulk purchase inquiries.</span>
              <Link href="/auth/login?redirect=/buyer/bulk-request" className="btn-auth-link">
                Log In as Buyer →
              </Link>
            </div>
          )}

          {submitted ? (
            <div className="success-box">
              <span className="success-icon">✅</span>
              <h3>Bulk Request Submitted Successfully!</h3>
              {submittedId && <p className="req-id">Request ID: <strong>#{submittedId}</strong></p>}
              <p className="req-msg">
                Your request for <strong>{qty} kg</strong> of <strong>{selectedProduct?.name}</strong> has been sent to the admin team and farmer partner.
              </p>
              <div className="success-actions">
                <Link href="/buyer/orders" className="btn-solid">
                  View My Requests in Order Tracking →
                </Link>
                <Link href="/shop" className="btn-outline">
                  Continue Browsing Shop
                </Link>
              </div>
            </div>
          ) : fetching ? (
            <div className="loading-box">
              <p>⏳ Loading available produce catalog…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-box">
              <p>⚠️ No active produce currently available for bulk inquiry.</p>
              <Link href="/shop" className="btn-outline">Return to Shop</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Product Selector Dropdown */}
              <div className="field">
                <label>Select Produce Item *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(Number(e.target.value))}
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price}/kg ({p.category || "Produce"}) [Ready Stock: {p.stock} kg]
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Summary Card */}
              {selectedProduct && (
                <div className="prod-summary">
                  <div className="summary-left">
                    <span className="summary-name">{selectedProduct.name}</span>
                    <span className="summary-farmer">🌾 Farmer: {selectedProduct.farmer || "Verified Partner"}</span>
                  </div>
                  <div className="summary-right">
                    <span className="summary-price">Base: ₹{selectedProduct.price}/kg</span>
                    <span className="summary-stock">Stock: {selectedProduct.stock} kg</span>
                  </div>
                </div>
              )}

              {/* Quantity Field */}
              <div className="field">
                <label>Requested Bulk Quantity (in Kilograms) *</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    step={1}
                    min={11}
                    max={10000}
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 11)}
                    required
                  />
                  <span className="suffix">kg</span>
                </div>
                <div className="qty-hints">
                  <span className="hint-pill">Min: 11 kg</span>
                  {selectedProduct && qty > selectedProduct.stock ? (
                    <span className="hint-warning">
                      ⚠️ Exceeds ready stock ({selectedProduct.stock} kg). The farmer will harvest/supply fresh on approval.
                    </span>
                  ) : (
                    <span className="hint-ok">✓ Ready stock available</span>
                  )}
                </div>
              </div>

              {/* Estimated Total Value */}
              {selectedProduct && (
                <div className="calc-row">
                  <span>Estimated Wholesale Order Value:</span>
                  <strong>₹{(selectedProduct.price * qty).toFixed(2)}</strong>
                </div>
              )}

              {/* Reason / Justification Field */}
              <div className="field">
                <label>Purpose / Reason for Bulk Quantity *</label>
                <textarea
                  rows={3}
                  placeholder="E.g., Restaurant supply, wedding catering, grocery resale, or family celebration"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="error-banner">
                  ⚠️ {error}
                </div>
              )}

              <button className="btn-block" type="submit" disabled={loading || !user || user.role !== "buyer"}>
                {loading ? "Submitting Inquiry…" : "Submit Wholesale Request to Admin & Farmer"}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .bulk-wrap { padding: 48px 24px 90px; display: flex; justify-content: center; }
        .card {
          width: 100%; max-width: 580px; background: #fff;
          border: 1px solid rgba(26,26,21,0.08); border-radius: 18px; padding: 36px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .card-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
        .icon { font-size: 2.2rem; line-height: 1; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.45rem; margin: 0 0 6px; color: #1b3821; }
        .subtitle { color: #6b6555; font-size: 0.88rem; line-height: 1.5; margin: 0; }

        .auth-alert {
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;
          padding: 12px 16px; margin-bottom: 20px; font-size: 0.84rem; color: #92400e;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
        }
        .btn-auth-link {
          background: #d97706; color: #fff; text-decoration: none; padding: 5px 12px;
          border-radius: 999px; font-weight: 700; font-size: 0.78rem;
        }

        .prod-summary {
          background: #f8faf8; border: 1px solid #e2ece2; border-radius: 12px;
          padding: 14px 18px; margin: 6px 0 18px; display: flex; justify-content: space-between; align-items: center;
        }
        .summary-left { display: flex; flex-direction: column; gap: 2px; }
        .summary-name { font-weight: 700; color: #1b3821; font-size: 1rem; }
        .summary-farmer { font-size: 0.82rem; color: #4b5563; }
        .summary-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .summary-price { font-weight: 700; color: #16a34a; font-size: 0.95rem; }
        .summary-stock { font-size: 0.8rem; color: #6b7280; }

        .input-with-suffix { position: relative; display: flex; align-items: center; }
        .input-with-suffix input { width: 100%; padding-right: 48px; }
        .suffix { position: absolute; right: 14px; color: #888; font-weight: 700; font-size: 0.85rem; pointer-events: none; }

        .qty-hints { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 0.8rem; flex-wrap: wrap; }
        .hint-pill { background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 6px; font-weight: 600; }
        .hint-warning { color: #b45309; font-weight: 500; }
        .hint-ok { color: #15803d; font-weight: 600; }

        .calc-row {
          background: #f0fdf4; border: 1px dashed #16a34a; border-radius: 10px;
          padding: 12px 16px; margin: 16px 0; display: flex; justify-content: space-between; align-items: center;
          font-size: 0.9rem; color: #166534;
        }
        .calc-row strong { font-size: 1.15rem; color: #15803d; }

        .error-banner {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          border-radius: 10px; padding: 12px 14px; font-size: 0.85rem; margin-bottom: 16px;
        }

        .btn-block {
          width: 100%; background: #16a34a; color: #fff; padding: 13px;
          border-radius: 999px; font-weight: 700; font-size: 0.95rem; border: none; cursor: pointer;
          transition: background 0.15s;
        }
        .btn-block:hover:not(:disabled) { background: #15803d; }
        .btn-block:disabled { opacity: 0.55; cursor: not-allowed; }

        .success-box { text-align: center; padding: 20px 0; }
        .success-icon { font-size: 3rem; display: block; margin-bottom: 8px; }
        .success-box h3 { font-family: var(--font-display); font-size: 1.3rem; color: #1b3821; margin: 0 0 6px; }
        .req-id { font-size: 0.9rem; color: #6b6555; margin: 0 0 10px; }
        .req-msg { font-size: 0.92rem; color: #374151; line-height: 1.5; margin-bottom: 24px; }
        .success-actions { display: flex; flex-direction: column; gap: 10px; }
        .btn-solid { background: #16a34a; color: #fff; padding: 11px 22px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 0.88rem; }
        .btn-solid:hover { background: #15803d; }
        .btn-outline { border: 1px solid rgba(26,26,21,0.2); color: #1a1a15; padding: 11px 22px; border-radius: 999px; text-decoration: none; font-size: 0.88rem; }

        .loading-box, .empty-box { text-align: center; padding: 36px 0; color: #64748b; }
      `}</style>
    </>
  );
}
