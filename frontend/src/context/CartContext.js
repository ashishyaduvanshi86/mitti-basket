import { createContext, useContext, useState, useCallback, useEffect } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "mitti_basket_cart";

function loadCart() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback((product, quantity) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          basePrice: product.basePrice,
          minQty: product.minQty || 1,
          qtyUnit: product.qtyUnit || "kg",
          unit: product.unit,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + 1, 0);

  const subtotal = items.reduce((sum, item) => {
    const multiplier = item.quantity / item.minQty;
    return sum + Math.round(item.basePrice * multiplier);
  }, 0);

  const fmtQty = (item) => {
    if (item.qtyUnit === "gm" && item.quantity >= 1000)
      return `${item.quantity / 1000} kg`;
    return `${item.quantity} ${item.qtyUnit}`;
  };

  const getItemPrice = (item) => {
    return Math.round(item.basePrice * (item.quantity / item.minQty));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        fmtQty,
        getItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
