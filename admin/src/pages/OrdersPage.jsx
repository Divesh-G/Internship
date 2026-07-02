import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Badge from "../components/Badge";
import { useToast } from "../components/Toast";

const STATUS_TABS = ["all", "pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const toast = useToast();
  const PER_PAGE = 12;

  function load() {
    setLoading(true);
    api.get("/orders/")
      .then((r) => setOrders(r.data.results ?? r.data))
      .catch(() => toast("Failed to load orders", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "all" || o.status === activeTab;
    const matchSearch = !search || String(o.id).includes(search);
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === "all" ? orders.length : orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize flex items-center gap-1.5 ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === tab ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-500"
            }`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="relative max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by order ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Order ID</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Delivery</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    paged.map((o) => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-gray-900">
                            #{String(o.id).padStart(5, "0")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{o.user || "—"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-48 truncate text-xs">
                          {o.shipping_city || o.shipping_address?.slice(0, 30) || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-gray-900">
                            Rs. {parseFloat(o.total).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={o.status} />
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(o.created_at).toLocaleDateString("en-NP", { dateStyle: "medium" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/orders/${o.id}`}
                            className="text-xs bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                <p className="text-sm text-gray-400">
                  {filtered.length} orders
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    ←
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
