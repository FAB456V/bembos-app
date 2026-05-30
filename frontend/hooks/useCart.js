import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addItem(product) {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.productId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product.productId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, cantidad: 1 }];
    });
  }

  function removeItem(productId) {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }

  function changeQuantity(productId, quantity) {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId ? { ...item, cantidad: quantity } : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce(
    (sum, item) => sum + item.cantidad * item.precioUnitario,
    0
  );

  const value = useMemo(
    () => ({ addItem, changeQuantity, clearCart, items, removeItem, total }),
    [items, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart debe utilizarse dentro de CartProvider');
  }

  return context;
}
