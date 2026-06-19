import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const TABS = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/categories", label: "Categories", icon: "🗂️" },
  { to: "/cart", label: "Cart", icon: "🛒", badge: "cart" },
  { to: "/wishlist", label: "Wishlist", icon: "❤️", badge: "wishlist" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const { cart } = useCart();
  const { items: wishItems } = useWishlist();
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const wishCount = wishItems?.length ?? 0;

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const count = tab.badge === "cart" ? cartCount : tab.badge === "wishlist" ? wishCount : 0;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
          >
            <span className="bottom-nav-icon">
              {tab.icon}
              {count > 0 && <span className="bottom-nav-badge">{count}</span>}
            </span>
            <span className="bottom-nav-label">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
