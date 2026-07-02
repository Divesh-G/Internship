import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login/", form);
      localStorage.setItem("admin_token", res.data.access);
      localStorage.setItem("admin_refresh", res.data.refresh);
      navigate("/");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-120 shrink-0 p-12 bg-linear-to-br from-red-600 to-red-800">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="text-white font-bold text-xl">SajiloStyle Admin</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your<br />fashion store<br />effortlessly.
          </h1>
          <p className="text-red-200 text-base leading-relaxed">
            Complete admin control over products, orders, customers, and analytics — all in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Products", value: "240+" },
            { label: "Orders Today", value: "18" },
            { label: "Revenue (Month)", value: "Rs. 2.4L" },
            { label: "Active Customers", value: "1,200" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-red-200 text-xs mb-1">{s.label}</p>
              <p className="text-white font-bold text-xl">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-10 shadow-2xl">
            <div className="mb-8 text-center">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-red-900/40">
                S
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <span className="text-red-400 text-sm">⚠</span>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              Access restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
