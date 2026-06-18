import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useCart } from "../context/CartContext";
import { formatNPR } from "../utils/currency";

export default function CartPage() {
  const { cart, updateItem, removeItem, clear } = useCart();
  const navigate = useNavigate();

  if (!cart) return <Spinner label="Loading cart..." />;

  return (
    <div>
      <h1>Your Cart</h1>
      {cart.items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th>Price</th>
                <th>Qty</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.size}</td>
                  <td>{item.color}</td>
                  <td>{formatNPR(item.unit_price)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <button className="btn-text" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="total">Total: {formatNPR(cart.total)}</p>
          <div className="cart-actions">
            <button className="btn-secondary" onClick={clear}>
              Clear cart
            </button>
            <button className="btn-primary" onClick={() => navigate("/checkout")}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
