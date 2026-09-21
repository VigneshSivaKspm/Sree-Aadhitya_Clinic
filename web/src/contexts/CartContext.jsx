import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { readJSON, writeJSON } from '../utils/storage';

const CART_KEY = 'aah_cart_v1';
const CartContext = createContext(null);

const clamp = (qty, max) => Math.max(0, Math.min(Math.floor(qty) || 0, max || 99));

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { item, quantity } = action;
      const existing = state.find((i) => i.productId === item.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === item.productId ? { ...i, ...item, quantity: clamp(i.quantity + quantity, item.maxQty) } : i,
        );
      }
      return [...state, { ...item, quantity: clamp(quantity, item.maxQty) }];
    }
    case 'set':
      return state
        .map((i) => (i.productId === action.productId ? { ...i, quantity: clamp(action.quantity, i.maxQty) } : i))
        .filter((i) => i.quantity > 0);
    case 'remove':
      return state.filter((i) => i.productId !== action.productId);
    case 'replace':
      return action.items;
    case 'clear':
      return [];
    default:
      return state;
  }
}

const load = () => {
  const saved = readJSON(CART_KEY, []);
  return Array.isArray(saved)
    ? saved.filter((i) => i && i.productId && Number(i.quantity) > 0 && Number.isFinite(Number(i.price)))
    : [];
};

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Persist across refreshes.
  useEffect(() => writeJSON(CART_KEY, items), [items]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e) => e.key === CART_KEY && dispatch({ type: 'replace', items: load() });
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addProduct = useCallback((product, quantity = 1) => {
    const stock = Number(product.stockQuantity) || 0;
    if (product.inStock === false || stock <= 0) return { ok: false, message: 'This product is out of stock.' };
    const inCart = items.find((i) => i.productId === product.id)?.quantity || 0;
    if (inCart >= stock) return { ok: false, message: `You already have the maximum available (${stock}) in your cart.` };
    dispatch({
      type: 'add',
      quantity,
      item: {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku || '',
        image: product.images?.[0] || '',
        price: Number(product.price),
        maxQty: stock,
      },
    });
    return { ok: true, message: inCart + quantity > stock ? `Only ${stock} available — quantity adjusted.` : 'Added to cart.' };
  }, [items]);

  const setQuantity = useCallback((productId, quantity) => dispatch({ type: 'set', productId, quantity }), []);
  const removeItem = useCallback((productId) => dispatch({ type: 'remove', productId }), []);
  const replaceItems = useCallback((next) => dispatch({ type: 'replace', items: next }), []);
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addProduct,
      setQuantity,
      removeItem,
      replaceItems,
      clearCart,
      drawerOpen,
      openCart: () => setDrawerOpen(true),
      closeCart: () => setDrawerOpen(false),
    }),
    [items, addProduct, setQuantity, removeItem, replaceItems, clearCart, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
