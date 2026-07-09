import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLORS = { pending: "#d97706", paid: "#3b82f6", shipped: "#7c3aed", delivered: "#16a34a", cancelled: "#dc2626" };

const QUICK_ACTIONS = [
  { label: "Add Product", icon: "➕", to: "/products/new" },
  { label: "View Orders", icon: "📦", to: "/orders" },
  { label: "Customers",   icon: "👥", to: "/customers" },
  { label: "Settings",    icon: "⚙️",  to: "/settings" },
];

function fmt(n) {
  if (n >= 100000) return `Rs. ${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `Rs. ${(n / 1000).toFixed(0)}K`;
  return `Rs. ${n}`;
}

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/products/").then((r) => setProducts(r.data.results ?? r.data)),
      api.get("/categories/").then((r) => setCategories(r.data.results ?? r.data)),
      api.get("/orders/").then((r) => setOrders(r.data.results ?? r.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalStock = products.reduce(
    (s, p) => s + (p.variants?.reduce((vs, v) => vs + v.stock, 0) ?? 0), 0
  );
  const lowStock = products.filter((p) =>
    p.variants?.some((v) => v.stock > 0 && v.stock <= 5)
  ).length;
  const outOfStock = products.filter((p) =>
    p.variants?.length > 0 && p.variants.every((v) => v.stock === 0)
  ).length;

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + parseFloat(o.total || 0), 0);

  const recentOrders = [...orders].slice(0, 6);

  // Revenue by month (current year only)
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array(12).fill(0);
  orders
    .filter((o) => o.status !== "cancelled" && new Date(o.created_at).getFullYear() === currentYear)
    .forEach((o) => {
      monthlyRevenue[new Date(o.created_at).getMonth()] += parseFloat(o.total || 0);
    });
  const revenueChartData = MONTHS.map((month, i) => ({ month, revenue: Math.round(monthlyRevenue[i]) }));

  // Order status distribution
  const statusCounts = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const orderTotal = orders.length || 1;
  const orderStatusChartData = Object.entries(statusCounts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((count / orderTotal) * 100),
    color: STATUS_COLORS[name] || "#9ca3af",
  }));

  // Products per category
  const categoryChartData = categories
    .map((c) => ({
      name: c.name.length > 9 ? c.name.slice(0, 9) + "…" : c.name,
      count: products.filter((p) => p.category?.slug === c.slug).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const STATS = [
    { title: "Total Revenue",    value: fmt(totalRevenue), sub: "All time",       icon: "₨",  color: "primary" },
    { title: "Total Orders",     value: orders.length,     sub: `${pendingOrders} pending`, icon: "📦", color: "blue" },
    { title: "Total Products",   value: products.length,   sub: `${lowStock} low stock`,    icon: "👕", color: "purple" },
    { title: "Total Categories", value: categories.length, sub: "Active",         icon: "🗂️", color: "green" },
    { title: "Delivered Orders", value: deliveredOrders,   sub: "Completed",      icon: "✓",  color: "green" },
    { title: "Pending Orders",   value: pendingOrders,     sub: "Awaiting action",icon: "⏱", color: "amber" },
    { title: "Low Stock Items",  value: lowStock,          sub: "Need restock",   icon: "⚠", color: "amber" },
    { title: "Out of Stock",     value: outOfStock,        sub: "Unavailable",    icon: "✕",  color: "primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin 👋</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
            {new Date().toLocaleDateString("en-NP", { dateStyle: "long" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl px-4 py-3 flex items-center gap-2.5 transition-all shadow-sm"
          >
            <span className="text-lg">{a.icon}</span>
            <span className="text-sm font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly revenue {currentYear} (NPR)</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
              {currentYear}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e53935" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#e53935" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip
                formatter={(v) => [`Rs. ${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #f0f0f0", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#e53935" strokeWidth={2.5}
                fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: "#e53935" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">Order Status</h3>
          <p className="text-xs text-gray-400 mb-4">Distribution by status</p>
          {orderStatusChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No orders yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={orderStatusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    paddingAngle={3} dataKey="value">
                    {orderStatusChartData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}%`, n]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #f0f0f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {orderStatusChartData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">Products by Category</h3>
          <p className="text-xs text-gray-400 mb-4">Number of products per category</p>
          {categoryChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No products yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #f0f0f0", fontSize: 12 }} />
                <Bar dataKey="count" fill="#e53935" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-red-600 font-semibold hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Order</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <Link to={`/orders/${o.id}`} className="font-mono text-xs text-red-600 hover:underline font-semibold">
                            #{String(o.id).padStart(5, "0")}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-gray-700">{o.user || "—"}</td>
                        <td className="px-6 py-3.5 font-semibold text-gray-900">
                          Rs. {parseFloat(o.total).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge status={o.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
