import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import ProductThumb from "../components/ProductThumb";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatNPR } from "../utils/currency";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/products/${slug}/`)
      .then((res) => {
        setProduct(res.data);
        if (res.data.variants?.length) setVariantId(String(res.data.variants[0].id));
      })
      .catch(() => setError("Product not found."));
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      navigate("/login");
      return;
    }
    setError("");
    setMessage("");
    try {
      await addItem(Number(variantId), Number(quantity));
      setMessage("Added to cart.");
    } catch {
      setError("Could not add to cart.");
    }
  }

  if (error && !product) return <p className="error">{error}</p>;
  if (!product) return <Spinner label="Loading product..." />;

  return (
    <div className="product-detail">
      <ProductThumb name={product.name} size="large" />
      <div className="product-detail-info">
        <h1>{product.name}</h1>
        <p className="brand">{product.brand}</p>
        <p className="price">{formatNPR(product.price)}</p>
        <p className="description">{product.description}</p>

        {product.variants?.length > 0 ? (
          <div className="variant-form">
            <label>
              Size / Color
              <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stock === 0}>
                    {v.size} / {v.color} {v.stock === 0 ? "(out of stock)" : `(${v.stock} in stock)`}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <button className="btn-primary" onClick={handleAddToCart}>
              Add to cart
            </button>
          </div>
        ) : (
          <p>No variants available for this product yet.</p>
        )}

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
