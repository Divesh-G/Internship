import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import { formatNPR } from "../utils/currency";

export default function CheckoutPage() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shipping_address: "",
    shipping_city: "",
    shipping_postal_code: "",
    shipping_country: "Nepal",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/orders/", form);
      await refresh();
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart || cart.items.length === 0) {
    return <p>Your cart is empty — add items before checking out.</p>;
  }

  return (
    <div className="form-page form-card">
      <h1>Checkout</h1>
      <p className="total">Order total: {formatNPR(cart.total)}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Shipping address
          <input value={form.shipping_address} onChange={update("shipping_address")} required />
        </label>
        <label>
          City
          <input value={form.shipping_city} onChange={update("shipping_city")} required />
        </label>
        <label>
          Postal code
          <input value={form.shipping_postal_code} onChange={update("shipping_postal_code")} required />
        </label>
        <label>
          Country
          <input value={form.shipping_country} onChange={update("shipping_country")} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </form>
    </div>
  );
}
