import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useToast } from "../components/Toast";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const INPUT = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all bg-white";

export default function ProductFormPage() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "", description: "", brand: "", price: "",
    category: "", is_active: true,
  });
  const [variants, setVariants] = useState([
    { sku: "", size: "M", color: "Black", stock: 0, price_override: "" },
  ]);

  useEffect(() => {
    api.get("/categories/").then((r) => setCategories(r.data.results ?? r.data));
    if (isEdit) {
      api.get(`/products/${slug}/`)
        .then((r) => {
          const p = r.data;
          setForm({
            name: p.name, description: p.description, brand: p.brand,
            price: p.price, category: p.category?.id ?? "",
            is_active: p.is_active,
          });
          if (p.variants?.length) {
            setVariants(p.variants.map((v) => ({
              id: v.id, sku: v.sku, size: v.size, color: v.color,
              stock: v.stock, price_override: v.price_override ?? "",
            })));
          }
          if (p.images?.length) setImages(p.images);
        })
        .catch(() => toast("Product not found", "error"))
        .finally(() => setLoading(false));
    }
  }, [slug]); // eslint-disable-line

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function addVariant() {
    setVariants((vs) => [
      ...vs,
      { sku: `${form.name.slice(0, 3).toUpperCase()}-${Date.now()}`, size: "M", color: "Black", stock: 0, price_override: "" },
    ]);
  }

  function removeVariant(i) {
    setVariants((vs) => vs.filter((_, j) => j !== i));
  }

  function setVariantField(i, k, v) {
    setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length || !slug) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await api.post(`/products/${slug}/images/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setImages((imgs) => [...imgs, res.data]);
      }
      toast(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`, "success");
    } catch {
      toast("Image upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleImageDelete(imgId) {
    try {
      await api.delete(`/products/${slug}/images/${imgId}/`);
      setImages((imgs) => imgs.filter((i) => i.id !== imgId));
      toast("Image removed", "success");
    } catch {
      toast("Could not remove image", "error");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        brand: form.brand,
        price: parseFloat(form.price),
        is_active: form.is_active,
        category_id: parseInt(form.category),
        variants_write: variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: parseInt(v.stock),
          price_override: v.price_override !== "" ? parseFloat(v.price_override) : null,
        })),
      };

      if (isEdit) {
        await api.patch(`/products/${slug}/`, payload);
        toast("Product updated", "success");
        navigate("/products");
      } else {
        const res = await api.post("/products/", payload);
        toast("Product created — add images below", "success");
        navigate(`/products/${res.data.slug}/edit`);
      }
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : "Save failed";
      toast(msg.slice(0, 80), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1 mb-2 transition-colors"
          >
            ← Back to Products
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wide">Basic Information</h3>
            <Field label="Product Name" required>
              <input
                className={INPUT}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Classic Cotton Tee"
                required
              />
            </Field>
            <Field label="Description">
              <textarea
                className={`${INPUT} h-32 resize-none`}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe the product material, fit, occasion..."
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand">
                <input
                  className={INPUT}
                  value={form.brand}
                  onChange={(e) => setField("brand", e.target.value)}
                  placeholder="Brand name"
                />
              </Field>
              <Field label="Price (NPR)" required>
                <input
                  className={INPUT}
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wide">
                Variants ({variants.length})
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors border border-red-200"
              >
                + Add Variant
              </button>
            </div>

            {variants.map((v, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Variant {i + 1}</span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">SKU</label>
                    <input
                      className={`${INPUT} text-xs`}
                      value={v.sku}
                      onChange={(e) => setVariantField(i, "sku", e.target.value)}
                      placeholder="SKU-001"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">Size</label>
                    <select
                      className={`${INPUT} text-xs`}
                      value={v.size}
                      onChange={(e) => setVariantField(i, "size", e.target.value)}
                    >
                      {SIZES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">Color</label>
                    <input
                      className={`${INPUT} text-xs`}
                      value={v.color}
                      onChange={(e) => setVariantField(i, "color", e.target.value)}
                      placeholder="Black"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">Stock</label>
                    <input
                      className={`${INPUT} text-xs`}
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => setVariantField(i, "stock", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wide">Organization</h3>
            <Field label="Category" required>
              <select
                className={INPUT}
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">Active</p>
                <p className="text-xs text-gray-400">Visible on store</p>
              </div>
              <button
                type="button"
                onClick={() => setField("is_active", !form.is_active)}
                className="w-11 h-6 rounded-full transition-all relative"
                style={{ background: form.is_active ? "#22c55e" : "#d1d5db" }}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.is_active ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">💡 Stock Tip</p>
            <p className="text-xs text-amber-600">
              Add at least one variant with stock &gt; 0 for the product to appear as available in the store.
            </p>
          </div>
        </div>
      </div>

      {/* Images — only shown when editing an existing product */}
      {isEdit && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wide">
              Product Images ({images.length})
            </h3>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "+ Add Images"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {images.length === 0 ? (
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-10 text-gray-400 cursor-pointer hover:border-red-300 hover:text-red-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="text-sm font-medium">Click to upload images</p>
              <p className="text-xs mt-1">PNG, JPG, WEBP supported</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img
                    src={img.image}
                    alt={img.alt_text || "Product image"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold rounded-xl"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
              <div
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 cursor-pointer hover:border-red-300 hover:text-red-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-2xl leading-none">+</span>
                <span className="text-[10px] mt-1">Add</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!isEdit && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-blue-700 mb-1">📷 Images</p>
          <p className="text-xs text-blue-600">Save the product first, then you can upload images on the edit page.</p>
        </div>
      )}
    </form>
  );
}
