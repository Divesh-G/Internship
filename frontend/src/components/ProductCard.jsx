import { Link } from "react-router-dom";
import { discountFor, ratingFor } from "../data/mock";
import { useWishlist } from "../context/WishlistContext";
import { formatNPR } from "../utils/currency";
import ProductThumb from "./ProductThumb";
import RatingStars from "./RatingStars";

export default function ProductCard({ product }) {
  const { isWishlisted, toggle } = useWishlist();
  const discount = discountFor(product.slug);
  const { rating, reviewCount } = ratingFor(product.slug);
  const original = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : null;
  const wishlisted = isWishlisted(product.slug);

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-media">
        <ProductThumb name={product.name} category={product.category} size="card" />
        {discount > 0 && <span className="badge-discount">-{discount}%</span>}
        <button
          className={`wishlist-heart${wishlisted ? " active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            toggle({ slug: product.slug, name: product.name, price: product.price, brand: product.brand });
          }}
          aria-label="Toggle wishlist"
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="brand">{product.brand}</p>
        <RatingStars rating={rating} reviewCount={reviewCount} />
        <div className="price-row">
          <span className="price">{formatNPR(product.price)}</span>
          {original && <span className="price-strike">{formatNPR(original)}</span>}
        </div>
      </div>
    </Link>
  );
}
