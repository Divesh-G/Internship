import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatNPR } from "../utils/currency";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/")
      .then((res) => setOrders(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading orders..." />;

  return (
    <div>
      <h1>Your Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>You have no orders yet.</p>
          <Link to="/" className="btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        <table className="cart-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Status</th>
              <th>Total</th>
              <th>Placed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td>{formatNPR(o.total)}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>
                  <Link to={`/orders/${o.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
