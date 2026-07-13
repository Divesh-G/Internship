import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import { useWishlist } from "../context/WishlistContext";

export default function WishlistPage() {
  const { items } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    api.get("/products/")
      .then((res) => {
        const all = res.data.results ?? res.data;
        const slugSet = new Set(items.map((i) => i.slug));
        setProducts(all.filter((p) => slugSet.has(p.slug)));
      })
      .finally(() => setLoading(false));
  }, [items.length]); // eslint-disable-line

  return (
    <div>
      <div className="page-top-bar">
        <h1>Wishlist</h1>
      </div>
      <div className="app-content">
        {loading && <Spinner label="Loading wishlist..." />}

        {!loading && items.length === 0 && (
          <div className="empty-state">
            <p>Your wishlist is empty. Tap the heart on any product to save it here.</p>
            <Link to="/" className="btn-primary">
              Browse products
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
