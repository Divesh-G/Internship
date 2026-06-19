import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductThumb from "../components/ProductThumb";
import Spinner from "../components/Spinner";
import { useCart } from "../context/CartContext";
import { COUPONS } from "../data/mock";
import { formatNPR } from "../utils/currency";

const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 100;
const COUPON_KEY = "sajilo_coupon";

export default function CartPage() {
  const { cart, updateItem, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(COUPON_KEY));
    } catch {
      return null;
    }
  });
  const [couponError, setCouponError] = useState("");

  if (!cart) return <Spinner label="Loading cart..." />;

  const subtotal = Number(cart.total) || 0;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const grandTotal = Math.max(0, subtotal + shipping - discount);

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const percent = COUPONS[code];
    if (!percent) {
      setCouponError("Invalid or expired coupon code.");
      return;
    }
    const next = { code, percent };
    setCoupon(next);
    localStorage.setItem(COUPON_KEY, JSON.stringify(next));
    setCouponError("");
  }

  function removeCoupon() {
    setCoupon(null);
    localStorage.removeItem(COUPON_KEY);
  }

  return (
    <div>
      <div className="page-top-bar">
        <h1>My Cart</h1>
      </div>
      <div className="app-content">
        {cart.items.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link to="/" className="btn-primary">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {cart.items.map((item) => (
              <div className="cart-item-card" key={item.id}>
                <ProductThumb name={item.product_name} size="mini" />
                <div className="cart-item-info">
                  <h3>{item.product_name}</h3>
                  <p className="meta">
                    Size: {item.size} · Color: {item.color}
                  </p>
                  <div className="cart-item-row">
                    <span className="price">{formatNPR(item.unit_price)}</span>
                    <div className="qty-stepper">
                      <button
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                </div>
                <button className="btn-text" onClick={() => removeItem(item.id)} style={{ alignSelf: "flex-start" }}>
                  ✕
                </button>
              </div>
            ))}

            <div className="coupon-row">
              <input
                placeholder="Enter coupon code (e.g. NAYA10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button onClick={applyCoupon}>Apply</button>
            </div>
            {couponError && <p className="error">{couponError}</p>}
            {coupon && (
              <p className="success">
                "{coupon.code}" applied — {coupon.percent}% off.{" "}
                <button className="btn-text" onClick={removeCoupon}>
                  Remove
                </button>
              </p>
            )}

            <div className="summary-card">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatNPR(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatNPR(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row">
                  <span>Discount</span>
                  <span>-{formatNPR(discount)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatNPR(grandTotal)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-outline" onClick={clear}>
                Clear cart
              </button>
              <button className="btn-block" onClick={() => navigate("/checkout")}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
