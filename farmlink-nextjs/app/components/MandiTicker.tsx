"use client";

const PRICES = [
  ["Tomato", "₹28/kg"], ["Spinach", "₹18/kg"], ["Carrot", "₹32/kg"],
  ["Green Chili", "₹45/kg"], ["Onion", "₹24/kg"], ["Potato", "₹20/kg"],
  ["Brinjal", "₹26/kg"], ["Okra", "₹34/kg"],
];

export default function MandiTicker() {
  const row = [...PRICES, ...PRICES];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {row.map(([name, price], i) => (
          <span className="ticker-item" key={i}>
            <em>{name}</em> {price}
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker {
          background: var(--soil-deep);
          border-top: 1px solid rgba(232, 163, 61, 0.15);
          border-bottom: 1px solid rgba(232, 163, 61, 0.15);
          overflow: hidden;
          padding: 11px 0;
        }
        .ticker-track {
          display: flex;
          gap: 40px;
          white-space: nowrap;
          width: max-content;
          animation: scroll 34s linear infinite;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--turmeric);
        }
        .ticker-item em { color: #efe8d8; font-style: normal; margin-right: 8px; opacity: 0.7; }
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
