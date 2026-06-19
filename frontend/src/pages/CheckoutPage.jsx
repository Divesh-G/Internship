import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import { DISTRICTS, PAYMENT_METHODS } from "../data/mock";
import { formatNPR } from "../utils/currency";

const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 100;
const COUPON_KEY = "sajilo_coupon";

export default function CheckoutPage() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    shipping_country: "Nepal",
  });
  const [payment, setPayment] = useState("cod");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  let coupon = null;
  try {
    coupon = JSON.parse(localStorage.getItem(COUPON_KEY));
  } catch {
    coupon = null;
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/orders/", { ...form, payment_method: payment });
      localStorage.removeItem(COUPON_KEY);
      await refresh();
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="app-content" style={{ paddingTop: 16 }}>
        <p className="empty-state">Your cart is empty — add items before checking out.</p>
      </div>
    );
  }

  const subtotal = Number(cart.total) || 0;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const grandTotal = Math.max(0, subtotal + shipping - discount);

  return (
    <div>
      <div className="page-top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>Checkout</h1>
      </div>
      <div className="app-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2 style={{ margin: "14px 0 10px" }}>Delivery Address</h2>
          <div className="address-form">
            <label>
              Street address / Tole
              <input value={form.shipping_address} onChange={update("shipping_address")} required />
            </label>
            <div className="form-row">
              <label>
                District
                <select value={form.shipping_city} onChange={update("shipping_city")} required>
                  <option value="" disabled>
                    Select district
                  </option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Postal code
                <input value={form.shipping_postal_code} onChange={update("shipping_postal_code")} required />
              </label>
            </div>
            <label>
              Country
              <input value={form.shipping_country} onChange={update("shipping_country")} required disabled />
            </label>
          </div>

          <h2 style={{ margin: "20px 0 10px" }}>Payment Method</h2>
          {PAYMENT_METHODS.map((m) => (
            <label key={m.id} className={`payment-option${payment === m.id ? " active" : ""}`}>
              <span className="pay-icon">{m.icon}</span>
              <span>{m.label}</span>
              <input
                type="radio"
                name="payment"
                value={m.id}
                checked={payment === m.id}
                onChange={() => setPayment(m.id)}
                style={{ width: 18, height: 18, boxShadow: "none", background: "none", padding: 0 }}
              />
            </label>
          ))}

          <h2 style={{ margin: "20px 0 10px" }}>Order Summary</h2>
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
                <span>Discount ({coupon.code})</span>
                <span>-{formatNPR(discount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatNPR(grandTotal)}</span>
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          <button className="btn-block" type="submit" disabled={submitting} style={{ marginTop: 16 }}>
            {submitting ? "Placing order..." : "Confirm Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
