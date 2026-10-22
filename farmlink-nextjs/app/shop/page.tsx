"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import ProductImage from "@/app/components/ProductImage";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/app/lib/products-data";
import { listProducts, listCategories } from "@/app/lib/api";
import { useCart } from "@/app/lib/cart-context";

const ALL_CATEGORY_OPTIONS = [
  "Vegetables",
  "Fruits",
  "Leafy Greens",
  "Tubers & Roots",
  "Grains & Pulses",
  "Spices & Herbs",
  "Dairy & Organic",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  All: "🌾",
  Vegetables: "🥦",
  Fruits: "🍎",
  "Leafy Greens": "🥬",
  "Tubers & Roots": "🥔",
  "Grains & Pulses": "🌾",
  "Spices & Herbs": "🌶️",
  "Dairy & Organic": "🥛",
};

export default function ShopPage() {
  const { addItem } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [items, setItems] = useState<any[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(ALL_CATEGORY_OPTIONS);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          listProducts().catch(() => ({ products: [] })),
          listCategories().catch(() => ({ categories: [] })),
        ]);

        if (prodRes.products && prodRes.products.length > 0) {
          const apiProds = prodRes.products.map((p) => ({
            id: p.id,
            name: p.name,
            farmer: p.farmer || "Verified Farmer",
            location: "Local Farm",
            price: p.price,
            category: p.category,
            icon: "tomato" as const,
            stock: p.stock,
            description: p.description,
            image: p.image || undefined,
            base_price: p.base_price,
            gst_percent: p.gst_percent,
          }));
          setItems(apiProds);
        }

        const dbCats = catRes.categories?.map((c) => c.name) || [];
        const prodCats = prodRes.products?.map((p) => p.category) || [];
        const combinedCats = Array.from(new Set([...ALL_CATEGORY_OPTIONS, ...dbCats, ...prodCats])).filter(Boolean);
        setCategories(combinedCats);
      } catch {
        setCategories(ALL_CATEGORY_OPTIONS);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || p.category.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  function handleQuickAdd(e: React.MouseEvent, item: any) {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        stock: item.stock || 999,
        description: item.description || "",
        farmer: item.farmer || "",
        location: item.location || "",
        icon: item.icon || "tomato",
        image: item.image,
      },
      1
    );
    setAddedToast(item.name);
    setTimeout(() => setAddedToast(null), 2500);
  }

  return (
    <>
      <Nav />
      <section className="shop-hero">
        <div className="container">
          <h1>Fresh from farm to your doorstep</h1>
          <p className="lead">Transparent pricing with GST included.</p>
        </div>
      </section>

      <div className="container shop-body">
        <div className="filters">
          <input
            className="search"
            placeholder="Search products by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="chips">
            <button
              className={category === "All" ? "active" : ""}
              onClick={() => setCategory("All")}
            >
              🌾 All Products
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_EMOJIS[c] || "🌱"} {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-category-card">
            <span className="empty-cat-icon">{CATEGORY_EMOJIS[category] || "🌱"}</span>
            <h3>No products found in &ldquo;{category}&rdquo;</h3>
            <p>Local farmers will list new harvest soon. Check out other produce categories!</p>
            <button
              type="button"
              onClick={() => setCategory("All")}
              className="btn-view-all-cats"
            >
              🌾 View All Products
            </button>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <div key={p.id} className="card-wrapper">
                <Link href={`/shop/${p.id}`} className="card">
                  <div className="card-top">
                    <ProductImage src={p.image} icon={p.icon} alt={p.name} iconSize={54} />
                  </div>
                  <span className="badge">{p.category}</span>
                  <h4>{p.name}</h4>
                  <p className="farmer">By {p.farmer}, {p.location}</p>
                  <div className="price-row">
                    <div>
                      <p className="price">₹{p.price}/kg</p>
                      <span className="price-badge">Incl. GST &amp; fee</span>
                    </div>
                    <button
                      type="button"
                      className="btn-quick-add"
                      onClick={(e) => handleQuickAdd(e, p)}
                      title="Add 1 kg to cart"
                    >
                      + Add
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD TO CART TOAST */}
      {addedToast && (
        <div className="add-toast">
          <span className="toast-icon">✅</span>
          <div className="toast-text">
            <strong>Added to Cart!</strong>
            <span>1 kg of {addedToast} added.</span>
          </div>
          <Link href="/buyer/cart" className="btn-toast-cart">
            View Cart →
          </Link>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .shop-hero {
          background: linear-gradient(135deg, var(--soil-deep), var(--soil));
          color: #efe8d8;
          padding: 56px 0;
        }
        h1 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(1.9rem, 4vw, 2.6rem);
          margin: 0 0 10px;
        }
        .lead { color: #cfc8b4; margin: 0; }

        .shop-body { padding: 40px 24px 80px; }
        .filters { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-bottom: 34px; }
        .search {
          flex: 1;
          min-width: 220px;
          padding: 12px 16px;
          border-radius: 999px;
          border: 1px solid rgba(26, 26, 21, 0.16);
          font-size: 0.92rem;
          background: #fff;
          outline: none;
        }
        .search:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.15); }

        .chips { display: flex; gap: 10px; flex-wrap: wrap; }
        .chips button {
          border: 1.5px solid rgba(26, 26, 21, 0.12);
          background: #fff;
          padding: 9px 18px;
          border-radius: 999px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .chips button:hover {
          border-color: #16a34a;
          color: #16a34a;
          background: #f0fdf4;
        }
        .chips button.active {
          background: #16a34a;
          color: #ffffff;
          border-color: #16a34a;
          box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
        }

        .empty-category-card {
          text-align: center;
          padding: 60px 24px;
          background: #fff;
          border: 1px dashed rgba(26, 26, 21, 0.15);
          border-radius: 16px;
          max-width: 540px;
          margin: 20px auto;
        }
        .empty-cat-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
        .empty-category-card h3 { font-family: var(--font-display); font-size: 1.35rem; color: #1b3821; margin: 0 0 8px; }
        .empty-category-card p { font-size: 0.88rem; color: #64748b; margin: 0 0 20px; }
        .btn-view-all-cats {
          background: #16a34a;
          color: #ffffff;
          border: none;
          padding: 10px 22px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.2);
        }
        .btn-view-all-cats:hover { background: #15803d; }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        .card-wrapper { transition: transform 0.15s; }

        .card {
          display: block;
          background: #ffffff;
          border: 1.5px solid rgba(26, 26, 21, 0.1);
          border-radius: 16px;
          padding: 20px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
          box-shadow: 0 4px 14px rgba(22, 36, 26, 0.05);
          position: relative;
          text-decoration: none;
        }
        .card:hover {
          transform: translateY(-4px);
          border-color: #16a34a;
          box-shadow: 0 12px 28px rgba(22, 163, 74, 0.12);
        }

        .card-top {
          margin: -20px -20px 14px;
          height: 140px;
          border-radius: 14px 14px 0 0;
          overflow: hidden;
          background: linear-gradient(160deg, #f7f2e6, #ede4cd);
        }
        .badge {
          display: inline-block;
          font-size: 0.72rem;
          background: rgba(76, 122, 61, 0.12);
          color: #15803d;
          padding: 3px 10px;
          border-radius: 999px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        h4 { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: #1b3821; margin: 0 0 4px; }
        .farmer { font-size: 0.82rem; color: #6b6555; margin: 0 0 12px; }
        .price-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .price { font-family: var(--font-mono); font-weight: 700; color: #b91c1c; font-size: 1.05rem; margin: 0; }
        .price-badge { font-size: 0.68rem; color: #16a34a; background: #dcfce7; padding: 2px 7px; border-radius: 4px; font-weight: 600; white-space: nowrap; display: inline-block; margin-top: 2px; }

        .btn-quick-add {
          background: #16a34a;
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-quick-add:hover { background: #15803d; }

        /* Add to Cart Toast */
        .add-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1050;
          background: #1b3821;
          color: #ffffff;
          padding: 14px 20px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          gap: 14px;
          animation: slideUpToast 0.25s ease-out;
          max-width: 340px;
        }
        @keyframes slideUpToast {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .toast-icon { font-size: 1.4rem; }
        .toast-text { display: flex; flex-direction: column; flex: 1; }
        .toast-text strong { font-size: 0.9rem; color: #4ade80; }
        .toast-text span { font-size: 0.78rem; color: #cbd5e1; }
        .btn-toast-cart { background: #22c55e; color: #052e16; font-size: 0.78rem; font-weight: 800; padding: 6px 12px; border-radius: 6px; text-decoration: none; white-space: nowrap; }
        .btn-toast-cart:hover { background: #16a34a; color: #ffffff; }

        @media (max-width: 600px) {
          .add-toast { bottom: 16px; right: 16px; left: 16px; max-width: none; }
        }
      `}</style>
    </>
  );
}
