import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatNPR } from "../utils/currency";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/orders/")
      .then((res) => setOrders(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-top-bar">
        <h1>Your Orders</h1>
      </div>
      <div className="app-content narrow">
        {loading && <Spinner label="Loading orders..." />}
        {!loading && orders.length === 0 && (
          <div className="empty-state">
            <p>You have no orders yet.</p>
            <Link to="/" className="btn-primary">
              Browse products
            </Link>
          </div>
        )}
        {!loading &&
          orders.map((o) => (
            <div className="order-card" key={o.id} onClick={() => navigate(`/orders/${o.id}`)}>
              <div className="order-card-head">
                <strong>Order #{o.id}</strong>
                <StatusBadge status={o.status} />
              </div>
              <p className="order-meta">{new Date(o.created_at).toLocaleString()}</p>
              <p className="price" style={{ marginTop: 6 }}>
                {formatNPR(o.total)}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
