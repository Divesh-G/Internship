import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

const REVENUE_DATA = [
  { month: "Jan", revenue: 142000 },
  { month: "Feb", revenue: 198000 },
  { month: "Mar", revenue: 167000 },
  { month: "Apr", revenue: 243000 },
  { month: "May", revenue: 312000 },
  { month: "Jun", revenue: 289000 },
  { month: "Jul", revenue: 378000 },
  { month: "Aug", revenue: 421000 },
  { month: "Sep", revenue: 356000 },
  { month: "Oct", revenue: 489000 },
  { month: "Nov", revenue: 512000 },
  { month: "Dec", revenue: 634000 },
];

const ORDER_STATUS_DATA = [
  { name: "Delivered", value: 58, color: "#16a34a" },
  { name: "Pending",   value: 22, color: "#d97706" },
  { name: "Shipped",   value: 12, color: "#7c3aed" },
  { name: "Cancelled", value: 8,  color: "#dc2626" },
];

const CATEGORY_DATA = [
  { name: "T-Shirts", sales: 84 },
  { name: "Jackets",  sales: 62 },
  { name: "Trousers", sales: 47 },
];

const QUICK_ACTIONS = [
  { label: "Add Product", icon: "➕", to: "/products/new", color: "bg-red-600" },
  { label: "View Orders", icon: "📦", to: "/orders", color: "bg-blue-600" },
  { label: "Customers",   icon: "👥", to: "/customers", color: "bg-purple-600" },
  { label: "Settings",    icon: "⚙️",  to: "/settings", color: "bg-slate-600" },
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

  const STATS = [
    { title: "Total Revenue",    value: fmt(totalRevenue || 634000), sub: "All time", icon: "₨", color: "primary", trend: 12.4 },
    { title: "Total Orders",     value: orders.length || 1248,  sub: `${pendingOrders} pending`, icon: "📦", color: "blue",    trend: 8.1 },
    { title: "Total Products",   value: products.length || 240, sub: `${lowStock} low stock`, icon: "👕", color: "purple",  trend: 3.2 },
    { title: "Total Categories", value: categories.length || 12,sub: "Active", icon: "🗂️", color: "green", trend: 0 },
    { title: "Delivered Orders", value: deliveredOrders || 842, sub: "Successfully", icon: "✓",  color: "green",  trend: 15.6 },
    { title: "Pending Orders",   value: pendingOrders || 87,    sub: "Awaiting action", icon: "⏱", color: "amber",  trend: -2.1 },
    { title: "Low Stock Items",  value: lowStock || 14,         sub: "Need restock", icon: "⚠", color: "amber",  trend: undefined },
    { title: "Out of Stock",     value: outOfStock || 6,        sub: "Unavailable", icon: "✕",  color: "primary", trend: undefined },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`${a.color} text-white rounded-xl px-4 py-3 flex items-center gap-2.5 hover:opacity-90 transition-opacity shadow-sm`}
          >
            <span className="text-lg">{a.icon}</span>
            <span className="text-sm font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart — takes 2 cols */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly revenue in NPR</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
              ↑ 12.4% this year
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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

        {/* Order status donut */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">Order Status</h3>
          <p className="text-xs text-gray-400 mb-4">Distribution by status</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ORDER_STATUS_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                paddingAngle={3} dataKey="value">
                {ORDER_STATUS_DATA.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]}
                contentStyle={{ borderRadius: 10, border: "1px solid #f0f0f0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {ORDER_STATUS_DATA.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category sales + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category bar chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">Sales by Category</h3>
          <p className="text-xs text-gray-400 mb-4">Units sold this month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CATEGORY_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #f0f0f0", fontSize: 12 }} />
              <Bar dataKey="sales" fill="#e53935" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent orders table */}
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
