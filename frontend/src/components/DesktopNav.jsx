import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/categories", label: "Categories" },
  { to: "/products", label: "All Products" },
  { to: "/products?ordering=-created_at", label: "New Arrivals" },
];

export default function DesktopNav() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { items: wishItems } = useWishlist();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const wishCount = wishItems?.length ?? 0;

  function handleSearch(e) {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
  }

  return (
    <header className="desktop-nav">
      <div className="desktop-nav-top-strip">
        <span>🚚 Free Delivery all over Nepal on orders above Rs. 1,999</span>
        <div className="desktop-nav-strip-links">
          <a href="#">Track Order</a>
          <a href="#">Help &amp; Support</a>
          <a href="#">Sell on SajiloStyle</a>
        </div>
      </div>

      <div className="desktop-nav-inner">
        <NavLink to="/" className="desktop-nav-brand">
          Sajilo<span>Style</span>
        </NavLink>

        <nav className="desktop-nav-links">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form className="desktop-nav-search" onSubmit={handleSearch}>
          <span className="desktop-nav-search-icon">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clothes, brands, sizes…"
          />
        </form>

        <div className="desktop-nav-actions">
          <NavLink to="/wishlist" className="desktop-nav-icon">
            <span className="nav-icon-symbol">❤️</span>
            <span>Wishlist</span>
            {wishCount > 0 && <span className="nav-badge">{wishCount}</span>}
          </NavLink>
          <NavLink to="/cart" className="desktop-nav-icon">
            <span className="nav-icon-symbol">🛒</span>
            <span>Cart</span>
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className="desktop-nav-icon">
                <span className="nav-icon-symbol">👤</span>
                <span>{user.username}</span>
              </NavLink>
              <button className="btn-nav-ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-nav-ghost">
                Login
              </NavLink>
              <NavLink to="/register" className="btn-nav-primary">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
