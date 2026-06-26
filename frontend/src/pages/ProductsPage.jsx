import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Spinner from "../components/Spinner";

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-created_at", label: "Newest First" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const categorySlug = searchParams.get("category") || "";
  const ordering = searchParams.get("ordering") || "";

  const [products, setProducts] = useState([]);
  const [variantsByProduct, setVariantsByProduct] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [searchInput, setSearchInput] = useState(search);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => setCategories(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (categorySlug) params.category__slug = categorySlug;
    if (ordering) params.ordering = ordering;
    if (brand) params.brand = brand;

    Promise.resolve()
      .then(() => setLoading(true))
      .then(() => api.get("/products/", { params }))
      .then(async (res) => {
        const list = res.data.results ?? res.data;
        setProducts(list);
        setError("");
        const details = await Promise.all(
          list.map((p) => api.get(`/products/${p.slug}/`).then((r) => r.data).catch(() => null))
        );
        const map = {};
        details.forEach((d) => {
          if (d) map[d.slug] = d.variants || [];
        });
        setVariantsByProduct(map);
      })
      .catch(() => setError("Could not load products. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [search, categorySlug, ordering, brand]);

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))], [products]);
  const colorOptions = useMemo(() => {
    const all = Object.values(variantsByProduct).flat();
    return [...new Set(all.map((v) => v.color).filter(Boolean))];
  }, [variantsByProduct]);

  const filtered = products.filter((p) => {
    const variants = variantsByProduct[p.slug] || [];
    if (sizes.length && !variants.some((v) => sizes.includes(v.size))) return false;
    if (colors.length && !variants.some((v) => colors.includes(v.color))) return false;
    return true;
  });

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  function toggleFrom(list, setList, value) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const activeFilterCount = (brand ? 1 : 0) + sizes.length + colors.length;

  return (
    <div>
      <div className="page-top-bar">
        <h1>{activeCategory ? activeCategory.name : search ? `Results for "${search}"` : "All Products"}</h1>
      </div>

      <div className="app-content">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => updateParam("search", searchInput)}
          placeholder="लुगा, ब्रान्ड वा साइज खोज्नुहोस्..."
        />

        <div className="filter-bar">
          <select
            className="chip"
            style={{ flex: 1 }}
            value={ordering}
            onChange={(e) => updateParam("ordering", e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button className="btn-outline" onClick={() => setSheetOpen(true)}>
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <Spinner label="Loading products..." />}

        {!loading && (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                <p>No products found{activeCategory ? ` in ${activeCategory.name} yet` : ""}.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {sheetOpen && (
        <div className="filter-sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="filter-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="filter-sheet-head">
              <h2>Filters</h2>
              <button className="btn-ghost" onClick={() => setSheetOpen(false)}>
                ✕
              </button>
            </div>

            <div className="filter-group">
              <h3>Brand</h3>
              <div className="chip-row">
                {brands.map((b) => (
                  <button
                    key={b}
                    className={`chip${brand === b ? " active" : ""}`}
                    onClick={() => setBrand(brand === b ? "" : b)}
                  >
                    {b}
                  </button>
                ))}
                {brands.length === 0 && <span className="order-meta">No brands loaded yet.</span>}
              </div>
            </div>

            <div className="filter-group">
              <h3>Size</h3>
              <div className="chip-row">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    className={`chip${sizes.includes(s) ? " active" : ""}`}
                    onClick={() => toggleFrom(sizes, setSizes, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Color</h3>
              <div className="chip-row">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    className={`chip${colors.includes(c) ? " active" : ""}`}
                    onClick={() => toggleFrom(colors, setColors, c)}
                  >
                    {c}
                  </button>
                ))}
                {colorOptions.length === 0 && <span className="order-meta">No colors loaded yet.</span>}
              </div>
            </div>

            <button
              className="btn-block"
              onClick={() => {
                setBrand("");
                setSizes([]);
                setColors([]);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
