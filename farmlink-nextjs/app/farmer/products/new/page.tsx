"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FarmerNav from "@/app/components/FarmerNav";
import { listCategories, createProduct, ApiError } from "@/app/lib/api";
import "@/app/components/forms.css";

const GST_RATES = [
  { rate: 0, label: "0% (Exempted / Fresh Farm Produce)" },
  { rate: 5, label: "5% (Standard Agricultural Products)" },
  { rate: 12, label: "12% (Processed / Packaged Produce)" },
  { rate: 18, label: "18% (Specialty Items)" },
];

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [basePrice, setBasePrice] = useState("");
  const [gstPercent, setGstPercent] = useState(5);
  const [commissionPercent] = useState(5); // 5% website platform commission
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await listCategories();
        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
          setCategoryId(res.categories[0].id);
        }
      } catch {
        // Fallback default categories if API fails
        setCategories([
          { id: 1, name: "Vegetables" },
          { id: 2, name: "Fruits" },
          { id: 3, name: "Grains & Cereals" },
          { id: 4, name: "Pulses" },
          { id: 5, name: "Spices" },
          { id: 6, name: "Dairy" },
          { id: 17, name: "Herbs & Greens" },
        ]);
      }
    })();
  }, []);

  // Live price calculations
  const numBase = parseFloat(basePrice) || 0;
  const numGstAmount = Math.round(numBase * (gstPercent / 100) * 100) / 100;
  const numCommissionAmount = Math.round(numBase * (commissionPercent / 100) * 100) / 100;
  const numFinalPrice = Math.round((numBase + numGstAmount + numCommissionAmount) * 100) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Product name is required.");
    if (numBase <= 0) return setError("Enter a valid base price per kg.");
    if (parseFloat(stock) <= 0) return setError("Enter a valid stock quantity.");
    if (!file) return setError("Please select a product image.");

    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", name.trim());
      data.append("category_id", String(categoryId));
      data.append("base_price", String(numBase));
      data.append("gst_percent", String(gstPercent));
      data.append("commission_percent", String(commissionPercent));
      data.append("price_per_kg", String(numFinalPrice));
      data.append("stock_kg", stock);
      data.append("description", description.trim());
      data.append("product_image", file);

      await createProduct(data);
      router.push("/farmer/products");
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FarmerNav />
      <div className="container form-wrap">
        <div className="form-card">
          <div className="header-info">
            <h1>Add New Farm Product</h1>
            <p className="subtitle">
              Enter your base price — GST and website commission are automatically calculated and added to the buyer price.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <div className="row">
              <div className="field">
                <label>Product Name</label>
                <input
                  placeholder="e.g. Organic Tomatoes, Fresh Wheat"
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
                  min="1"
                  placeholder="e.g. 500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Product Image <span className="req">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
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

            <button className="btn-block" type="submit" disabled={loading}>
              {loading ? "Adding Product…" : "Submit Product for Approval"}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .form-wrap { padding: 40px 24px 90px; }
        .form-card {
          max-width: 680px; margin: 0 auto; background: #fff;
          border: 1px solid rgba(26,26,21,0.08); border-radius: 16px; padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .header-info { margin-bottom: 24px; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; margin: 0 0 6px; }
        .subtitle { color: #6b6555; font-size: 0.88rem; margin: 0; line-height: 1.4; }
        .req { color: var(--rust); }
        .field-hint { font-size: 0.75rem; color: #888273; margin-top: 4px; display: block; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .pricing-box {
          background: #faf7ee; border: 1px solid rgba(232,163,61,0.25); border-radius: 12px;
          padding: 20px; margin: 18px 0;
        }
        .pricing-box h3 {
          margin: 0 0 14px; font-size: 0.95rem; font-family: var(--font-display);
          color: var(--soil); font-weight: 700;
        }

        .price-breakdown-card {
          background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 10px;
          padding: 16px 18px; margin-top: 14px;
        }
        .breakdown-title {
          font-size: 0.78rem; text-transform: uppercase; color: #888273; font-weight: 700;
          letter-spacing: 0.03em; margin-bottom: 10px;
        }
        .breakdown-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.88rem; margin-bottom: 6px; color: var(--soil);
        }
        .add-amount { color: var(--rust); font-weight: 600; }
        .breakdown-divider {
          height: 1px; background: rgba(26,26,21,0.1); margin: 10px 0;
        }
        .breakdown-row.total {
          font-size: 1.05rem; font-weight: 700; color: var(--soil);
        }
        .final-price { color: var(--leaf); font-size: 1.25rem; font-family: var(--font-display); }
        .breakdown-note { display: block; font-size: 0.76rem; color: #777; margin-top: 6px; }

        @media (max-width: 600px) {
          .row { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
