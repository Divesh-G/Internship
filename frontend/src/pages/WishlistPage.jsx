import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div>
      <div className="page-top-bar">
        <h1>Wishlist</h1>
      </div>
      <div className="app-content">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Your wishlist is empty. Tap the heart on any product to save it here.</p>
            <Link to="/" className="btn-primary">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
