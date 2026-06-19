import { Link } from "react-router-dom";
import { CATEGORY_LIST } from "../data/mock";

export default function CategoriesPage() {
  return (
    <div>
      <div className="page-top-bar">
        <h1>Categories</h1>
      </div>
      <div className="app-content">
        <div className="section">
          <div className="category-grid">
            {CATEGORY_LIST.map((c) => (
              <Link key={c.slug} to={`/products?category=${c.slug}`} className="category-tile">
                <span className="icon-circle">{c.icon}</span>
                <span className="label">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
