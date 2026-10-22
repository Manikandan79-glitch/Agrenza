"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FarmerNav from "@/app/components/FarmerNav";
import { listCategories, getProductDetail, updateProduct, ApiError, Product } from "@/app/lib/api";
import "@/app/components/forms.css";

const GST_RATES = [
  { rate: 0, label: "0% (Exempted / Fresh Farm Produce)" },
  { rate: 5, label: "5% (Standard Agricultural Products)" },
  { rate: 12, label: "12% (Processed / Packaged Produce)" },
  { rate: 18, label: "18% (Specialty Items)" },
];

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [basePrice, setBasePrice] = useState("");
  const [gstPercent, setGstPercent] = useState(5);
  const [commissionPercent, setCommissionPercent] = useState(5);
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [description, setDescription] = useState("");
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Load categories
        let cats: { id: number; name: string }[] = [];
        try {
          const catRes = await listCategories();
          if (catRes.categories && catRes.categories.length > 0) {
            cats = catRes.categories;
            setCategories(cats);
          }
        } catch {
          cats = [
            { id: 1, name: "Vegetables" },
            { id: 2, name: "Fruits" },
            { id: 3, name: "Grains & Cereals" },
            { id: 4, name: "Pulses" },
            { id: 5, name: "Spices" },
            { id: 6, name: "Dairy" },
            { id: 17, name: "Herbs & Greens" },
          ];
          setCategories(cats);
        }

        // Load existing product
        const res = await getProductDetail(params.id);
        const p = res.product;
        setName(p.name);
        if (p.category_id) {
          setCategoryId(p.category_id);
        } else {
          const match = cats.find((c) => c.name.toLowerCase() === p.category.toLowerCase());
          if (match) setCategoryId(match.id);
        }

        const bPrice = p.base_price ?? p.price;
        setBasePrice(String(bPrice));
        setGstPercent(p.gst_percent ?? 5);
        setCommissionPercent(p.commission_percent ?? 5);
        setStock(String(p.stock));
        setStatus(p.status ?? "active");
        setDescription(p.description ?? "");
        setExistingImage(p.image);
      } catch (err: any) {
        setError(err instanceof ApiError ? err.message : "Failed to load product details.");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [params.id]);

  // Live price calculations
  const numBase = parseFloat(basePrice) || 0;
  const numGstAmount = Math.round(numBase * (gstPercent / 100) * 100) / 100;
  const numCommissionAmount = Math.round(numBase * (commissionPercent / 100) * 100) / 100;
  const numFinalPrice = Math.round((numBase + numGstAmount + numCommissionAmount) * 100) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Product name is required.");
    if (numBase <= 0) return setError("Enter a valid base price per kg.");
    if (parseFloat(stock) < 0) return setError("Stock cannot be negative.");

    setError("");
    setSaving(true);

    try {
      const data = new FormData();
      data.append("id", params.id);
      data.append("name", name.trim());
      data.append("category_id", String(categoryId));
      data.append("base_price", String(numBase));
      data.append("gst_percent", String(gstPercent));
      data.append("commission_percent", String(commissionPercent));
      data.append("price_per_kg", String(numFinalPrice));
      data.append("stock_kg", stock);
      data.append("status", status);
      data.append("description", description.trim());
      if (newFile) {
        data.append("product_image", newFile);
      }

      await updateProduct(data);
      router.push("/farmer/products");
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to save product changes.");
    } finally {
      setSaving(false);
    }
  }

  if (initialLoading) {
    return (
      <>
        <FarmerNav />
        <div className="container" style={{ padding: "80px 24px", textAlign: "center", color: "#666" }}>
          <p>Loading product information…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <FarmerNav />
      <div className="container form-wrap">
        <div className="form-card">
          <div className="header-info">
            <h1>Edit Farm Product</h1>
            <p className="subtitle">
              Update pricing, stock, or photos. Base price will calculate GST and website commission automatically.
            </p>
          </div>

          <div className="notice-banner">
            ℹ️ <strong>Note:</strong> Saving changes will submit this product for review before updates go live on the shop.
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <div className="row">
              <div className="field">
                <label>Product Name <span className="req">*</span></label>
                <input
                  placeholder="e.g. Organic Tomatoes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Section with GST and Commission */}
            <div className="pricing-box">
              <h3>Pricing, Commission &amp; GST Details</h3>

              <div className="row">
                <div className="field">
                  <label>Farmer Base Price (₹ / kg) <span className="req">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 100"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    required
                  />
                  <small className="field-hint">The net amount you will receive per kg.</small>
                </div>

                <div className="field">
                  <label>GST Rate</label>
                  <select value={gstPercent} onChange={(e) => setGstPercent(Number(e.target.value))}>
                    {GST_RATES.map((g) => (
                      <option key={g.rate} value={g.rate}>{g.label}</option>
                    ))}
                  </select>
                  <small className="field-hint">Goods and Services Tax on produce.</small>
                </div>
              </div>

              {/* Real-time Transparent Price Breakdown Card */}
              {numBase > 0 && (
                <div className="price-breakdown-card">
                  <div className="breakdown-title">Automated Price Breakdown:</div>
                  <div className="breakdown-row">
                    <span>🧑‍🌾 Farmer Net Earnings (Base Price):</span>
                    <strong>₹{numBase.toFixed(2)} / kg</strong>
                  </div>
                  <div className="breakdown-row">
                    <span>🏢 Website Platform Commission ({commissionPercent}%):</span>
                    <span className="add-amount">+ ₹{numCommissionAmount.toFixed(2)} / kg</span>
                  </div>
                  <div className="breakdown-row">
                    <span>🏛️ Applicable GST ({gstPercent}%):</span>
                    <span className="add-amount">+ ₹{numGstAmount.toFixed(2)} / kg</span>
                  </div>
                  <div className="breakdown-divider"></div>
                  <div className="breakdown-row total">
                    <span>🛒 Final Selling Price on Website:</span>
                    <strong className="final-price">₹{numFinalPrice.toFixed(2)} / kg</strong>
                  </div>
                  <small className="breakdown-note">
                    Buyers in the online shop will purchase this item at ₹{numFinalPrice.toFixed(2)}/kg.
                  </small>
                </div>
              )}
            </div>

            <div className="row">
              <div className="field">
                <label>Available Stock (kg) <span className="req">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Listing Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")}>
                  <option value="active">Active (Available for order)</option>
                  <option value="inactive">Inactive (Temporarily hidden)</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Product Image</label>
              {existingImage && !newFile && (
                <div className="current-img-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={existingImage} alt="Current product" className="thumb-preview" />
                  <span className="img-label">Current photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
              />
              <small className="field-hint">Select a new image file only if you want to replace the existing photo.</small>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                rows={3}
                placeholder="Describe harvest date, pesticide-free, organic status, quality details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => router.push("/farmer/products")}
                disabled={saving}
              >
                Cancel
              </button>
              <button className="btn-save" type="submit" disabled={saving}>
                {saving ? "Saving Changes…" : "Update Product & Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .form-wrap {
          padding: 40px 24px 90px;
        }
        .form-card {
          max-width: 680px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid rgba(26, 26, 21, 0.08);
          border-radius: 16px;
          padding: 36px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .header-info {
          margin-bottom: 20px;
        }
        h1 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0 0 6px;
        }
        .subtitle {
          color: #6b6555;
          font-size: 0.88rem;
          margin: 0;
          line-height: 1.4;
        }
        .notice-banner {
          background: #eef7ee;
          border: 1px solid #c8e6c9;
          color: #2e7d32;
          font-size: 0.84rem;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 22px;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .row {
            grid-template-columns: 1fr;
          }
        }
        .req {
          color: #d32f2f;
        }
        .field-hint {
          display: block;
          color: #888;
          font-size: 0.74rem;
          margin-top: 4px;
        }
        .pricing-box {
          background: #fdfbf7;
          border: 1px solid rgba(139, 107, 61, 0.18);
          border-radius: 12px;
          padding: 18px 20px;
          margin: 16px 0 20px;
        }
        .pricing-box h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0 0 14px;
          color: var(--soil);
        }
        .price-breakdown-card {
          margin-top: 14px;
          background: #fff;
          border: 1px dashed rgba(46, 125, 50, 0.35);
          border-radius: 10px;
          padding: 14px 16px;
        }
        .breakdown-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #555;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.86rem;
          padding: 3px 0;
          color: #333;
        }
        .add-amount {
          color: #d97706;
          font-weight: 500;
        }
        .breakdown-divider {
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          margin: 8px 0;
        }
        .breakdown-row.total {
          font-size: 0.98rem;
          font-weight: 600;
          color: #1a1a15;
        }
        .final-price {
          color: var(--leaf);
          font-size: 1.15rem;
        }
        .breakdown-note {
          display: block;
          font-size: 0.76rem;
          color: #777;
          margin-top: 6px;
        }
        .current-img-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .thumb-preview {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #ddd;
        }
        .img-label {
          font-size: 0.8rem;
          color: #666;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }
        .btn-cancel {
          flex: 1;
          background: #f5f5f5;
          border: 1px solid #ddd;
          color: #555;
          border-radius: 8px;
          padding: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-cancel:hover {
          background: #eee;
        }
        .btn-save {
          flex: 2;
          background: var(--leaf);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-save:hover:not(:disabled) {
          background: #256628;
        }
        .btn-save:disabled, .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
