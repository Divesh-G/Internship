import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatNPR } from "../utils/currency";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}/`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Order not found."));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!order) return <Spinner label="Loading order..." />;

  return (
    <div>
      <h1>Order #{order.id}</h1>
      <p className="order-meta">
        Status: <StatusBadge status={order.status} />
      </p>
      <p className="order-meta">
        Shipping to: {order.shipping_address}, {order.shipping_city}{" "}
        {order.shipping_postal_code}, {order.shipping_country}
      </p>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Color</th>
            <th>Price</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name}</td>
              <td>{item.size}</td>
              <td>{item.color}</td>
              <td>{formatNPR(item.unit_price)}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="total">Total: {formatNPR(order.total)}</p>
    </div>
  );
}
