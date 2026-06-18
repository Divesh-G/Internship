import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    const res = await api.get("/cart/");
    setCart(res.data);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(variantId, quantity = 1) {
    const res = await api.post("/cart/items/", { variant_id: variantId, quantity });
    setCart(res.data);
  }

  async function updateItem(itemId, quantity) {
    const res = await api.patch(`/cart/items/${itemId}/`, { quantity });
    setCart(res.data);
  }

  async function removeItem(itemId) {
    const res = await api.delete(`/cart/items/${itemId}/`);
    setCart(res.data);
  }

  async function clear() {
    await api.delete("/cart/");
    setCart((prev) => (prev ? { ...prev, items: [], total: 0 } : prev));
  }

  return (
    <CartContext.Provider value={{ cart, refresh, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
