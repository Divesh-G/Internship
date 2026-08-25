import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import Badge from "../components/Badge";
import { useToast } from "../components/Toast";

const ALL_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  esewa: "eSewa",
  khalti: "Khalti",
  imepay: "IME Pay",
};

const STATUS_STYLES = {
  pending:   { active: "bg-amber-500 text-white",   hover: "hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700" },
  paid:      { active: "bg-blue-600 text-white",    hover: "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" },
  shipped:   { active: "bg-purple-600 text-white",  hover: "hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700" },
  delivered: { active: "bg-green-600 text-white",   hover: "hover:border-green-300 hover:bg-green-50 hover:text-green-700" },
  cancelled: { active: "bg-gray-500 text-white",    hover: "hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700" },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}/`)
      .then((r) => setOrder(r.data))
      .catch(() => toast("Order not found", "error"))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  async function updateStatus(newStatus) {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status/`, { status: newStatus });
      setOrder((o) => ({ ...o, status: newStatus }));
      toast(`Order marked as ${newStatus}`, "success");
    } catch {
      toast("Status update failed", "error");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg mb-4">Order not found</p>
        <button onClick={() => navigate("/orders")} className="text-red-600 hover:underline text-sm">
          ← Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate("/orders")}
            className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1 mb-2 transition-colors"
          >
            ← Back to Orders
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{String(order.id).padStart(5, "0")}
            </h1>
            <Badge status={order.status} />
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Placed {new Date(order.created_at).toLocaleString("en-NP", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Order Items</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Item</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Variant</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Qty</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-3.5 font-semibold text-gray-900">{item.product_name}</td>
                    <td className="px-6 py-3.5 text-gray-500 text-xs">
                      {item.color} / {item.size}
                    </td>
                    <td className="px-6 py-3.5 text-center text-gray-700 font-semibold">{item.quantity}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-900">
                      Rs. {(parseFloat(item.unit_price) * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-100 bg-gray-50/50">
                <tr>
                  <td colSpan={3} className="px-6 py-3.5 font-bold text-gray-700 text-right">Total</td>
                  <td className="px-6 py-3.5 text-right font-bold text-gray-900 text-base">
                    Rs. {parseFloat(order.total).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Shipping Address</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city}, {order.shipping_postal_code}</p>
              <p className="font-semibold">{order.shipping_country}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Update Status</h3>
            <div className="space-y-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating || order.status === s}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all capitalize flex items-center justify-between ${
                    order.status === s
                      ? `${STATUS_STYLES[s].active} shadow-sm`
                      : `border border-gray-200 text-gray-500 ${STATUS_STYLES[s].hover} disabled:opacity-40`
                  }`}
                >
                  {s}
                  {order.status === s && <span className="text-xs opacity-80">✓ Current</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-gray-900">Summary</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Customer</span>
              <span className="font-semibold text-gray-900">{order.user || "—"}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Items</span>
              <span className="font-semibold text-gray-900">{order.items?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Payment</span>
              <span className="font-semibold text-gray-900">
                {PAYMENT_LABELS[order.payment_method] || order.payment_method || "—"}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-red-600 text-base">Rs. {parseFloat(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
