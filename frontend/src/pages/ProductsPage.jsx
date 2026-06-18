import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductThumb from "../components/ProductThumb";
import Spinner from "../components/Spinner";
import { formatNPR } from "../utils/currency";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => setCategories(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category__slug = category;
    api
      .get("/products/", { params })
      .then((res) => {
        setProducts(res.data.results ?? res.data);
        setError("");
      })
      .catch(() => setError("Could not load products. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div>
      <div className="page-hero">
        <h1>Shop the collection</h1>
        <p>Everyday clothing, priced in NPR.</p>
      </div>

      <div className="filters">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <Spinner label="Loading products..." />}

      {!loading && (
        <div className="product-grid">
          {products.map((p) => (
            <Link to={`/products/${p.slug}`} key={p.id} className="product-card">
              <ProductThumb name={p.name} />
              <div className="product-card-body">
                <h3>{p.name}</h3>
                <p className="brand">{p.brand}</p>
                <p className="price">{formatNPR(p.price)}</p>
              </div>
            </Link>
          ))}
          {products.length === 0 && (
            <div className="empty-state">
              <p>No products found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
