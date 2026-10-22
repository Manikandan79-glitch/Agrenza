"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import { getMe, logoutUser, listMyOrders, BuyerOrder, AuthUser } from "@/app/lib/api";

const OFFERS = [
  {
    code: "FRESHFARM10",
    title: "10% Harvest Season Discount",
    desc: "Get 10% instant discount on all fresh vegetables and fruits directly from verified local farms.",
    minOrder: "₹299",
    tag: "POPULAR",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    code: "ORGANIC20",
    title: "20% OFF Organic Greens & Herbs",
    desc: "Special discount on all certified chemical-free leafy vegetables, spinach, coriander, and mint.",
    minOrder: "₹199",
    tag: "VEGGIE SPECIAL",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    code: "FREESHIP",
    title: "100% Free Doorstep Delivery",
    desc: "Enjoy zero delivery fee on all direct farm produce orders delivered fresh within 24-48 hours.",
    minOrder: "₹499",
    tag: "ZERO SHIPPING",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    code: "FIRSTHARVEST",
    title: "Flat ₹50 Welcome Discount",
    desc: "Exclusive welcome gift for your first harvest order on the FarmLink marketplace.",
    minOrder: "₹250",
    tag: "NEW BUYER",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  {
    code: "BULKSAVER15",
    title: "15% Direct Wholesale Discount",
    desc: "Save 15% when purchasing 5kg or more for restaurants, hotels, hostels, or large families.",
    minOrder: "5 kg",
    tag: "BULK ORDER",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
];

export default function BuyerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (me?.user && me.user.role === "buyer") {
          setUser(me.user);
          const ordersRes = await listMyOrders().catch(() => ({ orders: [] }));
          setOrders(ordersRes.orders || []);
        } else if (me?.user && me.user.role !== "buyer") {
          if (me.user.role === "farmer") router.push("/farmer/dashboard");
          else if (me.user.role === "admin") router.push("/admin/dashboard");
        } else {
          router.push("/auth/login?redirect=/buyer/dashboard");
        }
      } catch {
        router.push("/auth/login?redirect=/buyer/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    router.push("/auth/login");
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2200);
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>⏳ Loading your Buyer Dashboard…</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  const activeOrdersCount = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const estimatedSavings = totalSpent * 0.25;

  return (
    <>
      <Nav />
      <div className="dashboard-bg">
        <div className="container dashboard-container">
          
          {/* TOP PROFILE HEADER CARD */}
          <div className="profile-banner-card">
            <div className="profile-left">
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="profile-details">
                <div className="profile-name-row">
                  <h1>{user.name}</h1>
                  <span className="badge-role">🌾 Verified Buyer</span>
                </div>
                <div className="profile-meta-grid">
                  <div className="meta-item">
                    <span className="meta-icon">📧</span>
                    <span className="meta-val">{user.email || "Email Account"}</span>
                    <span className="badge-verified">✓ Verified</span>
                  </div>
                  {user.mobile && (
                    <div className="meta-item">
                      <span className="meta-icon">📱</span>
                      <span className="meta-val">{user.mobile}</span>
                    </div>
                  )}
                  {user.created_at && (
                    <div className="meta-item">
                      <span className="meta-icon">🗓️</span>
                      <span className="meta-val">
                        Member since {new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-right-actions">
              <Link href="/shop" className="btn-action-primary">
                🌾 Browse Fresh Shop
              </Link>
              <button type="button" onClick={handleLogout} className="btn-action-logout">
                🚪 Log Out
              </button>
            </div>
          </div>

          {/* QUICK STATS ROW */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <span className="stat-label">Total Orders</span>
                <strong className="stat-number">{orders.length}</strong>
              </div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-icon">🚚</div>
              <div className="stat-info">
                <span className="stat-label">In-Transit / Active</span>
                <strong className="stat-number">{activeOrdersCount}</strong>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-label">Direct Farm Savings</span>
                <strong className="stat-number">₹{estimatedSavings.toFixed(0)}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-info">
                <span className="stat-label">Active Coupons</span>
                <strong className="stat-number">{OFFERS.length} Offers</strong>
              </div>
            </div>
          </div>

          {/* BUYER DISCOUNTS & SPECIAL OFFERS SECTION */}
          <section className="dashboard-section" id="offers">
            <div className="section-head">
              <div>
                <h2>🎁 Buyer Discounts &amp; Exclusive Farm Offers</h2>
                <p className="section-subhead">
                  Use these promotional coupon codes during checkout to unlock instant discounts and free delivery directly from local farms.
                </p>
              </div>
              <Link href="/shop" className="btn-shop-deals">
                Shop Deals Now →
              </Link>
            </div>

            <div className="offers-grid">
              {OFFERS.map((offer) => (
                <div
                  className="offer-card"
                  key={offer.code}
                  style={{ background: offer.bg, borderColor: offer.border }}
                >
                  <div className="offer-header">
                    <span className="offer-tag" style={{ background: offer.color }}>
                      {offer.tag}
                    </span>
                    <span className="min-order">Min Order: {offer.minOrder}</span>
                  </div>

                  <h3 className="offer-title">{offer.title}</h3>
                  <p className="offer-desc">{offer.desc}</p>

                  <div className="offer-bottom">
                    <div className="coupon-code-pill">
                      <span className="code-text">{offer.code}</span>
                      <button
                        type="button"
                        className="btn-copy-code"
                        onClick={() => handleCopy(offer.code)}
                        title="Click to copy coupon code"
                      >
                        {copiedCode === offer.code ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    </div>

                    <Link href="/shop" className="btn-use-coupon">
                      Apply in Shop →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT ORDERS & TRACKING SECTION */}
          <section className="dashboard-section">
            <div className="section-head">
              <div>
                <h2>📦 Recent Orders &amp; Live Shipment Tracking</h2>
                <p className="section-subhead">Track your packing and delivery journey from the farm to your table.</p>
              </div>
              <Link href="/buyer/orders" className="btn-outline-link">
                View All Orders ({orders.length}) →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="empty-orders-box">
                <span className="empty-icon">🌱</span>
                <h3>No Orders Placed Yet</h3>
                <p>Support your local farmers by purchasing fresh organic harvest today.</p>
                <Link href="/shop" className="btn-action-primary" style={{ display: "inline-block", marginTop: "12px" }}>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="recent-orders-list">
                {orders.slice(0, 3).map((order) => (
                  <div className="order-item-row" key={order.id}>
                    <div className="order-main-info">
                      <span className="order-badge-id">Order #{order.id}</span>
                      <span className="order-date-text">
                        {new Date(order.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="order-items-count">
                        &bull; {order.items?.length || 0} produce item(s)
                      </span>
                    </div>

                    <div className="order-status-and-action">
                      <strong className="order-amount-text">₹{order.total.toFixed(2)}</strong>
                      <span className={`status-pill status-${order.status}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <Link href="/buyer/orders" className="btn-track-order">
                        🚚 Track Shipment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* QUICK LINKS GRID */}
          <div className="quick-links-grid">
            <Link href="/shop" className="quick-link-card">
              <span className="quick-icon">🌾</span>
              <h4>Browse Farm Produce</h4>
              <p>Explore today’s freshest fruits and vegetables.</p>
            </Link>

            <Link href="/buyer/orders" className="quick-link-card">
              <span className="quick-icon">📦</span>
              <h4>Order History &amp; Tracking</h4>
              <p>Check dispatch, travel notes, and delivery updates.</p>
            </Link>

            <Link href="/buyer/bulk-request" className="quick-link-card">
              <span className="quick-icon">🧺</span>
              <h4>Bulk Wholesale Orders</h4>
              <p>Direct wholesale quotes for institutions &amp; events.</p>
            </Link>

            <Link href="/buyer/cart" className="quick-link-card">
              <span className="quick-icon">🛒</span>
              <h4>My Shopping Cart</h4>
              <p>Review selected produce items and checkout.</p>
            </Link>
          </div>

        </div>
      </div>
      <Footer />

      <style jsx>{`
        .dashboard-bg { background: #f8fafc; min-height: 85vh; padding: 32px 0 80px; }
        .dashboard-container { max-width: 1140px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px; }

        /* Profile Header Banner */
        .profile-banner-card {
          background: linear-gradient(135deg, #1b3821 0%, #0d2313 100%);
          color: #ffffff;
          border-radius: 16px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        @media (max-width: 860px) {
          .profile-banner-card { flex-direction: column; align-items: flex-start; }
        }

        .profile-left { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .avatar-circle {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #ffffff; font-size: 2rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: 3px solid rgba(255,255,255,0.2);
        }

        .profile-name-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
        .profile-name-row h1 { margin: 0; font-family: var(--font-display); font-size: 1.6rem; color: #ffffff; }
        .badge-role { background: #22c55e; color: #052e16; font-size: 0.76rem; font-weight: 800; padding: 3px 10px; border-radius: 999px; }

        .profile-meta-grid { display: flex; gap: 18px; flex-wrap: wrap; font-size: 0.88rem; color: #cbd5e1; }
        .meta-item { display: flex; align-items: center; gap: 6px; }
        .meta-icon { font-size: 1rem; }
        .meta-val { color: #f1f5f9; font-weight: 600; }
        .badge-verified { background: rgba(34, 197, 94, 0.2); color: #4ade80; font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(34, 197, 94, 0.4); }

        .profile-right-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .btn-action-primary { background: #16a34a; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: background 0.15s; }
        .btn-action-primary:hover { background: #15803d; }
        .btn-action-logout { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: #f87171; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.15s; }
        .btn-action-logout:hover { background: #ef4444; color: #ffffff; border-color: #ef4444; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }

        .stat-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
        .stat-card.highlight { border-color: #bae6fd; background: #f0f9ff; }
        .stat-card.green { border-color: #bbf7d0; background: #f0fdf4; }
        .stat-icon { width: 48px; height: 48px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
        .stat-card.highlight .stat-icon { background: #e0f2fe; }
        .stat-card.green .stat-icon { background: #dcfce7; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.78rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em; }
        .stat-number { font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-top: 2px; }

        /* Sections */
        .dashboard-section { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 12px; }
        .section-head h2 { font-family: var(--font-display); font-size: 1.35rem; color: #0f172a; margin: 0 0 4px; }
        .section-subhead { font-size: 0.86rem; color: #64748b; margin: 0; }
        .btn-shop-deals { color: #16a34a; font-weight: 700; font-size: 0.88rem; text-decoration: none; }
        .btn-outline-link { font-size: 0.86rem; font-weight: 700; color: #0284c7; text-decoration: none; }

        /* Offers Grid */
        .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
        .offer-card { border-radius: 12px; border: 1.5px solid; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
        .offer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .offer-tag { color: #ffffff; font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.04em; }
        .min-order { font-size: 0.76rem; color: #64748b; font-weight: 600; }
        .offer-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
        .offer-desc { font-size: 0.82rem; color: #475569; line-height: 1.45; margin: 0 0 16px; flex: 1; }

        .offer-bottom { display: flex; justify-content: space-between; align-items: center; gap: 10px; border-top: 1px dashed rgba(0,0,0,0.12); padding-top: 14px; flex-wrap: wrap; }
        .coupon-code-pill { display: inline-flex; align-items: center; background: #ffffff; border: 1.5px dashed #94a3b8; border-radius: 6px; padding: 4px 10px; gap: 8px; }
        .code-text { font-family: var(--font-mono); font-weight: 800; color: #0f172a; font-size: 0.88rem; letter-spacing: 0.05em; }
        .btn-copy-code { background: none; border: none; font-size: 0.76rem; font-weight: 700; color: #16a34a; cursor: pointer; padding: 2px 4px; }
        .btn-use-coupon { font-size: 0.8rem; font-weight: 700; color: #16a34a; text-decoration: none; }
        .btn-use-coupon:hover { text-decoration: underline; }

        /* Recent Orders */
        .empty-orders-box { text-align: center; padding: 36px 20px; color: #64748b; }
        .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 8px; }
        .recent-orders-list { display: flex; flex-direction: column; gap: 12px; }
        .order-item-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; flex-wrap: wrap; gap: 12px; }
        .order-main-info { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; }
        .order-badge-id { font-weight: 800; color: #0f172a; }
        .order-date-text { color: #64748b; font-size: 0.82rem; }
        .order-items-count { color: #64748b; font-size: 0.82rem; }
        
        .order-status-and-action { display: flex; align-items: center; gap: 14px; }
        .order-amount-text { font-size: 0.95rem; color: #0f172a; font-weight: 800; }
        .status-pill { font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; }
        .status-pending { background: #fef3c7; color: #b45309; }
        .status-packing { background: #e0e7ff; color: #4338ca; }
        .status-shipped { background: #e0f2fe; color: #0369a1; }
        .status-out_for_delivery { background: #fef3c7; color: #d97706; }
        .status-delivered { background: #dcfce7; color: #15803d; }
        .status-cancelled { background: #fee2e2; color: #b91c1c; }

        .btn-track-order { background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; padding: 5px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; text-decoration: none; }
        .btn-track-order:hover { background: #f1f5f9; }

        /* Quick Links */
        .quick-links-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 800px) {
          .quick-links-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .quick-links-grid { grid-template-columns: 1fr; }
        }

        .quick-link-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-decoration: none; color: inherit; transition: all 0.15s; }
        .quick-link-card:hover { transform: translateY(-2px); border-color: #16a34a; box-shadow: 0 4px 12px rgba(22,163,74,0.08); }
        .quick-icon { font-size: 1.8rem; display: block; margin-bottom: 8px; }
        .quick-link-card h4 { margin: 0 0 4px; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
        .quick-link-card p { margin: 0; font-size: 0.78rem; color: #64748b; line-height: 1.4; }
      `}</style>
    </>
  );
}
