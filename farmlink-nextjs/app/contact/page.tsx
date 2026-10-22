"use client";

import { useState } from "react";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  }

  return (
    <>
      <Nav />

      <section className="contact-hero">
        <div className="container">
          <p className="eyebrow">We're here to help</p>
          <h1>Get in Touch</h1>
          <p className="lead">Questions about your order, farmer support, or partnerships? Our team responds within 24 hours.</p>
        </div>
      </section>

      <section className="contact-body container">
        {/* Contact Cards */}
        <div className="contact-cards">
          <div className="c-card">
            <span className="c-icon">📧</span>
            <h3>Email Us</h3>
            <p>For order issues, refunds and general queries</p>
            <a href="mailto:support@agrenza.com">support@agrenza.com</a>
          </div>
          <div className="c-card">
            <span className="c-icon">📞</span>
            <h3>Call Us</h3>
            <p>Toll-free Mon–Sat, 9 AM to 6 PM IST</p>
            <a href="tel:18000000000">1800-000-247-3692</a>
          </div>
          <div className="c-card">
            <span className="c-icon">🏢</span>
            <h3>India Office</h3>
            <p>Agrenza Technologies Pvt Ltd</p>
            <span className="addr">Chennai, Tamil Nadu, India</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="form-wrap">
          <h2>Send a Message</h2>

          {sent ? (
            <div className="success-box">
              <span>✅</span>
              <div>
                <strong>Message sent successfully!</strong>
                <p>We'll get back to you within 24 hours on {form.email}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                  <option>General Inquiry</option>
                  <option>Order Issue</option>
                  <option>Farmer Support</option>
                  <option>Partnership</option>
                  <option>Report a Problem</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={sending}>
                {sending ? "Sending..." : "Send Message →"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .contact-hero {
          background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
          padding: 70px 0 50px;
          border-bottom: 1px solid rgba(46,125,50,0.1);
        }
        .eyebrow {
          font-family: var(--font-mono, monospace);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.8rem;
          color: #2e7d32;
          font-weight: 600;
          margin: 0 0 14px;
        }
        .contact-hero h1 {
          font-family: var(--font-display, serif);
          font-weight: 900;
          font-size: clamp(2rem, 5vw, 3.2rem);
          color: #16241a;
          margin: 0 0 16px;
        }
        .lead { font-size: 1.05rem; color: #4a5548; max-width: 520px; line-height: 1.6; margin: 0; }
        .contact-body {
          padding: 56px 0 80px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .contact-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .c-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 28px 24px;
          text-align: center;
          transition: box-shadow 0.2s;
        }
        .c-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        .c-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
        .c-card h3 { font-size: 1rem; font-weight: 700; color: #16241a; margin: 0 0 6px; }
        .c-card p { font-size: 0.83rem; color: #64748b; margin: 0 0 10px; }
        .c-card a { color: #2e7d32; font-weight: 600; text-decoration: none; font-size: 0.9rem; }
        .c-card a:hover { text-decoration: underline; }
        .addr { color: #2e7d32; font-weight: 600; font-size: 0.9rem; }
        .form-wrap {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px 48px;
          max-width: 720px;
          width: 100%;
          align-self: center;
        }
        .form-wrap h2 {
          font-family: var(--font-display, serif);
          font-size: 1.5rem;
          font-weight: 800;
          color: #16241a;
          margin: 0 0 28px;
        }
        .contact-form { display: flex; flex-direction: column; gap: 18px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.92rem;
          color: #111827;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
          resize: vertical;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,0.1); }
        .submit-btn {
          background: #2e7d32;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 13px 28px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          align-self: flex-start;
        }
        .submit-btn:hover:not(:disabled) { background: #1b5e20; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .success-box {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 10px;
          padding: 20px 24px;
        }
        .success-box span { font-size: 1.5rem; }
        .success-box strong { font-size: 1rem; color: #166534; display: block; margin-bottom: 4px; }
        .success-box p { font-size: 0.85rem; color: #4a5548; margin: 0; }
        @media (max-width: 768px) {
          .contact-cards { grid-template-columns: 1fr; }
          .form-wrap { padding: 28px 20px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
