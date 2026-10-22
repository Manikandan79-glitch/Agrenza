"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import ProductImage from "@/app/components/ProductImage";
import { getProduct as getFallbackProduct } from "@/app/lib/products-data";
import { getProductDetail } from "@/app/lib/api";
import { useCart } from "@/app/lib/cart-context";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addItem } = useCart();
  const fallback = getFallbackProduct(Number(params.id));
  const [product, setProduct] = useState<any>(fallback);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProductDetail(params.id);
        if (res.product) {
          setProduct({
            id: res.product.id,
            name: res.product.name,
            farmer: res.product.farmer || "Verified Farmer",
            location: "Local Farm",
            price: res.product.price,
            base_price: res.product.base_price,
            gst_percent: res.product.gst_percent,
            gst_amount: res.product.gst_amount,
            commission_percent: res.product.commission_percent,
            category: res.product.category,
            icon: "tomato" as const,
            stock: res.product.stock,
            description: res.product.description,
            image: res.product.image || undefined,
          });
        }
      } catch {
        // Fallback to static product
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  function onPanelMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${-py * 10}deg) rotateY(${px * 12}deg)`;
  }
  function onPanelLeave() {
    const el = panelRef.current;
    if (el) el.style.transform = "rotateX(0) rotateY(0)";
  }

  if (loading && !product) {
    return (
      <>
        <Nav />
        <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
          <p>Loading product...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Nav />
        <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
          <p>Product not found.</p>
          <Link href="/shop">Back to shop</Link>
        </div>
        <Footer />
      </>
    );
  }

  const isBulk = qty > 10;

  function handleAdd() {
    addItem(product!, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <Nav />
      <div className="container detail">
        <div className="image-panel-wrap" onMouseMove={onPanelMove} onMouseLeave={onPanelLeave}>
          <div className="image-panel" ref={panelRef}>
            <ProductImage src={product.image} icon={product.icon} alt={product.name} iconSize={140} />
          </div>
        </div>
        <div className="info-panel">
          <span className="badge">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="farmer">Sold by <strong>{product.farmer}</strong>, {product.location}</p>
          
          <div className="price-block">
            <p className="price">₹{product.price}/kg</p>
            <div className="tax-inclusive-tag">
              ✓ All taxes &amp; fees included (Farmer Base Rate + {product.gst_percent ?? 5}% GST &amp; website fee)
            </div>
          </div>

          <p className="desc">{product.description}</p>
          <p className="stock">Available stock: {product.stock} kg</p>

          {product.stock <= 0 ? (
            <div className="alert-danger">Out of stock.</div>
          ) : (
            <>
              <div className="qty-row">
                <label>Quantity (kg)</label>
                <input
                  type="number" step={0.5} min={0.5} max={product.stock}
                  value={qty}
                  onChange={(e) => setQty(parseFloat(e.target.value) || 0.5)}
                />
              </div>

              {isBulk && (
                <div className="alert-info">
                  Orders above <strong>10 kg</strong> need admin approval via a{" "}
                  <Link href={`/buyer/bulk-request?product_id=${product.id}`}>bulk request</Link>.
                </div>
              )}

              <div className="actions">
                <button className="btn-add" onClick={handleAdd} disabled={isBulk}>
                  {added ? "Added ✓" : "Add to cart"}
                </button>
                <Link href={`/buyer/bulk-request?product_id=${product.id}`} className="btn-outline-link">
                  Need more than 10 kg?
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .detail {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
          padding: 48px 24px 90px;
        }
        .image-panel-wrap { perspective: 1200px; }
        .image-panel {
          background: linear-gradient(160deg, #f7f2e6, #ede4cd);
          border-radius: 18px;
          height: 340px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 24px 40px rgba(22, 36, 26, 0.16);
        }
        .badge {
          display: inline-block;
          font-size: 0.75rem;
          background: rgba(76, 122, 61, 0.14);
          color: var(--leaf);
          padding: 3px 12px;
          border-radius: 999px;
          margin-bottom: 12px;
        }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 2rem; margin: 0 0 8px; }
        .farmer { color: #6b6555; margin: 0 0 14px; }
        .price-block { margin-bottom: 18px; }
        .price { font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--rust); margin: 0 0 6px; }
        .tax-inclusive-tag {
          display: inline-block;
          font-size: 0.78rem;
          color: #2e7d32;
          background: rgba(46, 125, 50, 0.08);
          border: 1px solid rgba(46, 125, 50, 0.2);
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 500;
        }
        .desc { line-height: 1.6; color: #4a4a3f; margin: 0 0 14px; }
        .stock { font-size: 0.85rem; color: #6b6555; margin: 0 0 22px; }
        .qty-row { max-width: 200px; margin-bottom: 16px; }
        .qty-row label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 6px; }
        .qty-row input {
          width: 100%; padding: 10px 12px; border-radius: 9px;
          border: 1px solid rgba(26,26,21,0.18); font-size: 0.95rem;
        }
        .alert-info {
          background: rgba(232, 163, 61, 0.14);
          border: 1px solid rgba(232, 163, 61, 0.35);
          color: #6b4a12;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 18px;
        }
        .alert-info :global(a) { color: var(--rust); font-weight: 600; }
        .alert-danger {
          background: rgba(194, 54, 22, 0.1);
          border: 1px solid rgba(194, 54, 22, 0.3);
          color: var(--chili);
          padding: 12px 14px;
          border-radius: 10px;
        }
        .actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-add {
          background: var(--soil); color: var(--paper); border: none;
          padding: 13px 26px; border-radius: 999px; font-weight: 600;
        }
        .btn-add:hover { background: var(--leaf); }
        .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-outline-link {
          border: 1px solid rgba(26,26,21,0.2);
          padding: 13px 22px; border-radius: 999px; font-size: 0.9rem;
        }
        @media (max-width: 760px) {
          .detail { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
