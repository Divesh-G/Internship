import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatNPR } from "../utils/currency";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}/`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Order not found."));
  }, [id]);

  return (
    <div>
      <div className="page-top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>Order #{id}</h1>
      </div>
      <div className="app-content narrow">
        {error && <p className="error">{error}</p>}
        {!order && !error && <Spinner label="Loading order..." />}
        {order && (
          <>
            <div className="summary-card" style={{ marginBottom: 16 }}>
              <div className="summary-row">
                <span>Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="summary-row">
                <span>Shipping to</span>
                <span style={{ textAlign: "right" }}>
                  {order.shipping_address}, {order.shipping_city} {order.shipping_postal_code},{" "}
                  {order.shipping_country}
                </span>
              </div>
            </div>

            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size/Color</th>
                  <th>Price</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>
                      {item.size}/{item.color}
                    </td>
                    <td>{formatNPR(item.unit_price)}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="summary-row total" style={{ background: "var(--color-surface)", padding: 14, borderRadius: "var(--radius-md)" }}>
              <span>Total</span>
              <span>{formatNPR(order.total)}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
