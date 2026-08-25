import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);
const STORAGE_KEY = "sajilo_wishlist";

export function WishlistProvider({ children }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!loading && !user) {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, loading]);

  function isWishlisted(slug) {
    return items.some((p) => p.slug === slug);
  }

  function toggle(product) {
    setItems((prev) =>
      prev.some((p) => p.slug === product.slug)
        ? prev.filter((p) => p.slug !== product.slug)
        : [...prev, product]
    );
  }

  function remove(slug) {
    setItems((prev) => prev.filter((p) => p.slug !== slug));
  }

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggle, remove }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
