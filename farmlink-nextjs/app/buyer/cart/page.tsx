"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import { Tomato, Carrot, LeafyGreen, Chili } from "@/app/components/ProduceIcons";
import { useCart } from "@/app/lib/cart-context";
import { getMe } from "@/app/lib/api";

const ICONS = { tomato: Tomato, carrot: Carrot, leafy: LeafyGreen, chili: Chili };

export default function CartPage() {
  const { items, removeItem, total } = useCart();
  const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (me?.user) setUser(me.user);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  return (
    <>
      <Nav />
      <div className="container cart-wrap">
        <h1>My cart</h1>

        {(!user || user.role !== "buyer") && items.length > 0 && (
          <div className="login-hint-banner">
            <span>🔒 <strong>Buyer Login Required:</strong> Only logged-in buyers can place orders. You can log in or register during checkout.</span>
            <Link href="/auth/login?redirect=/buyer/checkout" className="btn-hint-login">
              Log In Now
            </Link>
          </div>
        )}

        {items.length === 0 ? (
          <div className="empty-card">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="btn-solid">Browse products</Link>
          </div>
        ) : (
          <>
            <div className="table-card">
              {items.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <div className="row" key={item.productId}>
                    <div className="prod">
                      <div className="thumb"><Icon size={30} /></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="cell">₹{item.price}/kg</span>
                    <span className="cell">{item.qty} kg</span>
                    <span className="cell subtotal">₹{(item.price * item.qty).toFixed(2)}</span>
                    <button className="remove" onClick={() => removeItem(item.productId)} aria-label={`Remove ${item.name}`}>✕</button>
                  </div>
                );
              })}
            </div>

            <div className="summary-card">
              <h2>Total: ₹{total.toFixed(2)}</h2>
              <Link href="/buyer/checkout" className="btn-solid">
                {(!user || user.role !== "buyer") ? "Log In & Proceed to Checkout" : "Proceed to checkout"}
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />

      <style jsx>{`
        .cart-wrap { padding: 44px 24px 90px; }
        h1 { font-family: var(--font-display); font-weight: 700; font-size: 1.8rem; margin: 0 0 24px; }
        .login-hint-banner {
          background: #fffbeb;
          border: 1.5px solid #fde68a;
          color: #92400e;
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 0.88rem;
        }
        .btn-hint-login {
          background: #16a34a;
          color: #fff;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.82rem;
          text-decoration: none;
        }
        .btn-hint-login:hover { background: #15803d; }
        .empty-card, .table-card, .summary-card {
          background: #fff;
          border: 1px solid rgba(26,26,21,0.08);
          border-radius: 14px;
          padding: 28px;
        }
        .empty-card { text-align: center; }
        .empty-card p { color: #6b6555; margin: 0 0 18px; }
        .table-card { padding: 12px 20px; margin-bottom: 20px; }
        .row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 30px;
          align-items: center;
          gap: 10px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(26,26,21,0.06);
        }
        .row:last-child { border-bottom: none; }
        .prod { display: flex; align-items: center; gap: 10px; font-weight: 500; }
        .thumb {
          width: 44px; height: 44px; border-radius: 8px;
          background: linear-gradient(160deg,#f7f2e6,#ede4cd);
          display: flex; align-items: center; justify-content: center;
        }
        .cell { font-size: 0.9rem; color: #4a4a3f; }
        .subtotal { font-family: var(--font-mono); color: var(--rust); font-weight: 500; }
        .remove { border: none; background: none; color: var(--chili); font-size: 1rem; }
        .summary-card { display: flex; align-items: center; justify-content: space-between; }
        .summary-card h2 { font-family: var(--font-display); font-size: 1.3rem; margin: 0; }
        .btn-solid {
          background: var(--soil); color: var(--paper);
          padding: 12px 24px; border-radius: 999px; font-weight: 600; font-size: 0.9rem;
        }
        .btn-solid:hover { background: var(--leaf); }
        @media (max-width: 620px) {
          .row { grid-template-columns: 1.6fr 1fr 1fr 30px; }
          .row .cell:nth-child(2) { display: none; }
        }
      `}</style>
    </>
  );
}
