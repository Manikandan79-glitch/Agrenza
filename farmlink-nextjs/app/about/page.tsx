import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "About Agrenza — Farm to Doorstep Marketplace",
  description:
    "Learn about Agrenza, India's direct farm-to-doorstep marketplace. We connect verified Indian farmers with buyers for fresh produce, fair prices and zero middlemen.",
};

export default function AboutPage() {
  return (
    <>
      <Nav />

      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <p className="eyebrow">Our Story</p>
          <h1>Farm Fresh.<br /><em>No Middlemen.</em></h1>
          <p className="lead">
            Agrenza was built on one belief — the farmer who grows your food deserves a fair price,
            and the family that eats it deserves to know exactly where it came from.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mission container">
        <div className="mission-card">
          <span className="mission-icon">🌱</span>
          <h2>Our Mission</h2>
          <p>
            Connecting Indian farmers directly with buyers — fresh produce, fair prices,
            no middlemen, no compromise on quality.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="values container">
        <h2 className="section-title">Why Agrenza?</h2>
        <div className="values-grid">
          <div className="value-card">
            <span className="value-icon">🥦</span>
            <h3>Fresh &amp; Traceable</h3>
            <p>Every product is sourced directly from the farm. You know who grew it, where it came from, and when it was harvested.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">🤝</span>
            <h3>Fair for Farmers</h3>
            <p>Farmers list their own prices. No exploitative middlemen. They earn more, you pay less — everyone wins.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">🏷️</span>
            <h3>Transparent Pricing</h3>
            <p>All prices are GST-inclusive. No hidden charges. The price you see is the price you pay.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">✅</span>
            <h3>Verified Farmers</h3>
            <p>Every farmer on Agrenza is verified by our team. Quality is our promise — or your money back.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How Agrenza Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">01</div>
              <h3>Farmer Lists Produce</h3>
              <p>Verified farmers list their fresh harvest daily with real prices and quantities.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">02</div>
              <h3>Buyer Shops Online</h3>
              <p>You browse 100+ fresh products, filter by category, and add to cart in seconds.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">03</div>
              <h3>Delivered Fresh</h3>
              <p>Your order is packed and shipped directly from the farm. Fresh. Fast. Traceable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats container">
        <h2 className="section-title">Agrenza by the Numbers</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-num">500+</span>
            <span className="stat-label">Verified Farmers</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">10,000+</span>
            <span className="stat-label">Happy Buyers</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">50+</span>
            <span className="stat-label">Cities Served</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">100%</span>
            <span className="stat-label">Fresh Guarantee</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta container">
        <h2>Ready to eat fresh?</h2>
        <p>Join thousands of families buying directly from farmers across India.</p>
        <div className="cta-btns">
          <a href="/shop" className="btn-primary">Shop Now</a>
          <a href="/auth/farmer-register" className="btn-outline">Join as Farmer</a>
        </div>
      </section>

      <Footer />

      <style>{`
        .about-hero {
          background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
          padding: 80px 0 60px;
          border-bottom: 1px solid rgba(46,125,50,0.1);
        }
        .about-hero .eyebrow {
          font-family: var(--font-mono, monospace);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.8rem;
          color: #2e7d32;
          font-weight: 600;
          margin: 0 0 16px;
        }
        .about-hero h1 {
          font-family: var(--font-display, serif);
          font-weight: 900;
          font-size: clamp(2.4rem, 6vw, 4rem);
          line-height: 1;
          color: #16241a;
          margin: 0 0 20px;
        }
        .about-hero h1 em { color: #2e7d32; font-style: italic; }
        .about-hero .lead {
          font-size: 1.1rem;
          line-height: 1.65;
          color: #4a5548;
          max-width: 580px;
        }
        .mission {
          padding: 60px 0 0;
          display: flex;
          justify-content: center;
        }
        .mission-card {
          text-align: center;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 16px;
          padding: 40px 48px;
          max-width: 600px;
          width: 100%;
        }
        .mission-icon { font-size: 2.5rem; display: block; margin-bottom: 16px; }
        .mission-card h2 {
          font-family: var(--font-display, serif);
          font-size: 1.6rem;
          font-weight: 900;
          color: #166534;
          margin: 0 0 12px;
        }
        .mission-card p { color: #4a5548; font-size: 1.05rem; line-height: 1.6; margin: 0; }
        .values { padding: 60px 0; }
        .how-it-works { background: #f8fafc; padding: 60px 0; }
        .stats { padding: 60px 0; }
        .about-cta {
          padding: 60px 0 80px;
          text-align: center;
        }
        .section-title {
          font-family: var(--font-display, serif);
          font-size: 1.8rem;
          font-weight: 900;
          color: #16241a;
          text-align: center;
          margin: 0 0 40px;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .value-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 28px 22px;
          text-align: center;
          transition: box-shadow 0.2s;
        }
        .value-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .value-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
        .value-card h3 { font-size: 1rem; font-weight: 700; color: #16241a; margin: 0 0 8px; }
        .value-card p { font-size: 0.875rem; color: #64748b; line-height: 1.6; margin: 0; }
        .steps-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .step {
          background: #ffffff;
          border-radius: 12px;
          padding: 28px 24px;
          text-align: center;
          max-width: 220px;
          border: 1px solid #e2e8f0;
        }
        .step-num {
          font-family: var(--font-mono, monospace);
          font-size: 2rem;
          font-weight: 800;
          color: #2e7d32;
          opacity: 0.4;
          margin-bottom: 10px;
        }
        .step h3 { font-size: 1rem; font-weight: 700; color: #16241a; margin: 0 0 8px; }
        .step p { font-size: 0.83rem; color: #64748b; line-height: 1.5; margin: 0; }
        .step-arrow { font-size: 1.5rem; color: #2e7d32; opacity: 0.5; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .stat-card {
          background: linear-gradient(135deg, #166534, #2e7d32);
          border-radius: 12px;
          padding: 32px 20px;
          text-align: center;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .stat-num { font-size: 2.2rem; font-weight: 900; font-family: var(--font-display, serif); }
        .stat-label { font-size: 0.83rem; opacity: 0.85; font-weight: 500; }
        .about-cta h2 {
          font-family: var(--font-display, serif);
          font-size: 2rem;
          font-weight: 900;
          color: #16241a;
          margin: 0 0 12px;
        }
        .about-cta p { font-size: 1.05rem; color: #4a5548; margin: 0 0 28px; }
        .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          background: #2e7d32;
          color: #ffffff;
          font-weight: 600;
          padding: 13px 28px;
          border-radius: 999px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #1b5e20; }
        .btn-outline {
          border: 1.5px solid #16241a;
          color: #16241a;
          font-weight: 600;
          padding: 13px 28px;
          border-radius: 999px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-outline:hover { background: #16241a; color: #ffffff; }
        @media (max-width: 860px) {
          .values-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .step-arrow { display: none; }
        }
        @media (max-width: 480px) {
          .values-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
