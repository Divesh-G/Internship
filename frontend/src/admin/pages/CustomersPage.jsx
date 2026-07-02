import { useEffect, useState } from "react";
import api from "../api";
import { useToast } from "../components/Toast";

function Avatar({ name }) {
  const colors = ["bg-red-500", "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-amber-500"];
  const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div className={`${colors[idx]} w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export default function CustomersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const toast = useToast();
  const PER_PAGE = 12;

  useEffect(() => {
    api.get("/orders/")
      .then((r) => setOrders(r.data.results ?? r.data))
      .catch(() => toast("Failed to load", "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const customerMap = {};
  orders.forEach((o) => {
    const u = o.user || "Unknown";
    if (!customerMap[u]) {
      customerMap[u] = { name: u, orders: 0, spent: 0, lastOrder: o.created_at };
    }
    customerMap[u].orders += 1;
    customerMap[u].spent += parseFloat(o.total || 0);
    if (new Date(o.created_at) > new Date(customerMap[u].lastOrder)) {
      customerMap[u].lastOrder = o.created_at;
    }
  });
  const customers = Object.values(customerMap).sort((a, b) => b.spent - a.spent);

  const filtered = customers.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} unique customers</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="relative max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
          />
        </div>
      </div>

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
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</th>
                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Orders</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Spent</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Last Order</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400">
                        {customers.length === 0 ? "No orders placed yet" : "No customers match your search"}
                      </td>
                    </tr>
                  ) : (
                    paged.map((c) => {
                      const tier = c.spent >= 50000 ? "Gold" : c.spent >= 20000 ? "Silver" : "Standard";
                      const tierColors = {
                        Gold: "bg-amber-100 text-amber-700",
                        Silver: "bg-gray-100 text-gray-600",
                        Standard: "bg-blue-50 text-blue-600",
                      };
                      return (
                        <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={c.name} />
                              <p className="font-semibold text-gray-900">{c.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-gray-900">{c.orders}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900">
                            Rs. {c.spent.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-xs">
                            {new Date(c.lastOrder).toLocaleDateString("en-NP", { dateStyle: "medium" })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${tierColors[tier]}`}>
                              {tier === "Gold" && "⭐ "}{tier}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                <p className="text-sm text-gray-400">{filtered.length} customers</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    ←
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
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
