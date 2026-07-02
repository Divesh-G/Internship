import { useState } from "react";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

const INITIAL_COUPONS = [
  { code: "WELCOME10", type: "percentage", value: 10, minPurchase: 500, uses: 45, limit: 100, expires: "2025-12-31", active: true },
  { code: "FLAT200",   type: "fixed",      value: 200, minPurchase: 1500, uses: 12, limit: 50, expires: "2025-11-30", active: true },
  { code: "FREESHIP",  type: "shipping",   value: 0,  minPurchase: 999,  uses: 88, limit: 200, expires: "2025-10-31", active: false },
  { code: "DASHAIN25", type: "percentage", value: 25, minPurchase: 2000, uses: 0,  limit: 500, expires: "2025-10-15", active: true },
];

const INPUT = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";

function typeLabel(t) {
  if (t === "percentage") return "% Off";
  if (t === "fixed") return "Rs. Off";
  return "Free Ship";
}

function typeColor(t) {
  if (t === "percentage") return "bg-purple-100 text-purple-700";
  if (t === "fixed") return "bg-blue-100 text-blue-700";
  return "bg-green-100 text-green-700";
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [modal, setModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ code: "", type: "percentage", value: "", minPurchase: "", limit: "", expires: "", active: true });
  const toast = useToast();

  function openAdd() {
    setForm({ code: "", type: "percentage", value: "", minPurchase: "", limit: "", expires: "", active: true });
    setModal(true);
  }

  function handleCreate(e) {
    e.preventDefault();
    if (coupons.find((c) => c.code === form.code.toUpperCase())) {
      toast("Coupon code already exists", "error");
      return;
    }
    setCoupons((cs) => [{
      ...form,
      code: form.code.toUpperCase(),
      uses: 0,
      value: parseFloat(form.value),
      minPurchase: parseFloat(form.minPurchase) || 0,
      limit: parseInt(form.limit) || 999,
    }, ...cs]);
    toast("Coupon created", "success");
    setModal(false);
  }

  function toggleActive(code) {
    setCoupons((cs) => cs.map((c) => c.code === code ? { ...c, active: !c.active } : c));
  }

  function handleDelete() {
    setCoupons((cs) => cs.filter((c) => c.code !== deleteTarget.code));
    toast("Coupon deleted", "success");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} coupons</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          + Create Coupon
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Code</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Discount</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Min. Order</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Usage</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Expires</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                  <td className="px-6 py-4">
                    <code className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-800 tracking-wider">
                      {c.code}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor(c.type)}`}>
                      {typeLabel(c.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {c.type === "percentage" ? `${c.value}%` : c.type === "fixed" ? `Rs. ${c.value}` : "Free"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.minPurchase > 0 ? `Rs. ${c.minPurchase}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-20">
                        <div
                          className="bg-red-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (c.uses / c.limit) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{c.uses}/{c.limit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{c.expires}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(c.code)}
                      className={`w-10 h-5.5 rounded-full transition-colors relative ${c.active ? "bg-red-600" : "bg-gray-200"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${c.active ? "translate-x-5" : "translate-x-0.5"}`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-auto"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Coupon Code *</label>
              <input className={INPUT} value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type *</label>
              <select className={INPUT} value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
                <option value="shipping">Free Shipping</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {form.type !== "shipping" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Discount {form.type === "percentage" ? "(%)" : "(Rs.)"}
                </label>
                <input className={INPUT} type="number" step="0.01" min="0" value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })} required />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Min. Purchase (Rs.)</label>
              <input className={INPUT} type="number" min="0" value={form.minPurchase}
                onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Usage Limit</label>
              <input className={INPUT} type="number" min="1" value={form.limit}
                onChange={(e) => setForm({ ...form, limit: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expiry Date</label>
              <input className={INPUT} type="date" value={form.expires}
                onChange={(e) => setForm({ ...form, expires: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Create Coupon
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Coupon" maxW="max-w-sm">
        <p className="text-sm text-gray-600 mb-6">
          Delete coupon <code className="bg-gray-100 px-1.5 py-0.5 rounded font-bold">{deleteTarget?.code}</code>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
