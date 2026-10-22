"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/lib/cart-context";
import { placeOrderApi, getMe, ApiError, AuthUser } from "@/app/lib/api";
import "@/app/components/forms.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, addItem, removeItem, clearCart, placeOrder } = useCart();

  // User auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active step (1: Login/Details, 2: Address, 3: Order Summary, 4: Payment)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Address fields (Flipkart structured format)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [locality, setLocality] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [landmark, setLandmark] = useState("");
  const [addressType, setAddressType] = useState<"home" | "work">("home");

  // Payment mode
  const [paymentMode, setPaymentMode] = useState<"cod" | "upi" | "card" | "netbanking">("cod");
  const [upiId, setUpiId] = useState("");

  // Coupon / Buyer discount state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponError, setCouponError] = useState("");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  function handleApplyCoupon(codeToApply?: string) {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");
    if (!code) {
      setCouponError("Please enter a valid coupon code.");
      return;
    }
    if (code === "FRESHFARM10") {
      const disc = total * 0.10;
      setAppliedCoupon({ code, discount: disc, label: "10% Harvest Season Discount" });
      setCouponInput("");
    } else if (code === "ORGANIC20") {
      const disc = total * 0.20;
      setAppliedCoupon({ code, discount: disc, label: "20% Organic Produce Discount" });
      setCouponInput("");
    } else if (code === "FIRSTHARVEST") {
      const disc = Math.min(50, total);
      setAppliedCoupon({ code, discount: disc, label: "₹50 New Buyer Welcome Gift" });
      setCouponInput("");
    } else if (code === "BULKSAVER15") {
      const disc = total * 0.15;
      setAppliedCoupon({ code, discount: disc, label: "15% Wholesale Direct Discount" });
      setCouponInput("");
    } else if (code === "FREESHIP") {
      setAppliedCoupon({ code, discount: 0, label: "Free Doorstep Farm Delivery" });
      setCouponInput("");
    } else if (code === "FARMDIRECT5") {
      const disc = total * 0.05;
      setAppliedCoupon({ code, discount: disc, label: "5% Online Payment Discount" });
      setCouponInput("");
    } else {
      setCouponError("Invalid or expired coupon code. Check available codes below.");
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
  }

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (me?.user) {
          setUser(me.user);
          if (me.user.name) setFullName(me.user.name);
          if (me.user.mobile) setPhone(me.user.mobile);

          if (me.user.role === "buyer") {
            // Logged in buyer: automatically advance to Step 2 (Delivery Address)
            setActiveStep(2);
          } else {
            setActiveStep(1);
          }
        } else {
          setUser(null);
          setActiveStep(1);
        }
      } catch {
        setUser(null);
        setActiveStep(1);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  // Format full combined address
  const fullDeliveryAddress = [
    fullName ? `Name: ${fullName}` : "",
    phone ? `Ph: ${phone}` : "",
    streetAddress,
    locality,
    landmark ? `Near ${landmark}` : "",
    city,
    state,
    pincode ? `PIN: ${pincode}` : "",
    `(${addressType.toUpperCase()})`,
  ]
    .filter(Boolean)
    .join(", ");

  function goToStep(targetStep: number) {
    if (!user) {
      setActiveStep(1);
      setError("Please log in to your Buyer account first to proceed.");
      return;
    }
    if (user.role !== "buyer") {
      setActiveStep(1);
      setError("Only Buyer accounts can place orders. Please switch to a Buyer account.");
      return;
    }
    setError("");
    setActiveStep(targetStep);
  }

  const ALLOWED_PINCODES = ["629001", "629401"];

  function handleAddressSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || user.role !== "buyer") {
      setActiveStep(1);
      setError("Please log in to your Buyer account first to save address and continue.");
      return;
    }
    if (!streetAddress.trim() || !pincode.trim()) {
      setError("Please fill in Street Address and Pincode.");
      return;
    }
    if (!ALLOWED_PINCODES.includes(pincode.trim())) {
      setError("Delivery is only available for pincodes 629001 and 629401 (Kanyakumari district). Sorry, we do not deliver to other areas yet.");
      return;
    }
    setError("");
    setCity("Kanyakumari");
    setActiveStep(3);
  }

  function handleQtyChange(productId: number, newQty: number) {
    if (newQty <= 0) {
      removeItem(productId);
    } else {
      const item = items.find((i) => i.productId === productId);
      if (item) {
        const diff = newQty - item.qty;
        addItem({ id: item.productId, name: item.name, price: item.price, category: "", stock: 999, description: "", farmer: "", location: "", icon: item.icon || "tomato", image: undefined }, diff);
      }
    }
  }

  async function handleFinalPlaceOrder() {
    if (!user) {
      setActiveStep(1);
      setError("Authentication required: Please log in with a Buyer account to place this order.");
      return;
    }

    if (user.role !== "buyer") {
      setActiveStep(1);
      setError("Access denied: Only Buyer accounts are permitted to place orders. Please log in as a Buyer.");
      return;
    }

    if (!fullDeliveryAddress.trim() || !streetAddress.trim()) {
      setActiveStep(2);
      setError("Please provide your delivery address.");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const backendPayMode: "cod" | "online" = paymentMode === "cod" ? "cod" : "online";
      const orderPayload: {
        address: string;
        payment_mode: "cod" | "online";
        items: { product_id: number; qty: number }[];
      } = {
        address: fullDeliveryAddress,
        payment_mode: backendPayMode,
        items: items.map((i) => ({
          product_id: i.productId,
          qty: i.qty,
        })),
      };

      await placeOrderApi(orderPayload);

      placeOrder(backendPayMode);
      clearCart();

      router.push("/buyer/orders");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to place order. Please try again.");
      }
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Nav />
        <div className="container empty-wrap">
          <div className="empty-cart-card">
            <span className="empty-icon">🛒</span>
            <h2>Your Shopping Cart is Empty</h2>
            <p>Explore fresh organic harvest directly from verified local farmers!</p>
            <Link href="/buyer/shop" className="btn-shop">
              🌾 Browse Farm Shop
            </Link>
          </div>
        </div>
        <Footer />
        <style jsx>{`
          .empty-wrap { padding: 80px 24px; display: flex; justify-content: center; }
          .empty-cart-card { background: #fff; border: 1px solid rgba(26,26,21,0.08); border-radius: 16px; padding: 48px; text-align: center; max-width: 480px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
          .empty-icon { font-size: 3.5rem; display: block; margin-bottom: 12px; }
          h2 { font-family: var(--font-display); font-size: 1.5rem; color: #1b3821; margin: 0 0 8px; }
          p { color: #6b6555; font-size: 0.9rem; margin-bottom: 24px; }
          .btn-shop { background: #16a34a; color: #fff; padding: 12px 26px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 0.92rem; display: inline-block; }
          .btn-shop:hover { background: #15803d; }
        `}</style>
      </>
    );
  }

  // Savings calculation (assume retail market is ~20% higher than direct farm base)
  const retailEstimatedTotal = total * 1.25;
  const savings = retailEstimatedTotal - total;

  return (
    <>
      <Nav />
      <div className="checkout-bg">
        <div className="container checkout-container">
          
          {error && <div className="error-banner">⚠️ {error}</div>}

          <div className="checkout-grid">
            
            {/* LEFT COLUMN: FLIPKART ACCORDION STEPS */}
            <div className="steps-column">
              
              {/* STEP 1: LOGIN / BUYER DETAILS */}
              <div className={`step-card ${user && user.role === "buyer" && activeStep > 1 ? "completed" : "active"}`}>
                <div className="step-header">
                  <div className="step-num-wrap">
                    <span className="step-num">{user && user.role === "buyer" && activeStep > 1 ? "✓" : "1"}</span>
                    <span className="step-title">
                      {user && user.role === "buyer" ? "LOGIN & BUYER PROFILE" : "LOGIN REQUIRED TO ORDER"}
                    </span>
                  </div>
                  {user && user.role === "buyer" && activeStep > 1 && (
                    <button type="button" className="btn-step-change" onClick={() => goToStep(1)}>
                      CHANGE
                    </button>
                  )}
                </div>

                {authLoading ? (
                  <div className="step-content">
                    <p style={{ color: "#64748b", margin: 0 }}>⏳ Verifying buyer login status…</p>
                  </div>
                ) : !user ? (
                  /* GUEST / NOT LOGGED IN USER */
                  <div className="step-content">
                    <div className="auth-required-box">
                      <div className="auth-icon-wrap">🔒</div>
                      <div className="auth-info-text">
                        <h4 className="auth-title">Buyer Login Required to Place Order</h4>
                        <p className="auth-desc">
                          Only registered buyers can place orders on Agrenza. Non-logged-in visitors cannot order produce. Please sign in to your buyer account or register below to complete your harvest purchase.
                        </p>

                        <div className="auth-btn-row">
                          <Link href="/auth/login?redirect=/buyer/checkout" className="btn-primary-auth">
                            🔑 Log In as Buyer
                          </Link>
                          <Link href="/auth/buyer-register" className="btn-secondary-auth">
                            🌾 Create New Buyer Account
                          </Link>
                        </div>

                        <div className="auth-perks">
                          <span>✓ Direct farm fresh price</span>
                          <span>✓ Live delivery travel tracking</span>
                          <span>✓ SMS &amp; Email confirmations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : user.role !== "buyer" ? (
                  /* LOGGED IN AS FARMER OR ADMIN */
                  <div className="step-content">
                    <div className="role-alert-box">
                      <span className="alert-icon">⚠️</span>
                      <div>
                        <strong>Logged in as {user.role.toUpperCase()} ({user.name})</strong>
                        <p style={{ margin: "4px 0 12px", fontSize: "0.85rem", color: "#64748b" }}>
                          Only accounts registered with the <strong>Buyer</strong> role can purchase products and place orders.
                        </p>
                        <div className="auth-btn-row">
                          <Link href="/auth/login?redirect=/buyer/checkout" className="btn-primary-auth">
                            Switch to a Buyer Account
                          </Link>
                          <Link href="/auth/buyer-register" className="btn-secondary-auth">
                            Register as Buyer
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeStep === 1 ? (
                  /* LOGGED IN BUYER EDITING STEP 1 */
                  <div className="step-content">
                    <div className="user-profile-row">
                      <div className="user-meta-wrap">
                        <div className="verified-shield">✓</div>
                        <div>
                          <strong>{user.name} <span className="badge-buyer">Verified Buyer</span></strong>
                          <div className="user-sub">{user.mobile || "Mobile verified"} &bull; {user.email || "Active account"}</div>
                        </div>
                      </div>
                      <div className="user-action-wrap">
                        <Link href="/auth/login?redirect=/buyer/checkout" className="btn-switch-link">
                          Switch Account
                        </Link>
                        <button type="button" className="btn-flipkart-action" onClick={() => goToStep(2)}>
                          CONTINUE TO DELIVERY ADDRESS
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LOGGED IN BUYER COMPLETED STEP 1 SUMMARY */
                  <div className="step-summary-text">
                    <strong>{user.name}</strong> • {user.mobile || user.email || "Verified Buyer"}
                  </div>
                )}
              </div>

              {/* STEP 2: DELIVERY ADDRESS */}
              <div className={`step-card ${activeStep === 2 ? "active" : activeStep > 2 ? "completed" : "pending"}`}>
                <div className="step-header">
                  <div className="step-num-wrap">
                    <span className="step-num">{activeStep > 2 ? "✓" : "2"}</span>
                    <span className="step-title">DELIVERY ADDRESS</span>
                  </div>
                  {activeStep > 2 && (
                    <button type="button" className="btn-step-change" onClick={() => goToStep(2)}>
                      CHANGE
                    </button>
                  )}
                </div>

                {activeStep === 2 ? (
                  <form className="step-content" onSubmit={handleAddressSave}>
                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Receiver Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label>10-digit Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Mobile Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Pincode (6 digits) *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="629001 or 629401"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                        />
                        {pincode.length === 6 && !["629001","629401"].includes(pincode) && (
                          <span style={{ color: "#dc2626", fontSize: "0.78rem" }}>
                            ⚠️ Only pincodes 629001 & 629401 are serviceable
                          </span>
                        )}
                        {["629001","629401"].includes(pincode) && (
                          <span style={{ color: "#16a34a", fontSize: "0.78rem" }}>✓ Deliverable area</span>
                        )}
                      </div>
                      <div className="form-field">
                        <label>Locality / Area *</label>
                        <input
                          type="text"
                          required
                          placeholder="Your locality or area"
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-field full">
                      <label>Address (House No, Building, Street, Area) *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="House / Door No, Street name"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                      />
                    </div>

                    <div className="form-grid-3">
                      <div className="form-field">
                        <label>City / District</label>
                        <input
                          type="text"
                          value="Kanyakumari"
                          readOnly
                          style={{ background: "#f1f5f9", color: "#374151", cursor: "not-allowed" }}
                        />
                      </div>
                      <div className="form-field">
                        <label>State *</label>
                        <select value={state} onChange={(e) => setState(e.target.value)}>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Landmark (Optional)</label>
                        <input
                          type="text"
                          placeholder="Nearby landmark"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Address Type */}
                    <div className="address-type-wrap">
                      <span className="type-label">Address Type:</span>
                      <div className="radio-group">
                        <label className={`type-chip ${addressType === "home" ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="addrType"
                            checked={addressType === "home"}
                            onChange={() => setAddressType("home")}
                          />
                          <span>🏠 Home (All day delivery)</span>
                        </label>
                        <label className={`type-chip ${addressType === "work" ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="addrType"
                            checked={addressType === "work"}
                            onChange={() => setAddressType("work")}
                          />
                          <span>🏢 Work (Delivery 10 AM - 5 PM)</span>
                        </label>
                      </div>
                    </div>

                    <div className="btn-row">
                      <button type="submit" className="btn-flipkart-save">
                        DELIVER HERE
                      </button>
                    </div>
                  </form>
                ) : (
                  activeStep > 2 && (
                    <div className="step-summary-text">
                      <div className="addr-badge">{addressType.toUpperCase()}</div>
                      <strong>{fullName || user?.name}</strong> • {phone || user?.mobile}
                      <p className="addr-line">{fullDeliveryAddress}</p>
                    </div>
                  )
                )}
              </div>

              {/* STEP 3: ORDER SUMMARY */}
              <div className={`step-card ${activeStep === 3 ? "active" : activeStep > 3 ? "completed" : "pending"}`}>
                <div className="step-header">
                  <div className="step-num-wrap">
                    <span className="step-num">{activeStep > 3 ? "✓" : "3"}</span>
                    <span className="step-title">ORDER SUMMARY ({items.length} PRODUCE ITEMS)</span>
                  </div>
                {activeStep > 3 && (
                  <button type="button" className="btn-step-change" onClick={() => goToStep(3)}>
                    CHANGE
                  </button>
                )}
              </div>

              {activeStep === 3 ? (
                <div className="step-content">
                  <div className="produce-items-list">
                    {items.map((item) => (
                      <div className="produce-item-card" key={item.productId}>
                        <div className="prod-left">
                          <div className="item-icon-box">🌾</div>
                          <div className="prod-details">
                            <strong className="prod-name">{item.name}</strong>
                            <span className="prod-rate">₹{item.price.toFixed(2)} / kg</span>
                            <div className="delivery-badge">
                              🚚 Farm-Fresh Delivery within 24–48 Hours
                            </div>
                          </div>
                        </div>

                        <div className="prod-right">
                          <div className="qty-counter">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleQtyChange(item.productId, item.qty - 1)}
                            >
                              -
                            </button>
                            <span className="qty-display">{item.qty} kg</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleQtyChange(item.productId, item.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                          <strong className="item-subtotal">₹{(item.price * item.qty).toFixed(2)}</strong>
                          <button
                            type="button"
                            className="btn-remove-item"
                            onClick={() => removeItem(item.productId)}
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary-footer">
                    <span className="email-notif">
                      📧 Order confirmation email will be sent to your Gmail inbox.
                    </span>
                    <button type="button" className="btn-flipkart-save" onClick={() => goToStep(4)}>
                      CONTINUE TO PAYMENT
                    </button>
                  </div>
                </div>
              ) : (
                activeStep > 3 && (
                  <div className="step-summary-text">
                    {items.length} Farm Item(s) — Total: <strong>₹{total.toFixed(2)}</strong>
                  </div>
                )
              )}
            </div>

            {/* STEP 4: PAYMENT OPTIONS */}
            <div className={`step-card ${activeStep === 4 ? "active" : "pending"}`}>
              <div className="step-header">
                <div className="step-num-wrap">
                  <span className="step-num">4</span>
                  <span className="step-title">PAYMENT OPTIONS</span>
                </div>
              </div>

              {activeStep === 4 && (
                <div className="step-content">
                  {(!user || user.role !== "buyer") ? (
                    <div className="auth-required-box">
                      <div className="auth-icon-wrap">🔒</div>
                      <div className="auth-info-text">
                        <h4 className="auth-title">Log in as a Buyer to Select Payment</h4>
                        <p className="auth-desc">
                          You must be logged into an active Buyer account before completing your payment.
                        </p>
                        <div className="auth-btn-row">
                          <Link href="/auth/login?redirect=/buyer/checkout" className="btn-primary-auth">
                            🔑 Log In as Buyer
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="payment-options-grid">
                      
                      {/* Cash on Delivery (COD) */}
                      <label className={`pay-option-card ${paymentMode === "cod" ? "selected" : ""}`}>
                        <div className="pay-radio-line">
                          <input
                            type="radio"
                            name="paymode"
                            checked={paymentMode === "cod"}
                            onChange={() => setPaymentMode("cod")}
                          />
                          <span className="pay-name">💵 Cash on Delivery (COD)</span>
                        </div>
                        {paymentMode === "cod" && (
                          <div className="pay-sub-box">
                            <p>Pay cash or scan UPI QR code at your doorstep when your fresh produce arrives.</p>
                            <button
                              type="button"
                              className="btn-place-order-flipkart"
                              onClick={handleFinalPlaceOrder}
                              disabled={placing}
                            >
                              {placing ? "PLACING ORDER…" : "CONFIRM & PLACE ORDER (COD)"}
                            </button>
                          </div>
                        )}
                      </label>

                      {/* UPI / QR Code */}
                      <label className={`pay-option-card ${paymentMode === "upi" ? "selected" : ""}`}>
                        <div className="pay-radio-line">
                          <input
                            type="radio"
                            name="paymode"
                            checked={paymentMode === "upi"}
                            onChange={() => setPaymentMode("upi")}
                          />
                          <span className="pay-name">📱 UPI / QR Code (Google Pay, PhonePe, Paytm)</span>
                        </div>
                        {paymentMode === "upi" && (
                          <div className="pay-sub-box">
                            <label className="sub-label">Enter UPI ID (VPA):</label>
                            <input
                              type="text"
                              placeholder="e.g. mobile@upi or username@okhdfcbank"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="upi-input"
                            />
                            <button
                              type="button"
                              className="btn-place-order-flipkart"
                              onClick={handleFinalPlaceOrder}
                              disabled={placing}
                            >
                              {placing ? "PROCESSING…" : `PAY ₹${total.toFixed(2)} VIA UPI`}
                            </button>
                          </div>
                        )}
                      </label>

                      {/* Credit / Debit Card */}
                      <label className={`pay-option-card ${paymentMode === "card" ? "selected" : ""}`}>
                        <div className="pay-radio-line">
                          <input
                            type="radio"
                            name="paymode"
                            checked={paymentMode === "card"}
                            onChange={() => setPaymentMode("card")}
                          />
                          <span className="pay-name">💳 Credit / Debit / ATM Card (Visa, RuPay, MasterCard)</span>
                        </div>
                        {paymentMode === "card" && (
                          <div className="pay-sub-box">
                            <p className="hint">Instant secure 256-bit encrypted card transaction.</p>
                            <button
                              type="button"
                              className="btn-place-order-flipkart"
                              onClick={handleFinalPlaceOrder}
                              disabled={placing}
                            >
                              {placing ? "PROCESSING…" : `PAY ₹${total.toFixed(2)} VIA CARD`}
                            </button>
                          </div>
                        )}
                      </label>

                      {/* Net Banking */}
                      <label className={`pay-option-card ${paymentMode === "netbanking" ? "selected" : ""}`}>
                        <div className="pay-radio-line">
                          <input
                            type="radio"
                            name="paymode"
                            checked={paymentMode === "netbanking"}
                            onChange={() => setPaymentMode("netbanking")}
                          />
                          <span className="pay-name">🏦 Net Banking (SBI, HDFC, ICICI, Axis &amp; All Major Banks)</span>
                        </div>
                        {paymentMode === "netbanking" && (
                          <div className="pay-sub-box">
                            <button
                              type="button"
                              className="btn-place-order-flipkart"
                              onClick={handleFinalPlaceOrder}
                              disabled={placing}
                            >
                              {placing ? "CONNECTING BANK…" : `PAY ₹${total.toFixed(2)} VIA NET BANKING`}
                            </button>
                          </div>
                        )}
                      </label>

                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: FLIPKART STICKY PRICE DETAILS */}
          <div className="sidebar-column">
            <div className="price-details-card">
              <h3 className="sidebar-title">PRICE DETAILS</h3>
              
              <div className="price-row">
                <span>Price ({items.length} items)</span>
                <span>₹{retailEstimatedTotal.toFixed(2)}</span>
              </div>

              <div className="price-row">
                <span>Direct Farm Discount</span>
                <span className="green-text">-₹{savings.toFixed(2)}</span>
              </div>

              <div className="price-row">
                <span>Delivery Charges</span>
                <span className="green-text">FREE</span>
              </div>

              <div className="price-row">
                <span>Packaging &amp; Handling</span>
                <span className="green-text">FREE</span>
              </div>

              <div className="price-divider" />

              <div className="price-row total-row">
                <span>Total Payable Amount</span>
                <strong className="total-amount">₹{total.toFixed(2)}</strong>
              </div>

              <div className="savings-highlight-box">
                🌱 You will save <strong>₹{savings.toFixed(2)}</strong> on this order by buying directly from verified local farmers!
              </div>

              {(!user || user.role !== "buyer") && (
                <div className="sidebar-login-prompt">
                  <span className="lock-icon">🔒</span>
                  <div className="prompt-text">
                    <strong>Buyer Login Required</strong>
                    <p>Log in as a Buyer to place your harvest order.</p>
                  </div>
                  <Link href="/auth/login?redirect=/buyer/checkout" className="btn-sidebar-login">
                    Log In as Buyer →
                  </Link>
                </div>
              )}

              <div className="security-guarantee">
                <span className="shield-icon">🛡️</span>
                <span>100% Safe &amp; Direct Farm Fresh Produce Guarantee</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <Footer />

    <style jsx>{`
      .checkout-bg { background: #f1f3f6; min-height: 85vh; padding: 28px 0 80px; }
      .checkout-container { max-width: 1200px; margin: 0 auto; }
      
      .error-banner { background: #fef2f2; border: 1.5px solid #fecaca; color: #991b1b; padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; font-size: 0.9rem; }

      .checkout-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }
      @media (max-width: 960px) {
        .checkout-grid { grid-template-columns: 1fr; }
      }

      /* Step Card Accordion */
      .steps-column { display: flex; flex-direction: column; gap: 14px; }
      
      .step-card { background: #ffffff; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e0e0e0; }
      .step-card.active .step-header { background: #16a34a; color: #ffffff; }
      .step-card.active .step-num { background: #ffffff; color: #16a34a; }
      .step-card.completed .step-header { background: #f8fafc; color: #64748b; }
      .step-card.completed .step-num { background: #e2e8f0; color: #16a34a; font-weight: 800; }
      .step-card.pending .step-header { background: #ffffff; color: #94a3b8; }

      .step-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; }
      .step-num-wrap { display: flex; align-items: center; gap: 12px; }
      .step-num { width: 24px; height: 24px; border-radius: 4px; background: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
      .step-title { font-size: 0.88rem; font-weight: 700; letter-spacing: 0.03em; }
      .btn-step-change { border: 1px solid #cbd5e1; background: #ffffff; color: #16a34a; font-size: 0.76rem; font-weight: 700; padding: 5px 14px; border-radius: 3px; cursor: pointer; }
      .btn-step-change:hover { background: #f0fdf4; }

      .step-content { padding: 22px 20px; background: #ffffff; }
      .step-summary-text { padding: 14px 20px; font-size: 0.86rem; color: #334155; background: #ffffff; }
      .addr-badge { display: inline-block; font-size: 0.7rem; font-weight: 700; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 3px; margin-bottom: 4px; }
      .addr-line { color: #64748b; font-size: 0.82rem; margin: 4px 0 0; }

      /* Auth Required Box for Non-Logged-In Users */
      .auth-required-box { display: flex; gap: 16px; align-items: flex-start; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 20px; }
      .auth-icon-wrap { font-size: 2rem; background: #e0f2fe; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .auth-info-text { flex: 1; }
      .auth-title { margin: 0 0 6px; font-size: 1.1rem; color: #0f172a; font-weight: 700; }
      .auth-desc { margin: 0 0 16px; font-size: 0.86rem; color: #475569; line-height: 1.5; }
      .auth-btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
      .btn-primary-auth { background: #16a34a; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-weight: 700; font-size: 0.88rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s; }
      .btn-primary-auth:hover { background: #15803d; }
      .btn-secondary-auth { background: #ffffff; color: #1e293b; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 0.88rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
      .btn-secondary-auth:hover { background: #f1f5f9; }
      .auth-perks { display: flex; gap: 14px; font-size: 0.76rem; color: #64748b; font-weight: 600; flex-wrap: wrap; border-top: 1px dashed #e2e8f0; padding-top: 10px; }

      /* Role Alert Box */
      .role-alert-box { display: flex; gap: 14px; align-items: flex-start; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; color: #92400e; }
      .alert-icon { font-size: 1.8rem; }

      /* User Profile Step 1 Row */
      .user-profile-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; }
      .user-meta-wrap { display: flex; align-items: center; gap: 12px; }
      .verified-shield { width: 34px; height: 34px; border-radius: 50%; background: #dcfce7; color: #15803d; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; }
      .badge-buyer { display: inline-block; font-size: 0.72rem; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; margin-left: 6px; vertical-align: middle; }
      .user-sub { font-size: 0.82rem; color: #64748b; margin-top: 2px; }
      .user-action-wrap { display: flex; align-items: center; gap: 12px; }
      .btn-switch-link { font-size: 0.82rem; color: #64748b; text-decoration: underline; }
      .btn-switch-link:hover { color: #0f172a; }
      .btn-flipkart-action { background: #fb641b; color: #fff; border: none; padding: 12px 22px; font-size: 0.85rem; font-weight: 700; border-radius: 3px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
      .btn-flipkart-action:hover { background: #e65100; }

      /* Address Form */
      .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
      .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }
      @media (max-width: 640px) {
        .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
      }

      .form-field { display: flex; flex-direction: column; gap: 4px; }
      .form-field.full { margin-bottom: 14px; }
      .form-field label { font-size: 0.78rem; font-weight: 600; color: #475569; }
      .form-field input, .form-field select, .form-field textarea {
        border: 1px solid #cbd5e1; border-radius: 4px; padding: 9px 12px; font-size: 0.88rem; outline: none; transition: border 0.15s; font-family: inherit;
      }
      .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #16a34a; box-shadow: 0 0 0 2px rgba(22,163,74,0.15); }

      .address-type-wrap { margin: 12px 0 18px; }
      .type-label { font-size: 0.78rem; font-weight: 600; color: #475569; display: block; margin-bottom: 8px; }
      .radio-group { display: flex; gap: 14px; flex-wrap: wrap; }
      .type-chip { display: flex; align-items: center; gap: 8px; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-size: 0.82rem; font-weight: 600; color: #334155; }
      .type-chip.selected { border-color: #16a34a; background: #f0fdf4; color: #15803d; }

      .btn-row { margin-top: 14px; }
      .btn-flipkart-save { background: #fb641b; color: #ffffff; border: none; padding: 14px 34px; font-size: 0.92rem; font-weight: 800; border-radius: 3px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.15); letter-spacing: 0.02em; }
      .btn-flipkart-save:hover { background: #e65100; }

      /* Order Summary Produce Items */
      .produce-items-list { display: flex; flex-direction: column; gap: 14px; }
      .produce-item-card { display: flex; justify-content: space-between; align-items: center; padding: 14px; border: 1px solid #f1f5f9; border-radius: 6px; background: #fafafa; }
      @media (max-width: 600px) {
        .produce-item-card { flex-direction: column; align-items: flex-start; gap: 12px; }
      }
      .prod-left { display: flex; align-items: center; gap: 14px; }
      .item-icon-box { font-size: 1.8rem; background: #ede4cd; width: 50px; height: 50px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
      .prod-details { display: flex; flex-direction: column; gap: 2px; }
      .prod-name { font-size: 0.95rem; color: #1b3821; }
      .prod-rate { font-size: 0.82rem; color: #64748b; }
      .delivery-badge { font-size: 0.74rem; color: #16a34a; font-weight: 600; margin-top: 4px; }

      .prod-right { display: flex; align-items: center; gap: 16px; }
      .qty-counter { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 4px; background: #fff; }
      .qty-btn { width: 28px; height: 28px; border: none; background: #f8fafc; font-weight: 700; cursor: pointer; color: #334155; }
      .qty-btn:hover { background: #e2e8f0; }
      .qty-display { padding: 0 10px; font-size: 0.85rem; font-weight: 700; color: #1e293b; }
      .item-subtotal { font-size: 1.05rem; color: #16a34a; font-weight: 800; }
      .btn-remove-item { border: none; background: none; color: #dc2626; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
      
      .order-summary-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; flex-wrap: wrap; gap: 12px; }
      .email-notif { font-size: 0.78rem; color: #64748b; }

      /* Payment Options */
      .payment-options-grid { display: flex; flex-direction: column; gap: 12px; }
      .pay-option-card { display: block; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; }
      .pay-option-card.selected { border-color: #16a34a; background: #fafdfa; }
      .pay-radio-line { display: flex; align-items: center; gap: 12px; }
      .pay-name { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
      
      .pay-sub-box { margin-top: 12px; padding: 12px 14px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.84rem; color: #475569; }
      .sub-label { display: block; font-weight: 600; margin-bottom: 6px; }
      .upi-input { width: 100%; max-width: 320px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.88rem; margin-bottom: 10px; }
      .hint { font-size: 0.78rem; color: #64748b; margin-bottom: 10px; }
      
      .btn-place-order-flipkart { width: 100%; max-width: 340px; padding: 14px 24px; background: #fb641b; color: #fff; border: none; border-radius: 3px; font-size: 0.95rem; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.15); letter-spacing: 0.03em; margin-top: 6px; }
      .btn-place-order-flipkart:hover { background: #e65100; }
      .btn-place-order-flipkart:disabled { opacity: 0.6; cursor: not-allowed; }

      /* RIGHT COLUMN: FLIPKART PRICE DETAILS CARD */
      .sidebar-column { position: sticky; top: 20px; }
      .price-details-card { background: #ffffff; border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 1px 4px rgba(0,0,0,0.08); padding: 18px 22px; }
      .sidebar-title { font-size: 0.85rem; font-weight: 800; color: #878787; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px; margin: 0 0 16px; letter-spacing: 0.04em; }

      .price-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #212121; margin-bottom: 14px; }
      .green-text { color: #388e3c; font-weight: 700; }
      .price-divider { height: 1px; border-top: 1px dashed #e0e0e0; margin: 16px 0; }
      .total-row { font-size: 1.05rem; font-weight: 800; color: #212121; margin-bottom: 16px; }
      .total-amount { font-size: 1.25rem; color: #16a34a; }

      .savings-highlight-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 10px 12px; font-size: 0.82rem; color: #166534; line-height: 1.4; margin-bottom: 16px; }
      
      .sidebar-login-prompt { background: #fefce8; border: 1.5px solid #fde047; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
      .sidebar-login-prompt .lock-icon { font-size: 1.2rem; }
      .sidebar-login-prompt .prompt-text strong { font-size: 0.85rem; color: #854d0e; display: block; }
      .sidebar-login-prompt .prompt-text p { font-size: 0.78rem; color: #a16207; margin: 2px 0 0; }
      .btn-sidebar-login { background: #16a34a; color: #ffffff; text-align: center; padding: 8px 12px; border-radius: 4px; font-weight: 700; font-size: 0.82rem; text-decoration: none; }
      .btn-sidebar-login:hover { background: #15803d; }

      /* COUPONS & OFFERS CARD */
      .coupon-card { background: #ffffff; border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 1px 4px rgba(0,0,0,0.08); padding: 18px; margin-bottom: 14px; }
      .coupon-head { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: #0f172a; margin-bottom: 12px; }
      .coupon-icon { font-size: 1.1rem; }
      
      .coupon-input-row { display: flex; gap: 8px; margin-bottom: 8px; }
      .coupon-input { flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 12px; font-size: 0.85rem; text-transform: uppercase; font-family: var(--font-mono); font-weight: 700; outline: none; }
      .coupon-input:focus { border-color: #16a34a; }
      .btn-apply-coupon { background: #16a34a; color: #ffffff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 800; font-size: 0.8rem; cursor: pointer; }
      .btn-apply-coupon:hover { background: #15803d; }
      
      .coupon-error-text { display: block; font-size: 0.75rem; color: #dc2626; margin-bottom: 8px; }
      
      .quick-coupon-chips { display: flex; flex-direction: column; gap: 6px; margin: 8px 0 12px; }
      .quick-label { font-size: 0.72rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
      .coupon-chip { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 6px 10px; font-size: 0.76rem; color: #166534; font-weight: 700; cursor: pointer; text-align: left; transition: all 0.15s; }
      .coupon-chip:hover { background: #f0fdf4; border-color: #16a34a; }

      .applied-coupon-box { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; }
      .applied-info { display: flex; flex-direction: column; }
      .applied-code { font-weight: 800; color: #166534; font-size: 0.85rem; font-family: var(--font-mono); }
      .applied-label { font-size: 0.75rem; color: #15803d; }
      .applied-amount { font-size: 0.78rem; color: #16a34a; font-weight: 700; margin-top: 2px; }
      .btn-remove-coupon { background: none; border: none; color: #dc2626; font-size: 0.76rem; font-weight: 700; cursor: pointer; }

      .view-all-offers-link { display: block; font-size: 0.78rem; font-weight: 700; color: #16a34a; text-align: center; text-decoration: none; padding-top: 8px; border-top: 1px dashed #f0f0f0; }
      .view-all-offers-link:hover { text-decoration: underline; }

      .coupon-discount-row { color: #16a34a !important; font-weight: 700; }

      .security-guarantee { display: flex; align-items: center; gap: 8px; font-size: 0.74rem; color: #878787; font-weight: 600; padding-top: 12px; border-top: 1px solid #f0f0f0; }
      .shield-icon { font-size: 1.1rem; }
    `}</style>
  </>
);
}
