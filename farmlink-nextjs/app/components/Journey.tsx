"use client";

const STEPS = [
  {
    n: "01",
    title: "Picked at the farm",
    body: "Produce is listed the same morning it's harvested — no cold storage, no distributor markup, no guessing how old it is.",
  },
  {
    n: "02",
    title: "Farmer verified",
    body: "Every seller is Aadhaar-checked and approved by our team before their first listing goes live.",
  },
  {
    n: "03",
    title: "Straight to you",
    body: "Order in kilos or in bulk — the price you see is the price the farmer set, split with no middlemen in between.",
  },
];

export default function Journey() {
  return (
    <section className="journey container">
      <p className="eyebrow">How it moves</p>
      <h2 className="journey-title">Field to doorstep, in three honest steps</h2>

      <div className="rows">
        {STEPS.map((s) => (
          <div className="row" key={s.n}>
            <span className="row-n">{s.n}</span>
            <div className="row-body">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .journey { padding: 96px 24px 40px; }
        .eyebrow {
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.78rem;
          color: var(--rust);
          margin: 0 0 10px;
        }
        .journey-title {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: clamp(1.8rem, 3.4vw, 2.6rem);
          max-width: 640px;
          margin: 0 0 52px;
          line-height: 1.15;
        }
        .rows { display: flex; flex-direction: column; }
        .row {
          display: grid;
          grid-template-columns: 90px 1fr;
          gap: 28px;
          padding: 30px 0;
          border-top: 1px solid rgba(26, 26, 21, 0.12);
          align-items: baseline;
        }
        .row:last-child { border-bottom: 1px solid rgba(26, 26, 21, 0.12); }
        .row-n {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 2.2rem;
          color: var(--paper-dim);
          -webkit-text-stroke: 1px var(--rust);
        }
        .row-body h3 {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.25rem;
          margin: 0 0 8px;
        }
        .row-body p {
          margin: 0;
          max-width: 560px;
          color: #4a4a3f;
          line-height: 1.55;
        }
        @media (max-width: 560px) {
          .row { grid-template-columns: 50px 1fr; gap: 16px; }
          .row-n { font-size: 1.5rem; }
        }
      `}</style>
    </section>
  );
}
