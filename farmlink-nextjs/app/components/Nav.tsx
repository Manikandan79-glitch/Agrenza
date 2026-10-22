"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/lib/cart-context";
import { getMe, logoutUser, AuthUser } from "@/app/lib/api";

export default function Nav() {
  const router = useRouter();
  const { count } = useCart();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();
      setUser(null);
      setMenuOpen(false);
      router.push("/auth/login");
    } catch {
      setUser(null);
      router.push("/auth/login");
    }
  }

  return (
    <>
      {/* TOP ANNOUNCEMENT BANNER FOR BUYER OFFERS */}
      <div className="top-offer-bar">
        <div className="container top-bar-inner">
          <span className="offer-pulse">🎉</span>
          <span className="offer-text">
            <strong>Harvest Season Offer:</strong> Get <strong>10% OFF</strong> with coupon <span className="highlight-code">FRESHFARM10</span> &bull; Free Delivery on orders over ₹499!
          </span>
          <Link href="/offers" className="top-offer-link">
            View All Offers &amp; Discounts →
          </Link>
        </div>
      </div>

      {/* 3. NAVIGATION BAR */}
      <header className="nav">
        <div className="container nav-inner">
          <Link href="/" className="nav-logo">
            <img src="/agrenza-logo-small.jpg" alt="Agrenza Logo" width={38} height={38} className="nav-logo-img" style={{ width: "38px", height: "38px" }} />
            <span>Agren<span>za</span></span>
          </Link>

          <nav className="nav-links">
            <Link href="/shop" className="nav-item">Shop</Link>
            <Link href="/offers" className="nav-item nav-offer-badge">
              <span>🎁 Offers</span>
              <span className="chip-discount">10% OFF</span>
            </Link>
            <Link href="/about" className="nav-item">About</Link>
            {user?.role === "buyer" && (
              <>
                <Link href="/buyer/dashboard" className="nav-item">Dashboard</Link>
                <Link href="/buyer/orders" className="nav-item">My Orders</Link>
              </>
            )}
            {user?.role === "farmer" && (
              <Link href="/farmer/dashboard" className="nav-item">Farmer Dashboard</Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin/dashboard" className="nav-item">Admin Panel</Link>
            )}
            {!user && (
              <Link href="/auth/farmer-register" className="nav-item">Sell on Agrenza</Link>
            )}
          </nav>

          <div className="nav-actions">
            {/* CART LINK */}
            <Link href="/buyer/cart" className="cart-link" aria-label="Shopping Cart">
              🛒 Cart
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>

            {/* LOGGED IN USER PROFILE DROPDOWN */}
            {user ? (
              <div className="profile-dropdown-container" ref={menuRef}>
                <button
                  type="button"
                  className="profile-pill-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                >
                  <div className="nav-avatar">
                    {user.name.charAt(0).toUpperCase()}
                    <span className="online-indicator" />
                  </div>
                  <div className="user-titles">
                    <span className="user-nav-name">{user.name}</span>
                    <span className="user-nav-role">{user.role.toUpperCase()}</span>
                  </div>
                  <span className="chevron-icon">{menuOpen ? "▲" : "▼"}</span>
                </button>

                {menuOpen && (
                  <div className="dropdown-card">
                    <div className="dropdown-user-header">
                      <strong>{user.name}</strong>
                      <span className="user-dropdown-email">{user.email || user.mobile || "Verified Account"}</span>
                      <span className="user-role-badge">✓ {user.role === "buyer" ? "Verified Buyer" : user.role.toUpperCase()}</span>
                    </div>

                    <div className="dropdown-menu-list">
                      {user.role === "buyer" && (
                        <>
                          <Link
                            href="/buyer/dashboard"
                            className="dropdown-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="d-icon">📊</span>
                            <div>
                              <strong>Buyer Dashboard</strong>
                              <small>Profile, stats &amp; wallet</small>
                            </div>
                          </Link>

                          <Link
                            href="/buyer/orders"
                            className="dropdown-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="d-icon">📦</span>
                            <div>
                              <strong>My Orders &amp; Live Tracking</strong>
                              <small>Check shipping travel status</small>
                            </div>
                          </Link>

                          <Link
                            href="/offers"
                            className="dropdown-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="d-icon">🏷️</span>
                            <div>
                              <strong>Discounts &amp; Offers</strong>
                              <small>Active coupon promo codes</small>
                            </div>
                          </Link>

                          <Link
                            href="/buyer/bulk-request"
                            className="dropdown-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="d-icon">🧺</span>
                            <div>
                              <strong>Bulk Produce Quote</strong>
                              <small>Wholesale direct from farms</small>
                            </div>
                          </Link>
                        </>
                      )}

                      {user.role === "farmer" && (
                        <Link
                          href="/farmer/dashboard"
                          className="dropdown-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="d-icon">🚜</span>
                          <div>
                            <strong>Farmer Dashboard</strong>
                            <small>Manage crops &amp; stock</small>
                          </div>
                        </Link>
                      )}

                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="dropdown-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="d-icon">⚡</span>
                          <div>
                            <strong>Admin Dashboard</strong>
                            <small>Manage orders &amp; approvals</small>
                          </div>
                        </Link>
                      )}

                      <div className="dropdown-divider" />

                      <button
                        type="button"
                        className="dropdown-item logout-btn"
                        onClick={handleLogout}
                      >
                        <span className="d-icon">🚪</span>
                        <strong>Log Out</strong>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* GUEST BUTTONS */
              <>
                <Link href="/auth/login" className="btn-ghost">
                  Log in
                </Link>
                <Link href="/auth/buyer-register" className="btn-solid">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <style jsx>{`
        /* Top Offer Bar */
        .top-offer-bar {
          background: linear-gradient(90deg, #1b3821 0%, #15803d 50%, #1b3821 100%);
          color: #ffffff;
          font-size: 0.78rem;
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .top-bar-inner {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          text-align: center;
        }
        .offer-pulse { animation: bounce 1.5s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .highlight-code {
          background: #fde047;
          color: #713f12;
          font-weight: 800;
          font-family: var(--font-mono);
          padding: 1px 6px;
          border-radius: 4px;
          margin: 0 4px;
        }
        .top-offer-link {
          color: #86efac;
          font-weight: 700;
          text-decoration: underline;
          margin-left: 6px;
        }
        .top-offer-link:hover { color: #ffffff; }

        /* Nav Header */
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }
        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
        }
        .nav-logo {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.45rem;
          color: #16241a;
          text-decoration: none;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-logo-img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid #16a34a;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .nav-logo span { color: #2e7d32; }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
          font-size: 0.92rem;
        }
        .nav-item {
          color: #2c3e2d;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .nav-item:hover { color: #2e7d32; }

        .nav-offer-badge {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.84rem;
        }
        .chip-discount {
          background: #16a34a;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 999px;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .cart-link {
          color: #2c3e2d;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 7px 12px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          border: 1px solid #e2e8f0;
          transition: all 0.15s;
        }
        .cart-link:hover { border-color: #16a34a; color: #16a34a; background: #f0fdf4; }
        .cart-count {
          background: #16a34a;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 1px 7px;
          border-radius: 999px;
          margin-left: 6px;
        }

        /* Profile Pill & Dropdown */
        .profile-dropdown-container { position: relative; }
        .profile-pill-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 5px 12px 5px 6px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .profile-pill-btn:hover { border-color: #16a34a; background: #f0fdf4; }

        .nav-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #16a34a; color: #ffffff;
          font-weight: 800; font-size: 0.88rem;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .online-indicator {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e; border: 1.5px solid #ffffff;
          position: absolute; bottom: -1px; right: -1px;
        }
        .user-titles { display: flex; flex-direction: column; text-align: left; line-height: 1.1; }
        .user-nav-name { font-size: 0.82rem; font-weight: 700; color: #0f172a; max-width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-nav-role { font-size: 0.65rem; color: #16a34a; font-weight: 800; letter-spacing: 0.04em; }
        .chevron-icon { font-size: 0.6rem; color: #64748b; }

        /* Dropdown Card */
        .dropdown-card {
          position: absolute;
          right: 0;
          top: 48px;
          width: 270px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          overflow: hidden;
          z-index: 200;
          animation: dropFade 0.15s ease-out;
        }
        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-user-header {
          padding: 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dropdown-user-header strong { font-size: 0.95rem; color: #0f172a; }
        .user-dropdown-email { font-size: 0.78rem; color: #64748b; word-break: break-all; }
        .user-role-badge { display: inline-block; font-size: 0.68rem; font-weight: 800; color: #15803d; background: #dcfce7; padding: 2px 6px; border-radius: 4px; margin-top: 4px; align-self: flex-start; }

        .dropdown-menu-list { padding: 6px 0; display: flex; flex-direction: column; }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          color: #334155;
          text-decoration: none;
          font-size: 0.85rem;
          transition: background 0.1s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .dropdown-item:hover { background: #f1f5f9; color: #16a34a; }
        .dropdown-item div { display: flex; flex-direction: column; }
        .dropdown-item strong { font-size: 0.82rem; color: #0f172a; }
        .dropdown-item small { font-size: 0.7rem; color: #64748b; }
        .d-icon { font-size: 1.1rem; }

        .dropdown-divider { height: 1px; background: #e2e8f0; margin: 4px 0; }

        .logout-btn { color: #dc2626 !important; }
        .logout-btn:hover { background: #fef2f2 !important; }
        .logout-btn strong { color: #dc2626 !important; }

        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
      `}</style>
    </>
  );
}
