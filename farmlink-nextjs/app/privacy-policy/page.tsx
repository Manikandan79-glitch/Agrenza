import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Agrenza",
  description:
    "Read Agrenza's Privacy Policy. Learn how we collect, use, and protect your personal data when you use our farm-to-doorstep marketplace.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Nav />

      <div className="doc-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="effective">Effective Date: September 2026</p>
          <p className="intro">
            At Agrenza, your privacy is important to us. This Privacy Policy explains how we collect, use, share,
            and protect your personal information when you visit our website or use our services.
          </p>
        </div>
      </div>

      <div className="doc-body container">

        <section className="doc-section">
          <h2>1. Information We Collect</h2>
          <p>We collect the following types of information when you register or use Agrenza:</p>
          <ul>
            <li><strong>Registration Data:</strong> Name, email address, mobile number, and role (buyer or farmer).</li>
            <li><strong>Profile Information:</strong> Address, state, and delivery preferences.</li>
            <li><strong>Order Data:</strong> Products ordered, quantities, delivery address, and order history.</li>
            <li><strong>Usage Data:</strong> Pages visited, products browsed, device type, IP address, and browser information.</li>
            <li><strong>Payment Information:</strong> We do not store payment card details. Payments are processed securely by third-party payment gateways.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To process and fulfil your orders.</li>
            <li>To verify your identity and authenticate your account.</li>
            <li>To send order confirmations, shipping updates, and support communications.</li>
            <li>To improve our platform, products, and user experience.</li>
            <li>To send promotional offers and discounts (you can unsubscribe at any time).</li>
            <li>To comply with legal obligations and resolve disputes.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>3. Data Sharing</h2>
          <p>We <strong>never sell your personal data</strong> to third parties. We share data only in these limited circumstances:</p>
          <ul>
            <li><strong>Delivery Partners:</strong> Your name and address are shared with delivery partners to fulfil orders.</li>
            <li><strong>Payment Processors:</strong> Payment information is handled by PCI-compliant third-party gateways.</li>
            <li><strong>Legal Compliance:</strong> We may disclose information when required by Indian law or a court order.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>4. Cookies</h2>
          <p>Agrenza uses cookies for the following purposes:</p>
          <ul>
            <li><strong>Session Cookies:</strong> To keep you logged in during your visit.</li>
            <li><strong>Cart Cookies:</strong> To remember your cart items between sessions.</li>
            <li><strong>Preference Cookies:</strong> To remember your category filters and settings.</li>
            <li><strong>Analytics Cookies:</strong> To understand how users interact with our platform (Google Analytics).</li>
          </ul>
          <p>You can disable cookies in your browser settings, though some features may not function correctly.</p>
        </section>

        <section className="doc-section">
          <h2>5. Data Security</h2>
          <p>
            We take reasonable security measures to protect your information, including encrypted storage of passwords
            (using bcrypt hashing), HTTPS connections, and restricted database access. However, no internet transmission
            is 100% secure and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="doc-section">
          <h2>6. Your Rights</h2>
          <p>Under applicable Indian data protection law, you have the right to:</p>
          <ul>
            <li><strong>Access</strong> your personal data we hold.</li>
            <li><strong>Correct</strong> inaccurate or incomplete information.</li>
            <li><strong>Delete</strong> your account and associated data (subject to legal retention requirements).</li>
            <li><strong>Withdraw consent</strong> for marketing communications at any time.</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:privacy@agrenza.com">privacy@agrenza.com</a>.</p>
        </section>

        <section className="doc-section">
          <h2>7. Children's Privacy</h2>
          <p>
            Agrenza is not intended for children under the age of 13. We do not knowingly collect personal information from
            children. If you believe a child has provided us with their data, please contact us immediately.
          </p>
        </section>

        <section className="doc-section">
          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the effective date at the top
            of this page and notify registered users by email.
          </p>
        </section>

        <section className="doc-section">
          <h2>9. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact:</p>
          <div className="contact-block">
            <p><strong>Agrenza Technologies Pvt Ltd</strong></p>
            <p>Email: <a href="mailto:privacy@agrenza.com">privacy@agrenza.com</a></p>
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
