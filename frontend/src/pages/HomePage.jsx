import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import BannerSlider from "../components/BannerSlider";
import CountdownTimer from "../components/CountdownTimer";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getFlashSaleEnd, iconForCategory } from "../data/mock";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const flashSaleEnd = useMemo(() => getFlashSaleEnd(), []);
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  useEffect(() => {
    api
      .get("/products/")
      .then((res) => setProducts(res.data.results ?? res.data))
      .finally(() => setLoading(false));
    api
      .get("/categories/")
      .then((res) => setCategories(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  function runSearch() {
    navigate(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  }

  const flashSale = products.slice(0, Math.min(6, products.length));
  const trending = [...products].reverse().slice(0, 6);
  const newArrivals = products.slice(0, 6);
  const recommended = [...products].sort((a, b) => a.brand.localeCompare(b.brand)).slice(0, 6);

  return (
    <div>
      <div className="top-bar">
        <span className="brand">
          Sajilo<span>Style</span>
        </span>
        <SearchBar value={search} onChange={setSearch} onSubmit={runSearch} />
        <button className="top-bar-icon-btn" onClick={() => navigate("/cart")} aria-label="Cart">
          🛒
          {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
        </button>
      </div>

      <div className="app-content">
        <BannerSlider />

        {categories.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2>Shop by Category</h2>
            </div>
            <div className="category-grid">
              {categories.map((c) => (
                <Link key={c.slug} to={`/products?category=${c.slug}`} className="category-tile">
                  <span className="icon-circle">{iconForCategory(c.name)}</span>
                  <span className="label">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {loading && <Spinner label="Loading products..." />}

        {!loading && products.length === 0 && (
          <div className="empty-state">
            <p>No products yet — seed the catalog or check the backend connection.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="section">
              <div className="flash-sale">
                <div className="flash-sale-head">
                  <h2>⚡ Flash Sale</h2>
                  <CountdownTimer endsAt={flashSaleEnd} />
                </div>
                <div className="h-scroll">
                  {flashSale.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-head">
                <h2>Trending Now</h2>
                <Link to="/products" className="see-all">
                  See all
                </Link>
              </div>
              <div className="h-scroll">
                {trending.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>

            <div className="section">
              <div className="section-head">
                <h2>New Arrivals</h2>
                <Link to="/products?ordering=-created_at" className="see-all">
                  See all
                </Link>
              </div>
              <div className="product-grid">
                {newArrivals.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>

            <div className="section">
              <div className="section-head">
                <h2>{user ? `Recommended for ${user.username}` : "Recommended for You"}</h2>
              </div>
              <div className="product-grid">
                {recommended.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
