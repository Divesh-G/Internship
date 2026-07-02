import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

function ProductThumbPlaceholder({ name }) {
  const colors = ["#e53935", "#1976d2", "#388e3c", "#7b1fa2", "#f57c00", "#00838f"];
  const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div
      className="w-10 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
      style={{ background: colors[idx] }}
    >
      {name?.[0]?.toUpperCase() ?? "P"}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const PER_PAGE = 10;

  function load() {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (categoryFilter) params.category__slug = categoryFilter;
    Promise.all([
      api.get("/products/", { params }),
      api.get("/categories/"),
    ])
      .then(([pr, cr]) => {
        setProducts(pr.data.results ?? pr.data);
        setCategories(cr.data.results ?? cr.data);
      })
      .catch(() => toast("Failed to load products", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, categoryFilter]); // eslint-disable-line

  async function deleteProduct(slug) {
    try {
      await api.delete(`/products/${slug}/`);
      toast("Product deleted", "success");
      setDeleteTarget(null);
      load();
    } catch {
      toast("Delete failed", "error");
    }
  }

  async function bulkDelete() {
    try {
      await Promise.all(selected.map((s) => api.delete(`/products/${s}/`)));
      toast(`${selected.length} products deleted`, "success");
      setSelected([]);
      load();
    } catch {
      toast("Bulk delete failed", "error");
    }
  }

  const filtered = products;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSelect(slug) {
    setSelected((s) => s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]);
  }

  function toggleAll() {
    const pageIds = paged.map((p) => p.slug);
    const allSelected = pageIds.every((id) => selected.includes(id));
    if (allSelected) setSelected((s) => s.filter((id) => !pageIds.includes(id)));
    else setSelected((s) => [...new Set([...s, ...pageIds])]);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products total</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <span>+</span> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        {selected.length > 0 && (
          <button
            onClick={bulkDelete}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors border border-red-200"
          >
            🗑 Delete ({selected.length})
          </button>
        )}
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
                    <th className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={paged.length > 0 && paged.every((p) => selected.includes(p.slug))}
                        onChange={toggleAll}
                        className="rounded accent-red-600"
                      />
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Brand</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    paged.map((p) => {
                      const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
                      const stockStatus = totalStock === 0 ? "out" : totalStock <= 5 ? "low" : "active";
                      return (
                        <tr key={p.slug} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={selected.includes(p.slug)}
                              onChange={() => toggleSelect(p.slug)}
                              className="rounded accent-red-600"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <ProductThumbPlaceholder name={p.name} />
                              <div>
                                <p className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-gray-600">{p.category?.name ?? "—"}</td>
                          <td className="px-4 py-3.5 text-gray-600">{p.brand || "—"}</td>
                          <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                            Rs. {parseFloat(p.price).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <Badge
                                status={stockStatus}
                                label={
                                  stockStatus === "out" ? "Out of stock"
                                  : stockStatus === "low" ? `Low (${totalStock})`
                                  : `${totalStock} units`
                                }
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge status={p.is_active ? "active" : "inactive"} />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/products/${p.slug}/edit`)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-base"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors text-base"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                <p className="text-sm text-gray-400">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span key={`e${p}`} className="px-1 text-gray-300">…</span>
                        )}
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            page === p
                              ? "bg-red-600 text-white font-semibold"
                              : "border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      </>
                    ))}
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

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        maxW="max-w-sm"
      >
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteProduct(deleteTarget?.slug)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
