import type { Metadata } from "next";
import Nav from "./components/Nav";
import CrateHero from "./components/CrateHero";
import MandiTicker from "./components/MandiTicker";
import Journey from "./components/Journey";

import ProductGrid from "./components/ProductGrid";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Agrenza — Farm to Doorstep | Buy Fresh Farm Produce Online",
  description:
    "Buy fresh vegetables, fruits and farm produce directly from verified Indian farmers. No middlemen, fair prices, GST inclusive. Farm to doorstep delivery across India.",
  openGraph: {
    title: "Agrenza — Farm to Doorstep",
    description:
      "Buy fresh vegetables, fruits and farm produce directly from verified Indian farmers. No middlemen, fair prices, fast delivery.",
    url: "https://agrenza.com",
    type: "website",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Agrenza",
  url: "https://agrenza.com",
  logo: "https://agrenza.com/agrenza-logo-small.jpg",
  description:
    "Direct farm-to-doorstep fresh produce marketplace connecting Indian farmers with buyers",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@agrenza.com",
    telephone: "+91-1800-000-000",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    "https://www.facebook.com/agrenza",
    "https://www.instagram.com/agrenza",
    "https://twitter.com/agrenza",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <Nav />
      <MandiTicker />

      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Fresh harvest, listed daily</p>
            <h1>
              Farm to<br />
              <em>doorstep</em>.
            </h1>
            <p className="lead">
              Agrenza connects farmers directly with buyers — fresh produce,
              fair prices, and nobody standing in between.
            </p>
            <div className="hero-ctas">
              <a href="/shop" className="btn-primary">Shop now</a>
              <a href="/auth/farmer-register" className="btn-outline">Become a farmer partner</a>
            </div>
          </div>
          <div className="hero-scene">
            <CrateHero />
          </div>
        </div>
      </section>

      <Journey />
      <ProductGrid />
      <Footer />

      <style>{`
        .hero {
          background: linear-gradient(180deg, #ffffff 0%, #f7faf7 100%);
          color: #16241a;
          padding: 64px 0 40px;
          border-bottom: 1px solid rgba(46, 125, 50, 0.12);
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 24px;
          min-height: 480px;
        }
        .eyebrow {
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.8rem;
          color: #2e7d32;
          font-weight: 600;
          margin: 0 0 18px;
        }
        h1 {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: clamp(3rem, 7vw, 5.2rem);
          line-height: 0.98;
          color: #16241a;
          margin: 0 0 22px;
        }
        h1 em { color: #2e7d32; font-style: italic; font-weight: 600; }
        .lead {
          font-size: 1.08rem;
          line-height: 1.6;
          color: #4a5548;
          max-width: 460px;
          margin: 0 0 34px;
        }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-primary {
          background: #2e7d32;
          color: #ffffff !important;
          font-weight: 600;
          padding: 14px 28px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(46, 125, 50, 0.28);
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: #256628;
          box-shadow: 0 6px 18px rgba(46, 125, 50, 0.38);
        }
        .btn-outline {
          border: 1.5px solid #16241a;
          color: #16241a !important;
          font-weight: 600;
          padding: 14px 28px;
          border-radius: 999px;
          transition: all 0.2s ease;
        }
        .btn-outline:hover {
          background: #16241a;
          color: #ffffff !important;
        }
        @media (max-width: 860px) {
          .hero-inner { grid-template-columns: 1fr; text-align: center; }
          .lead { margin-left: auto; margin-right: auto; }
          .hero-ctas { justify-content: center; }
          .hero-scene { min-height: 260px; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Agrenza',
            url: 'https://agrenza.com',
            logo: 'https://agrenza.com/agrenza-logo-small.jpg',
            description: 'Direct farm-to-doorstep fresh produce marketplace connecting Indian farmers with buyers',
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: 'support@agrenza.com',
            },
            sameAs: [
              'https://www.facebook.com/agrenza',
              'https://www.instagram.com/agrenza',
            ],
          }),
        }}
      />
    </>
  );
}
