import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import ProductThumb from "../components/ProductThumb";
import RatingStars from "../components/RatingStars";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { discountFor, ratingFor, reviewsFor } from "../data/mock";
import { formatNPR } from "../utils/currency";

const GALLERY_SLOTS = 4;

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/products/${slug}/`)
      .then((res) => {
        setProduct(res.data);
        const firstAvailable = res.data.variants?.find((v) => v.stock > 0) || res.data.variants?.[0];
        if (firstAvailable) {
          setSize(firstAvailable.size);
          setColor(firstAvailable.color);
        }
      })
      .catch(() => setError("Product not found."));
  }, [slug]);

  const sizes = useMemo(() => [...new Set(product?.variants?.map((v) => v.size) ?? [])], [product]);
  const colorsForSize = useMemo(
    () => [...new Set(product?.variants?.filter((v) => v.size === size).map((v) => v.color) ?? [])],
    [product, size]
  );

  const selectedVariant = product?.variants?.find((v) => v.size === size && v.color === color);

  if (error && !product) return <p className="error">{error}</p>;
  if (!product) return <Spinner label="Loading product..." />;

  const { rating, reviewCount } = ratingFor(product.slug);
  const discount = discountFor(product.slug);
  const original = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : null;
  const reviews = reviewsFor(product.slug);
  const wishlisted = isWishlisted(product.slug);

  async function handleAddToCart(thenNavigateToCheckout = false) {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!selectedVariant) {
      setError("Please select a size and color.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await addItem(selectedVariant.id, Number(quantity));
      if (thenNavigateToCheckout) {
        navigate("/checkout");
      } else {
        setMessage("Added to cart.");
      }
    } catch {
      setError("Could not add to cart.");
    }
  }

  return (
    <div>
      <div className="page-top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>{product.name}</h1>
        <button
          className="top-bar-icon-btn"
          style={{ marginLeft: "auto", background: "var(--color-bg)", color: "inherit" }}
          onClick={() => toggle({ slug: product.slug, name: product.name, price: product.price, brand: product.brand })}
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="app-content">
        <div className="product-detail-layout">
          <div className="detail-gallery-col">
            <div className="gallery-main" onClick={() => setZoomed((z) => !z)}>
              <ProductThumb
                name={product.name + activeImage}
                category={product.category?.name}
                size="gallery"
                style={zoomed ? { transform: "scale(1.15)", transition: "transform 0.25s ease" } : undefined}
              />
            </div>
            <div className="gallery-thumbs">
              {Array.from({ length: GALLERY_SLOTS }, (_, i) => (
                <div
                  key={i}
                  className={`product-thumb-mini${i === activeImage ? " active" : ""}`}
                  style={{ display: "flex" }}
                  onClick={() => setActiveImage(i)}
                >
                  <ProductThumb name={product.name + i} category={product.category?.name} size="mini" />
                </div>
              ))}
            </div>
          </div>

          <div className="product-detail-info">
          <p className="brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <RatingStars rating={rating} reviewCount={reviewCount} />

          <div className="price-row">
            <span className="price">{formatNPR(product.price)}</span>
            {original && (
              <>
                <span className="price-strike">{formatNPR(original)}</span>
                <span className="discount-tag">-{discount}%</span>
              </>
            )}
          </div>

          <div className="delivery-estimate">
            🚚 Usually delivers in 2–4 days within Kathmandu Valley, 4–7 days elsewhere in Nepal.
          </div>

          {sizes.length > 0 ? (
            <>
              <div className="option-group">
                <h3>Size</h3>
                <div className="option-pills">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      className={`pill-option${size === s ? " active" : ""}`}
                      onClick={() => {
                        setSize(s);
                        const firstColor = product.variants.find((v) => v.size === s)?.color;
                        if (firstColor) setColor(firstColor);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <h3>Color</h3>
                <div className="option-pills">
                  {colorsForSize.map((c) => (
                    <button
                      key={c}
                      className={`pill-option${color === c ? " active" : ""}`}
                      onClick={() => setColor(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <h3>Quantity</h3>
                <div className="qty-stepper">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)}>+</button>
                </div>
                {selectedVariant && (
                  <p className="order-meta">
                    {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="order-meta">No variants available for this product yet.</p>
          )}

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          </div>
        </div>

        <h3 style={{ marginTop: 18, marginBottom: 6 }}>Description</h3>
        <p className="description">{product.description}</p>

        <h3 style={{ marginTop: 18, marginBottom: 10 }}>
          Customer Reviews <span className="order-meta">({reviewCount})</span>
        </h3>
        {reviews.map((r) => (
          <div className="review-card" key={r.id}>
            <div className="review-head">
              <strong style={{ fontSize: 13 }}>{r.name}</strong>
              <RatingStars rating={r.rating} />
            </div>
            <p>{r.text}</p>
          </div>
        ))}
      </div>

      <div className="sticky-action-bar">
        <button className="btn-secondary" onClick={() => handleAddToCart(false)} disabled={!selectedVariant || selectedVariant.stock === 0}>
          Add to Cart
        </button>
        <button onClick={() => handleAddToCart(true)} disabled={!selectedVariant || selectedVariant.stock === 0}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
