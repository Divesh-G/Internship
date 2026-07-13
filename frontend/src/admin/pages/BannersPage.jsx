import { useEffect, useRef, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

const INPUT = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all bg-white";

const PRESET_GRADIENTS = [
  { label: "Festival Red",  value: "linear-gradient(120deg, #b81b28, #e22433 60%, #e2a92a)" },
  { label: "Dark Winter",   value: "linear-gradient(120deg, #1c1c1e, #2c2c30 60%, #4a4a50)" },
  { label: "Red & Black",   value: "linear-gradient(120deg, #e22433, #1c1c1e)" },
  { label: "Ocean Blue",    value: "linear-gradient(120deg, #1e3a8a, #2563eb 60%, #0ea5e9)" },
  { label: "Forest Green",  value: "linear-gradient(120deg, #14532d, #16a34a 60%, #4ade80)" },
  { label: "Royal Purple",  value: "linear-gradient(120deg, #4c1d95, #7c3aed 60%, #a855f7)" },
  { label: "Sunset Orange", value: "linear-gradient(120deg, #7c2d12, #ea580c 60%, #fbbf24)" },
];

const EMPTY_FORM = {
  title: "", subtitle: "", cta: "Shop Now",
  gradient: PRESET_GRADIENTS[0].value, emoji: "",
  order: 0, is_active: true,
  imageFile: null, imagePreview: null,
};

function BannerPreview({ banner }) {
  const hasImage = !!banner.imagePreview;
  return (
    <div
      className="w-full h-20 rounded-xl flex items-center gap-3 px-4 overflow-hidden relative"
      style={hasImage ? {} : { background: banner.gradient || "#e22433" }}
    >
      {hasImage && (
        <>
          <img
            src={banner.imagePreview}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.05) 100%)",
          }} />
        </>
      )}
      <div className="relative z-10 flex items-center gap-3 min-w-0">
        {banner.emoji && <span className="text-2xl shrink-0">{banner.emoji}</span>}
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate drop-shadow">{banner.title || "Banner Title"}</p>
          {banner.subtitle && <p className="text-white/80 text-xs truncate drop-shadow">{banner.subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [customGradient, setCustomGradient] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  function load() {
    setLoading(true);
    api.get("/banners/")
      .then((r) => setBanners(r.data.results ?? r.data))
      .catch(() => toast("Failed to load banners", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  function openAdd() {
    setForm(EMPTY_FORM);
    setCustomGradient(false);
    setModal({ mode: "add" });
  }

  function openEdit(b) {
    const isPreset = PRESET_GRADIENTS.some((p) => p.value === b.gradient);
    setCustomGradient(!isPreset);
    setForm({
      title: b.title, subtitle: b.subtitle ?? "",
      cta: b.cta ?? "Shop Now", gradient: b.gradient,
      emoji: b.emoji ?? "", order: b.order ?? 0,
      is_active: b.is_active,
      imageFile: null, imagePreview: b.image || null,
    });
    setModal({ mode: "edit", data: b });
  }

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }));
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
      const baseFields = {
        title: form.title, subtitle: form.subtitle, cta: form.cta,
        gradient: form.gradient, emoji: form.emoji,
        order: parseInt(form.order) || 0, is_active: form.is_active,
      };

      if (form.imageFile) {
        const fd = new FormData();
        Object.entries(baseFields).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", form.imageFile);
        if (isEdit) {
          await api.patch(`/banners/${modal.data.id}/`, fd);
        } else {
          await api.post("/banners/", fd);
        }
      } else if (isEdit && !form.imagePreview && modal.data?.image) {
        await api.patch(`/banners/${modal.data.id}/`, { ...baseFields, image: null });
      } else {
        if (isEdit) {
          await api.patch(`/banners/${modal.data.id}/`, baseFields);
        } else {
          await api.post("/banners/", baseFields);
        }
      }

      toast(isEdit ? "Banner updated" : "Banner created", "success");
      setModal(null);
      load();
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(b) {
    try {
      await api.patch(`/banners/${b.id}/`, { is_active: !b.is_active });
      setBanners((bs) => bs.map((x) => x.id === b.id ? { ...x, is_active: !x.is_active } : x));
    } catch {
      toast("Update failed", "error");
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/banners/${deleteTarget.id}/`);
      toast("Banner deleted", "success");
      setDeleteTarget(null);
      load();
    } catch {
      toast("Delete failed", "error");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {banners.length} banner{banners.length !== 1 ? "s" : ""} — home page hero slider
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          + Add Banner
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
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Preview</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Image</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">CTA</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Order</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    No banners yet. Add one to show on the home page.
                  </td>
                </tr>
              ) : (
                banners.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                    <td className="px-6 py-3 w-52">
                      <BannerPreview banner={{ ...b, imagePreview: b.image }} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{b.title}</p>
                      {b.subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-40">{b.subtitle}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {b.image ? (
                        <img src={b.image} alt="" className="w-14 h-9 rounded-lg object-cover border border-gray-100" />
                      ) : (
                        <span className="text-xs text-gray-400">Gradient only</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{b.cta}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">
                        {b.order}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(b)}
                        style={{
                          position: "relative", width: 40, height: 20,
                          borderRadius: 999, border: "none", padding: 0,
                          cursor: "pointer", flexShrink: 0, boxShadow: "none",
                          background: b.is_active ? "#22c55e" : "#d1d5db",
                          transition: "background 0.15s",
                        }}
                      >
                        <span style={{
                          position: "absolute", top: 2,
                          left: b.is_active ? 22 : 2,
                          width: 16, height: 16, borderRadius: "50%",
                          background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                          transition: "left 0.15s",
                        }} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteTarget(b)}
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

      {/* Add / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit Banner" : "Add Banner"}
        maxW="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <BannerPreview banner={form} />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className={INPUT}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Dashain Tihar Mahotsav"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subtitle</label>
              <input
                className={INPUT}
                value={form.subtitle}
                onChange={(e) => setField("subtitle", e.target.value)}
                placeholder="e.g. Up to 40% off on traditional wear"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Button Text</label>
              <input
                className={INPUT}
                value={form.cta}
                onChange={(e) => setField("cta", e.target.value)}
                placeholder="Shop Now"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Emoji</label>
              <input
                className={INPUT}
                value={form.emoji}
                onChange={(e) => setField("emoji", e.target.value)}
                placeholder="🪔"
                maxLength={4}
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Display Image
              <span className="text-gray-400 font-normal normal-case ml-1">— overrides gradient background</span>
            </label>
            {form.imagePreview ? (
              <div className="relative">
                <img
                  src={form.imagePreview}
                  alt="preview"
                  className="w-full h-28 rounded-xl object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow hover:bg-red-700 transition-colors"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2.5 py-1 rounded-lg hover:bg-black/80 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/40 transition-all"
              >
                <p className="text-2xl mb-1">🖼️</p>
                <p className="text-xs text-gray-500">Click to upload a banner image</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP — recommended 1200 × 440 px</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Gradient picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Background Gradient
              <span className="text-gray-400 font-normal normal-case ml-1">— used when no image is set</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_GRADIENTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  title={p.label}
                  onClick={() => { setField("gradient", p.value); setCustomGradient(false); }}
                  className="w-8 h-8 rounded-lg border-2 transition-all"
                  style={{
                    background: p.value,
                    borderColor: form.gradient === p.value && !customGradient ? "#ef4444" : "transparent",
                    boxShadow: form.gradient === p.value && !customGradient ? "0 0 0 2px #fecaca" : "none",
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => setCustomGradient(true)}
                className={`px-2 h-8 rounded-lg text-xs font-semibold border-2 transition-all ${
                  customGradient ? "border-red-400 bg-red-50 text-red-600" : "border-gray-200 text-gray-500"
                }`}
              >
                Custom
              </button>
            </div>
            {customGradient && (
              <input
                className={INPUT}
                value={form.gradient}
                onChange={(e) => setField("gradient", e.target.value)}
                placeholder="linear-gradient(120deg, #e22433, #1c1c1e)"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Order <span className="text-gray-400 font-normal normal-case">(lower = first)</span>
              </label>
              <input
                className={INPUT}
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => setField("order", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button
                type="button"
                onClick={() => setField("is_active", !form.is_active)}
                style={{
                  position: "relative", width: 44, height: 24,
                  borderRadius: 999, border: "none", padding: 0,
                  cursor: "pointer", flexShrink: 0, boxShadow: "none",
                  background: form.is_active ? "#22c55e" : "#d1d5db",
                  transition: "background 0.15s",
                }}
              >
                <span style={{
                  position: "absolute", top: 2,
                  left: form.is_active ? 22 : 2,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                  transition: "left 0.15s",
                }} />
              </button>
              <span className="text-sm font-semibold text-gray-700">
                {form.is_active ? "Active" : "Inactive"}
              </span>
            </div>
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

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Banner" maxW="max-w-sm">
        <p className="text-sm text-gray-600 mb-6">
          Delete banner <strong>"{deleteTarget?.title}"</strong>? This cannot be undone.
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
