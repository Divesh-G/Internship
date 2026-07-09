import { useEffect, useRef, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

const INPUT = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";

function CategoryAvatar({ cat }) {
  if (cat.image) {
    return (
      <img
        src={cat.image}
        alt={cat.name}
        className="w-10 h-10 rounded-xl object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-base font-bold shrink-0">
      {cat.name[0].toUpperCase()}
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: "", imageFile: null, imagePreview: null });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  function load() {
    setLoading(true);
    api.get("/categories/")
      .then((r) => setCategories(r.data.results ?? r.data))
      .catch(() => toast("Failed to load categories", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  function openAdd() {
    setForm({ name: "", imageFile: null, imagePreview: null });
    setModal({ mode: "add" });
  }

  function openEdit(cat) {
    setForm({ name: cat.name, imageFile: null, imagePreview: cat.image || null });
    setModal({ mode: "edit", data: cat });
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({
      ...f,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }

  function clearImage() {
    setForm((f) => ({ ...f, imageFile: null, imagePreview: null }));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = modal.mode === "edit";
      const slug = modal.data?.slug;

      if (form.imageFile) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("image", form.imageFile);
        if (isEdit) {
          await api.patch(`/categories/${slug}/`, fd);
        } else {
          await api.post("/categories/", fd);
        }
      } else if (isEdit && !form.imagePreview && modal.data?.image) {
        // User cleared the image
        await api.patch(`/categories/${slug}/`, { name: form.name, image: null });
      } else {
        if (isEdit) {
          await api.patch(`/categories/${slug}/`, { name: form.name });
        } else {
          await api.post("/categories/", { name: form.name });
        }
      }

      toast(isEdit ? "Category updated" : "Category created", "success");
      setModal(null);
      load();
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || "Save failed";
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/categories/${deleteTarget.slug}/`);
      toast("Category deleted", "success");
      setDeleteTarget(null);
      load();
    } catch {
      toast("Cannot delete — category may have products", "error");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Slug</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Thumbnail</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    No categories yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((c, i) => (
                  <tr key={c.slug} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CategoryAvatar cat={c} />
                        <span className="font-semibold text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{c.slug}</td>
                    <td className="px-6 py-4">
                      {c.image ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                          ✓ Set
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit Category" : "Add Category"}
        maxW="max-w-sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              className={INPUT}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. T-Shirts"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Thumbnail Image
            </label>
            {form.imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={form.imagePreview}
                  alt="preview"
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow hover:bg-red-700 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/50 transition-all"
              >
                <p className="text-2xl mb-1">🖼️</p>
                <p className="text-xs text-gray-500">Click to upload thumbnail</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5 MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {!form.imagePreview && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                Browse file…
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : modal?.mode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        maxW="max-w-sm"
      >
        <p className="text-sm text-gray-600 mb-6">
          Delete category <strong>"{deleteTarget?.name}"</strong>?{" "}
          Products in this category will lose their category assignment.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
