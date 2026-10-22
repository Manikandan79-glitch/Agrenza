import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Agrenza",
  description:
    "Read Agrenza's Terms of Service. Understand your rights and responsibilities when using our farm-to-doorstep marketplace platform in India.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <Nav />

      <div className="doc-hero">
        <div className="container">
          <h1>Terms of Service</h1>
          <p className="effective">Effective Date: September 2026</p>
          <p className="intro">
            Please read these Terms of Service carefully before using the Agrenza platform.
            By accessing or using our services, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      <div className="doc-body container">

        <section className="doc-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By creating an account or using Agrenza's website or services, you agree to these Terms of Service
            and our Privacy Policy. If you do not agree with any part of these terms, you must not use the platform.
          </p>
        </section>

        <section className="doc-section">
          <h2>2. Eligibility</h2>
          <p>
            You must be at least <strong>18 years of age</strong> to use Agrenza. By using the platform, you represent
            and warrant that you are 18 or older and have the legal capacity to enter into a binding agreement.
          </p>
        </section>

        <section className="doc-section">
          <h2>3. Use of Platform</h2>
          <ul>
            <li>You must provide accurate, complete, and current information when registering.</li>
            <li>You are responsible for maintaining the confidentiality of your account and password.</li>
            <li>You agree not to misuse the platform for fraudulent, illegal, or harmful purposes.</li>
            <li>You must not scrape, copy, or reproduce platform content without written permission.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>4. Farmer Responsibilities</h2>
          <p>If you register as a farmer on Agrenza, you agree to:</p>
          <ul>
            <li>Provide accurate product listings with honest descriptions, weights, and prices.</li>
            <li>Ensure all listed products are fresh, safe for consumption, and comply with FSSAI standards.</li>
            <li>Fulfil orders on time and communicate delays promptly.</li>
            <li>Not list products that are banned, hazardous, or otherwise prohibited by Indian law.</li>
            <li>Accept that Agrenza may remove listings that violate quality standards.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>5. Buyer Responsibilities</h2>
          <p>If you register as a buyer on Agrenza, you agree to:</p>
          <ul>
            <li>Provide an accurate delivery address at the time of checkout.</li>
            <li>Make payment in full at the time of placing an order.</li>
            <li>Not abuse the returns or refund process.</li>
            <li>Treat farmers and Agrenza support staff with respect.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>6. Orders &amp; Cancellations</h2>
          <ul>
            <li>Orders can be cancelled within <strong>2 hours</strong> of placement for a full refund.</li>
            <li>After 2 hours, cancellation is at the discretion of the farmer.</li>
            <li>If you receive a damaged or incorrect product, contact us within <strong>24 hours</strong> of delivery.</li>
            <li>Refunds are processed within 5–7 business days to the original payment method.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>7. Pricing &amp; GST</h2>
          <p>
            All prices displayed on Agrenza are <strong>GST-inclusive</strong>. The price you see is the final price you pay.
            Farmers set their own prices. Agrenza does not guarantee any specific price for any product.
            Prices may change without notice based on market conditions.
          </p>
        </section>

        <section className="doc-section">
          <h2>8. Intellectual Property</h2>
          <p>
            All content on the Agrenza platform — including the logo, design, software, text, and images — is the property
            of Agrenza Technologies Pvt Ltd and is protected by Indian copyright law. You may not reproduce, distribute,
            or create derivative works without written permission.
          </p>
        </section>

        <section className="doc-section">
          <h2>9. Limitation of Liability</h2>
          <p>
            Agrenza acts as a marketplace connecting farmers and buyers. We are not responsible for:
          </p>
          <ul>
            <li>Product quality beyond what is described in the listing.</li>
            <li>Delays caused by delivery partners.</li>
            <li>Any indirect, incidental, or consequential loss arising from use of the platform.</li>
          </ul>
          <p>Our maximum liability shall not exceed the value of the order in question.</p>
        </section>

        <section className="doc-section">
          <h2>10. Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of <strong>India</strong>.
            Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction
            of the courts of <strong>Chennai, Tamil Nadu, India</strong>.
          </p>
        </section>

        <section className="doc-section">
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms of Service at any time. When changes are made, we will update
            the effective date at the top of this page. Continued use of the platform after changes constitutes acceptance
            of the new terms.
          </p>
        </section>

        <section className="doc-section">
          <h2>12. Contact Us</h2>
          <p>For legal inquiries or questions about these terms, contact:</p>
          <div className="contact-block">
            <p><strong>Agrenza Technologies Pvt Ltd</strong></p>
            <p>Email: <a href="mailto:legal@agrenza.com">legal@agrenza.com</a></p>
            <p>Phone: 1800-000-000 (Toll Free)</p>
            <p>Address: Chennai, Tamil Nadu, India</p>
          </div>
        </section>

      </div>

      <Footer />

      <style>{`
        .doc-hero {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 60px 0 40px;
        }
        .doc-hero h1 {
          font-family: var(--font-display, serif);
          font-size: 2.4rem;
          font-weight: 900;
          color: #16241a;
          margin: 0 0 8px;
        }
        .effective {
          font-size: 0.85rem;
          color: #2e7d32;
          font-weight: 600;
          margin: 0 0 16px;
        }
        .intro {
          font-size: 1rem;
          color: #4a5548;
          line-height: 1.65;
          max-width: 680px;
          margin: 0;
        }
        .doc-body {
          padding: 56px 0 80px;
          max-width: 800px;
        }
        .doc-section {
          margin-bottom: 40px;
          padding-bottom: 36px;
          border-bottom: 1px solid #f1f5f9;
        }
        .doc-section:last-child { border-bottom: none; }
        .doc-section h2 {
          font-family: var(--font-display, serif);
          font-size: 1.2rem;
          font-weight: 800;
          color: #2e7d32;
          margin: 0 0 14px;
        }
        .doc-section p, .doc-section li {
          font-size: 0.93rem;
          color: #334155;
          line-height: 1.7;
        }
        .doc-section ul {
          padding-left: 20px;
          margin: 8px 0 0;
        }
        .doc-section li { margin-bottom: 6px; }
        .doc-section a { color: #2e7d32; font-weight: 600; }
        .contact-block {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 20px 24px;
          margin-top: 12px;
        }
        .contact-block p { margin: 4px 0; font-size: 0.92rem; color: #334155; }
        .contact-block strong { color: #16241a; }
      `}</style>
    </>
  );
}
