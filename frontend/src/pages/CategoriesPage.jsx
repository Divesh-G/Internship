import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Spinner from "../components/Spinner";
import { gradientFor, iconForCategory } from "../data/mock";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => setCategories(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-top-bar">
        <h1>Categories</h1>
      </div>
      <div className="app-content">
        {loading && <Spinner label="Loading categories..." />}

        {!loading && categories.length === 0 && (
          <div className="empty-state">
            <p>No categories yet — seed the catalog or check the backend connection.</p>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="category-card-grid">
            {categories.map((c) => (
              <Link key={c.slug} to={`/products?category=${c.slug}`} className="category-card">
                <div className="category-card-art" style={{ background: gradientFor(c.slug) }}>
                  <span>{iconForCategory(c.name)}</span>
                </div>
                <span className="category-card-label">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
