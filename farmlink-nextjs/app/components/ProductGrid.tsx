"use client";

import Link from "next/link";

interface CategoryItem {
  name: string;
  count: string;
  desc: string;
  image: string;
  emoji: string;
}

const CATEGORY_LIST: CategoryItem[] = [
  {
    name: "Vegetables",
    count: "40+ items",
    desc: "Tomatoes, Carrots, Onions, Potatoes & Gourds",
    emoji: "🥦",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Fruits",
    count: "25+ items",
    desc: "Mangoes, Apples, Bananas, Papayas & Citrus",
    emoji: "🍎",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Spices & Herbs",
    count: "20+ items",
    desc: "Turmeric, Green & Dry Chilies, Cardamom, Pepper",
    emoji: "🌶️",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Leafy Greens",
    count: "15+ items",
    desc: "Fresh Spinach, Amaranth, Coriander, Mint & Fenugreek",
    emoji: "🥬",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Tubers & Roots",
    count: "12+ items",
    desc: "Sweet Potatoes, Ginger, Beetroot, Radish & Yams",
    emoji: "🥔",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Grains & Pulses",
    count: "18+ items",
    desc: "Traditional Rice, Millets, Toor Dal, Lentils & Wheat",
    emoji: "🌾",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  },
];

export default function ProductGrid() {
  return (
    <section className="grid-section container">
      <div className="grid-head">
        <div className="head-text">
          <h2>Product Categories</h2>
          <p className="sub-description">
            Directly sourced from trusted local farmers across India at fair mandi prices.
          </p>
        </div>
        <Link href="/shop" className="view-all-link">
          Browse All Products →
        </Link>
      </div>

      {/* Category Cards Grid */}
      <div className="category-grid">
        {CATEGORY_LIST.map((cat) => (
          <Link
            href={`/shop?category=${encodeURIComponent(cat.name)}`}
            key={cat.name}
            className="cat-card"
          >
            <div className="cat-img-wrapper">
              <img src={cat.image} alt={cat.name} className="cat-img" loading="lazy" />
              <div className="cat-overlay"></div>
              <span className="cat-badge">{cat.count}</span>
            </div>
            <div className="cat-content">
              <div className="cat-title-row">
                <span className="cat-emoji">{cat.emoji}</span>
                <h3>{cat.name}</h3>
              </div>
              <p className="cat-desc">{cat.desc}</p>
              <span className="cat-action">Shop Now →</span>
            </div>
          </Link>
        ))}
      </div>


      <style jsx>{`
        .grid-section {
          padding: 24px 24px 100px;
        }
        .grid-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 36px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .eyebrow {
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.8rem;
          color: #2e7d32;
          font-weight: 600;
          margin: 0 0 8px;
        }
        h2 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          margin: 0 0 8px;
          color: #1a1a15;
        }
        .sub-description {
          margin: 0;
          color: #6b6555;
          font-size: 0.95rem;
          max-width: 520px;
        }
        .view-all-link {
          font-weight: 600;
          font-size: 0.92rem;
          color: #2e7d32;
          text-decoration: none;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(46, 125, 50, 0.08);
          border: 1px solid rgba(46, 125, 50, 0.2);
          transition: all 0.2s ease;
        }
        .view-all-link:hover {
          background: #2e7d32;
          color: #fff;
        }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .cat-card {
          background: #ffffff;
          border: 1px solid rgba(26, 26, 21, 0.1);
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          box-shadow: 0 6px 18px rgba(22, 36, 26, 0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .cat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(46, 125, 50, 0.14);
          border-color: rgba(46, 125, 50, 0.35);
        }
        .cat-img-wrapper {
          position: relative;
          height: 180px;
          width: 100%;
          overflow: hidden;
          background: #f0eee6;
        }
        .cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .cat-card:hover .cat-img {
          transform: scale(1.06);
        }
        .cat-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%);
        }
        .cat-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          color: #2e7d32;
          font-weight: 600;
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 999px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }
        .cat-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .cat-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .cat-emoji {
          font-size: 1.4rem;
          line-height: 1;
        }
        h3 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.22rem;
          margin: 0;
          color: #1a1a15;
        }
        .cat-desc {
          font-size: 0.85rem;
          color: #6b6555;
          line-height: 1.45;
          margin: 0 0 16px;
          flex: 1;
        }
        .cat-action {
          font-size: 0.85rem;
          font-weight: 700;
          color: #2e7d32;
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .cat-card:hover .cat-action {
          color: #1b5e20;
          text-decoration: underline;
        }
        @media (max-width: 640px) {
          .grid-head {
            flex-direction: column;
            align-items: flex-start;
          }
          .category-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

