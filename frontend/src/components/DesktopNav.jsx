import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/categories", label: "Categories" },
  { to: "/products", label: "All Products" },
];

export default function DesktopNav() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { items: wishItems } = useWishlist();
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const wishCount = wishItems?.length ?? 0;

  return (
    <header className="desktop-nav">
      <div className="desktop-nav-inner">
        <NavLink to="/" className="desktop-nav-brand">
          Sajilo<span>Style</span>
        </NavLink>
        <nav className="desktop-nav-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="desktop-nav-actions">
          <NavLink to="/wishlist" className="desktop-nav-icon">
            ❤️
            {wishCount > 0 && <span className="bottom-nav-badge">{wishCount}</span>}
          </NavLink>
          <NavLink to="/cart" className="desktop-nav-icon">
            🛒
            {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className="desktop-nav-icon">
                👤 {user.username}
              </NavLink>
              <button className="btn-outline" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="desktop-nav-icon">
                Login
              </NavLink>
              <NavLink to="/register" className="btn-primary">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
